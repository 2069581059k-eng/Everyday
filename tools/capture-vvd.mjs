import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { createGrpcClient } = require('@aiot-toolkit/emulator/lib/vvd/grpc')
const projectRoot = path.resolve(import.meta.dirname, '..')
// 环境隔离：SDK 只读共享（可用 WB_VELA_SDK 覆盖），AVD 数据与实例名独立在 D 盘
const sdkHome = process.env.WB_VELA_SDK || 'C:\\Users\\20695\\Documents\\NEWPRO~1\\CODEX_~1\\VELA-H~1\\VELA~1\\sdk'
const vvdHome = process.env.WB_VELA_AVD_HOME || 'D:\\AGI\\WorkBuddy\\Simulator\\avd'
const vvdName = process.env.WB_VELA_AVD || 'WorkBuddy_Band10Pro'
const packageName = 'com.dailyquote.band10pro'
const adbPath = 'C:\\Windows\\System32\\adb.exe'
const emulatorPath = path.join(sdkHome, 'emulator', 'windows-x86_64', 'emulator.exe')
const manifest = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src', 'manifest.json'), 'utf8'))
const rpkPath = process.env.VELA_RPK || path.join(projectRoot, 'dist', `${packageName}.debug.${manifest.versionName}.rpk`)
const outputDir = path.join(projectRoot, 'qa-emulator')
const runtimeLog = []
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

function run(file, args, timeout = 30000) {
  const result = spawnSync(file, args, { encoding: 'utf8', timeout, windowsHide: true })
  runtimeLog.push(`> ${path.basename(file)} ${args.join(' ')}`)
  if (result.stdout) runtimeLog.push(result.stdout.trim())
  if (result.stderr) runtimeLog.push(result.stderr.trim())
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${path.basename(file)} exited with ${result.status}`)
  return result.stdout || ''
}

function deviceReady() {
  const result = spawnSync(adbPath, ['devices'], { encoding: 'utf8', timeout: 5000, windowsHide: true })
  return /emulator-\d+\s+device/.test(result.stdout || '')
}

function readRunningConfig() {
  const runningDir = path.join(os.tmpdir(), 'avd', 'running')
  if (!fs.existsSync(runningDir)) return null
  for (const name of fs.readdirSync(runningDir)) {
    if (!name.endsWith('.ini')) continue
    const config = {}
    const lines = fs.readFileSync(path.join(runningDir, name), 'utf8').split(/\r?\n/u)
    for (const line of lines) {
      const separator = line.indexOf('=')
      if (separator > 0) config[line.slice(0, separator)] = line.slice(separator + 1)
    }
    if (config['avd.name'] === vvdName && config['grpc.port']) return config
  }
  return null
}

async function waitForDevice() {
  const startedAt = Date.now()
  while (!deviceReady()) {
    if (Date.now() - startedAt > 70000) throw new Error('Band 10 Pro 模拟器启动超时')
    await wait(700)
  }
  const configStartedAt = Date.now()
  while (!readRunningConfig()) {
    if (Date.now() - configStartedAt > 20000) throw new Error('未找到模拟器 gRPC 配置')
    await wait(300)
  }
}

async function click(client, x, y, hold = 100) {
  client.sendMouse({ x, y, buttons: 1 })
  await wait(hold)
  client.sendMouse({ x, y, buttons: 0 })
  await wait(650)
}

async function screenshot(client, filename) {
  const image = await client.getScreenshot()
  if (!image || image.length < 1000) throw new Error(`模拟器截图为空：${filename}`)
  fs.writeFileSync(path.join(outputDir, filename), image)
  runtimeLog.push(`${filename}: ${image.length} bytes`)
}

// 1.8.18：点击后检测画面变化，未变化自动重试（模拟器偶发丢触，QA 断言需要重试）
async function clickUntilChange(client, x, y, tries = 3, strict = false) {
  let before = null
  try { before = await client.getScreenshot() } catch (error) { before = null }
  for (let i = 0; i < tries; i++) {
    await click(client, x, y)
    await wait(900)
    let after = null
    try { after = await client.getScreenshot() } catch (error) { after = null }
    if (!before || !after || !after.equals(before)) return
  }
  // 1.8.23：关键链路场景 strict=true 时点击无响应直接判失败（空白页不可点曾仅 warn 漏过）
  if (strict) throw new Error(`click no-change after ${tries} tries at ${x},${y} (strict)`)
  console.log('warn: click no-change after', tries, 'tries at', x, y)
}

// 1.8.23：截图内容下限断言（整页空白/纯背景 PNG 约 4KB，正常渲染页面 ≥ 20KB）
function assertShotMinSize(filename, minBytes) {
  const target = path.join(outputDir, filename)
  const size = fs.existsSync(target) ? fs.statSync(target).size : 0
  if (size < minBytes) throw new Error(`${filename} 内容异常：${size}B < ${minBytes}B（疑似空白页）`)
}

// 1.8.20：首页右滑手势（gRPC 快速轻扫，起点 x≥56 避开系统边缘手势，6 步 × 8ms）
async function swipeRight(client) {
  const y = 240
  client.sendMouse({ x: 60, y, buttons: 1 })
  for (let i = 1; i <= 6; i++) {
    await wait(8)
    client.sendMouse({ x: 60 + i * 40, y, buttons: 1 })
  }
  await wait(8)
  client.sendMouse({ x: 300, y, buttons: 0 })
  await wait(650)
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true })
  const oldCaptures = [
    '01-cover.png', '02-today.png', '03-zodiac-next.png', '04-riddle.png',
    '05-riddle-result.png', '03-calendar.png', '03-zodiac.png',
    '04-zodiac.png', '04-zodiac-next.png', '05-calendar.png',
    '05-zodiac-next.png', '06-riddle.png', '07-riddle-answer.png',
    '01-home.png', '02-home-change.png', '08-riddle-next.png',
    '09-favorites.png', '10-favorite-detail.png',
    '11-zodiac-test.png', '12-zodiac-test-next.png', '13-zodiac-result.png',
    '00-exit-hint.png', '14-countdown.png', '15-countdown-add.png',
    '16-countdown-added.png', '17-countdown-removed.png'
  ]
  for (const filename of oldCaptures) {
    const target = path.join(outputDir, filename)
    if (fs.existsSync(target)) fs.unlinkSync(target)
  }
  if (!fs.existsSync(rpkPath)) throw new Error(`RPK 不存在：${rpkPath}`)
  let startedHere = false
  if (!deviceReady()) {
    startedHere = true
    const environment = {
      ...process.env,
      ANDROID_AVD_HOME: vvdHome,
      ANDROID_SDK_HOME: path.dirname(vvdHome)
    }
    const child = spawn(emulatorPath, [
      '-vela', '-avd', vvdName, '-show-kernel',
      '-network-user-mode-options', 'hostfwd=tcp:127.0.0.1:10055-10.0.2.15:101',
      '-qt-hide-window', '-qemu', '-device', 'virtio-snd,bus=virtio-mmio-bus.2',
      '-allow-host-audio', '-semihosting'
    ], { cwd: sdkHome, env: environment, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
    child.stdout.on('data', (data) => runtimeLog.push(String(data)))
    child.stderr.on('data', (data) => runtimeLog.push(String(data)))
  }
  await waitForDevice()

  const serial = process.env.VELA_SERIAL || 'emulator-5554'
  if (process.env.VELA_SKIP_INSTALL !== '1') {
    const remoteRpk = `/data/quickapp/app/${packageName}.rpk`
    try {
      run(adbPath, ['-s', serial, 'shell', 'am', 'stop', packageName], 15000)
      await wait(1500)
      run(adbPath, ['-s', serial, 'shell', 'pm', 'uninstall', packageName], 15000)
      await wait(8000)
    } catch {
      // 首次安装时没有旧包。
    }
    run(adbPath, ['-s', serial, 'push', rpkPath, remoteRpk])
    run(adbPath, ['-s', serial, 'shell', 'pm', 'install', remoteRpk], 60000)
    // Vela 的 pm install 命令会早于后台安装器完成返回。
    await wait(10000)
  }
  run(adbPath, ['-s', serial, 'shell', 'am', 'start', packageName], 15000)
  await wait(12000)
  const installedManifestText = run(
    adbPath,
    ['-s', serial, 'shell', 'cat', `/data/app/${packageName}/manifest-watch.json`],
    15000
  )
  const installedManifest = JSON.parse(installedManifestText)
  if (installedManifest.versionName !== manifest.versionName) {
    throw new Error(`模拟器版本不一致：期望 ${manifest.versionName}，实际 ${installedManifest.versionName}`)
  }

  const client = createGrpcClient(readRunningConfig())
  try {
    await client.waitForReady()
    await screenshot(client, '01-home.png')
    if (process.env.VELA_CAPTURE_ONLY === '1') return
    // 1.8.20：首页右滑一次 → 退出二次确认提示（主题卡片/屏幕最上方验收）；提示 3 秒自动消失后再继续
    await swipeRight(client)
    await screenshot(client, '00-exit-hint.png')
    await wait(3600)
    // 首页：换一句（1.8.18 四宫格布局坐标，导航点击带变化重试）
    await clickUntilChange(client, 92, 288)
    await screenshot(client, '02-home-change.png')
    // 星象遮罩：功能卡 → 切换星座
    await clickUntilChange(client, 246, 355)
    await screenshot(client, '03-zodiac.png')
    await clickUntilChange(client, 300, 160)
    await screenshot(client, '04-zodiac-next.png')
    // 遮罩回退箭头 → 回首页 → 日历页（1.8.18：回退箭头统一改点 (48,30)，模拟器左缘 x<40 为触摸抖动死区）
    await clickUntilChange(client, 48, 34)
    await clickUntilChange(client, 90, 355)
    await screenshot(client, '05-calendar.png')
    // 1.8.23：日历页 → 倒数日管理页（最近节日 + 列表）→ 添加一条（默认 生日/当日/每年）→ 删除复原（幂等）
    // 倒数日链路全 strict：任何一步点击无响应即失败 + 截图内容下限断言（防空白页漏过）
    await clickUntilChange(client, 168, 400, 3, true)
    await screenshot(client, '14-countdown.png')
    assertShotMinSize('14-countdown.png', 10000)
    await clickUntilChange(client, 168, 451, 3, true)
    await screenshot(client, '15-countdown-add.png')
    assertShotMinSize('15-countdown-add.png', 10000)
    await clickUntilChange(client, 92, 426, 3, true)
    await screenshot(client, '16-countdown-added.png')
    assertShotMinSize('16-countdown-added.png', 10000)
    await clickUntilChange(client, 284, 208, 3, true)
    await screenshot(client, '17-countdown-removed.png')
    assertShotMinSize('17-countdown-removed.png', 10000)
    // 倒数日回退箭头 → 回日历页（后续 (48,30) 点击回首页沿用既有流程）
    await clickUntilChange(client, 48, 34)
    // 回退箭头 → 回首页 → 知识页 → 查看答案 → 下一题
    await clickUntilChange(client, 48, 30)
    await clickUntilChange(client, 90, 429)
    await screenshot(client, '06-riddle.png')
    await clickUntilChange(client, 168, 374)
    await screenshot(client, '07-riddle-answer.png')
    await clickUntilChange(client, 265, 434)
    await screenshot(client, '08-riddle-next.png')
    // 回退 → 回首页点亮爱心（1.8.18 爱心在语录卡片右上角 289,95）→ 收藏室 → 收藏详情
    await clickUntilChange(client, 48, 30)
    await clickUntilChange(client, 289, 95)
    await clickUntilChange(client, 246, 429)
    await screenshot(client, '09-favorites.png')
    await clickUntilChange(client, 168, 138)
    await screenshot(client, '10-favorite-detail.png')
    // 详情回列表 → 回首页 → 星象遮罩 → 星象分析答题页
    await clickUntilChange(client, 48, 30)
    await clickUntilChange(client, 48, 30)
    await clickUntilChange(client, 246, 355)
    await clickUntilChange(client, 168, 362)
    await screenshot(client, '11-zodiac-test.png')
    await clickUntilChange(client, 168, 218)
    await screenshot(client, '12-zodiac-test-next.png')
    // 答完剩余 29 题（固定选 A），自动跳转星象分析结果页（星座插画验收）
    for (let i = 0; i < 29; i++) {
      await clickUntilChange(client, 168, 218, 4)
    }
    await wait(1500)
    await screenshot(client, '13-zodiac-result.png')
  } finally {
    client.close()
    fs.writeFileSync(path.join(outputDir, 'runtime.log'), `${runtimeLog.join('\n')}\n`, 'utf8')
    if (startedHere && process.env.VELA_KEEP_EMULATOR !== '1') {
      try { run(adbPath, ['-s', serial, 'shell', 'poweroff'], 5000) } catch {}
    }
  }
}

main().catch((error) => {
  runtimeLog.push(String(error?.stack || error))
  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(path.join(outputDir, 'runtime.log'), `${runtimeLog.join('\n')}\n`, 'utf8')
  console.error(error)
  process.exitCode = 1
})
