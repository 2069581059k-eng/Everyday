// tools/capture-full.mjs
// 1.8.10 全功能模拟器验收：首页（抽签/收藏）→ 知识大全（答题/阅读）→ 今日日历（翻月）→ 趣味星象（遮罩/换星座/答题/结果分页/重测）
// 用法：VELA_RPK=<rpk路径> node tools/capture-full.mjs
// 坐标均来自 src/pages/*.ux 的绝对定位（336x480）
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { createGrpcClient } = require('@aiot-toolkit/emulator/lib/vvd/grpc')
const projectRoot = path.resolve(import.meta.dirname, '..')
const sdkHome = 'C:\\Users\\20695\\Documents\\NEWPRO~1\\CODEX_~1\\VELA-H~1\\VELA~1\\sdk'
const vvdHome = 'C:\\Users\\20695\\Documents\\NEWPRO~1\\CODEX_~1\\VELA-H~1\\VELA~1\\vvd'
const vvdName = 'Vela_Band10Pro_UI'
const packageName = 'com.dailyquote.band10pro'
const adbPath = 'C:\\Windows\\System32\\adb.exe'
const emulatorPath = path.join(sdkHome, 'emulator', 'windows-x86_64', 'emulator.exe')
const manifest = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src', 'manifest.json'), 'utf8'))
const rpkPath = process.env.VELA_RPK || path.join(projectRoot, 'dist', `${packageName}.debug.${manifest.versionName}.rpk`)
const outputDir = path.join(projectRoot, 'qa-full')
const runtimeLog = []
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

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
    for (const line of fs.readFileSync(path.join(runningDir, name), 'utf8').split(/\r?\n/u)) {
      const i = line.indexOf('=')
      if (i > 0) config[line.slice(0, i)] = line.slice(i + 1)
    }
    if (config['avd.name'] === vvdName && config['grpc.port']) return config
  }
  return null
}

async function waitForDevice() {
  const startedAt = Date.now()
  while (!deviceReady()) {
    if (Date.now() - startedAt > 90000) throw new Error('模拟器启动超时')
    await wait(700)
  }
  const configAt = Date.now()
  while (!readRunningConfig()) {
    if (Date.now() - configAt > 20000) throw new Error('未找到模拟器 gRPC 配置')
    await wait(300)
  }
}

async function click(client, x, y, hold = 80) {
  client.sendMouse({ x, y, buttons: 1 })
  await wait(hold)
  client.sendMouse({ x, y, buttons: 0 })
  await wait(650)
}

async function shot(client, filename) {
  const image = await client.getScreenshot()
  if (!image || image.length < 1000) throw new Error(`截图为空：${filename}`)
  fs.writeFileSync(path.join(outputDir, filename), image)
  console.log(`${filename}: ${image.length} bytes`)
  runtimeLog.push(`${filename}: ${image.length} bytes`)
  return image.length
}

// 依据源码坐标：
const P = {
  draw: [252, 409],        // 抽一签
  favorite: [285, 96],     // 收藏（quote-card 内）
  knowledge: [84, 409],    // 知识大全
  calendarCard: [88, 324], // 今日日历卡片
  astroCard: [248, 324],   // 趣味星象卡片
  zodAnalyze: [168, 388],  // 星象分析 ›
  zodClose: [168, 440],    // 遮罩返回主页
  zodNext: [302, 78],      // 遮罩 › 换星座
  knHome: [281, 34],       // 知识页 返回主页
  knReveal: [168, 232],    // 知识页 查看答案
  knNext: [265, 434],      // 知识页 下一题
  calNext: [275, 78],      // 日历 下月
  calHome: [248, 440],     // 日历 返回主页
  opt: [[168, 214], [168, 268], [168, 322], [168, 376]], // 星象选项 A/B/C/D
  ztExit: [168, 429],      // 星象测试 退出
  zrHome: [64, 459],       // 结果页 返回主页
  zrPage: [168, 459],      // 结果页 下一页
  zrRetest: [272, 459],    // 结果页 再测一次
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true })
  if (!fs.existsSync(rpkPath)) throw new Error(`RPK 不存在：${rpkPath}`)
  console.log(`使用 RPK：${rpkPath}`)
  let startedHere = false
  if (!deviceReady()) {
    startedHere = true
    const child = spawn(emulatorPath, [
      '-vela', '-avd', vvdName, '-show-kernel',
      '-network-user-mode-options', 'hostfwd=tcp:127.0.0.1:10055-10.0.2.15:101',
      '-qt-hide-window', '-qemu', '-device', 'virtio-snd,bus=virtio-mmio-bus.2',
      '-allow-host-audio', '-semihosting'
    ], { cwd: sdkHome, env: { ...process.env, ANDROID_AVD_HOME: vvdHome, ANDROID_SDK_HOME: path.dirname(vvdHome) }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
    child.stdout.on('data', (d) => runtimeLog.push(String(d)))
    child.stderr.on('data', (d) => runtimeLog.push(String(d)))
  }
  await waitForDevice()

  const serial = 'emulator-5554'
  const remoteRpk = `/data/quickapp/app/${packageName}.rpk`
  try {
    run(adbPath, ['-s', serial, 'shell', 'am', 'stop', packageName], 15000)
    await wait(1500)
    run(adbPath, ['-s', serial, 'shell', 'pm', 'uninstall', packageName], 15000)
    await wait(8000)
  } catch {}
  run(adbPath, ['-s', serial, 'push', rpkPath, remoteRpk])
  run(adbPath, ['-s', serial, 'shell', 'pm', 'install', remoteRpk], 60000)
  await wait(10000)
  run(adbPath, ['-s', serial, 'shell', 'am', 'start', packageName], 15000)
  await wait(12000)

  const watchText = run(adbPath, ['-s', serial, 'shell', 'cat', `/data/app/${packageName}/manifest-watch.json`], 15000)
  const installed = JSON.parse(watchText)
  runtimeLog.push(`installed: versionName=${installed.versionName} versionCode=${installed.versionCode}`)
  if (installed.versionName !== manifest.versionName) {
    throw new Error(`模拟器版本不一致：期望 ${manifest.versionName}，实际 ${installed.versionName}`)
  }
  if (Number(installed.versionCode) !== Number(manifest.versionCode)) {
    throw new Error(`模拟器 versionCode 不一致：期望 ${manifest.versionCode}，实际 ${installed.versionCode}`)
  }

  const client = createGrpcClient(readRunningConfig())
  try {
    await client.waitForReady()

    // ---------- 首页 ----------
    await shot(client, '01-home.png')
    await click(client, ...P.draw)                 // 抽一签
    await wait(600)
    await shot(client, '02-draw-fortune.png')
    await click(client, ...P.favorite)             // 收藏
    await wait(500)
    await shot(client, '03-favorite.png')

    // ---------- 知识大全（答题+阅读两种模式） ----------
    await click(client, ...P.knowledge)
    await wait(1500)
    await shot(client, '04-knowledge-1.png')
    for (let i = 2; i <= 4; i++) {
      await click(client, ...P.knReveal, 60)       // 答题类查看答案 / 阅读类无操作
      await wait(400)
      await shot(client, `05-knowledge-${i}-reveal.png`)
      await click(client, ...P.knNext)             // 下一题
      await wait(700)
      await shot(client, `06-knowledge-${i + 1}.png`)
    }
    await click(client, ...P.knHome)               // 返回主页
    await wait(1500)
    await shot(client, '07-back-home.png')

    // ---------- 今日日历 ----------
    await click(client, ...P.calendarCard)
    await wait(1500)
    await shot(client, '08-calendar.png')
    await click(client, ...P.calNext)              // 下月
    await wait(700)
    await shot(client, '09-calendar-next.png')
    await click(client, ...P.calHome)              // 返回主页
    await wait(1500)
    await shot(client, '10-home-again.png')

    // ---------- 趣味星象 ----------
    await click(client, ...P.astroCard)
    await wait(900)
    await shot(client, '11-zodiac-mask.png')
    await click(client, ...P.zodNext)              // 换星座
    await wait(600)
    await shot(client, '12-zodiac-next-sign.png')
    await click(client, ...P.zodAnalyze)           // 星象分析 ›
    await wait(2500)
    await shot(client, '13-zodiac-test-q1.png')

    // 30 题：A/B/C/D 轮转作答
    for (let i = 0; i < 15; i++) {
      await click(client, ...P.opt[i % 4], 50)
      await wait(200)
    }
    await wait(1200)
    await shot(client, '14-zodiac-test-mid.png')
    for (let i = 15; i < 30; i++) {
      await click(client, ...P.opt[i % 4], 50)
      await wait(200)
    }
    await wait(3000)
    await shot(client, '15-result-p1.png')

    // 结果页翻页（4 次到第 5 页，第 5 次回到第 1 页）
    for (let p = 2; p <= 5; p++) {
      await click(client, ...P.zrPage)
      await wait(1000)
      await shot(client, `16-result-p${p}.png`)
    }
    await click(client, ...P.zrPage)
    await wait(1000)
    await shot(client, '17-result-loop-back.png')

    // 再测一次 → 测试页
    await click(client, ...P.zrRetest)
    await wait(2500)
    await shot(client, '18-retest.png')
    await click(client, ...P.ztExit)               // 退出测试
    await wait(1500)
    await shot(client, '19-exit-to-result.png')
    await click(client, ...P.zrHome)               // 结果页返回主页
    await wait(1500)
    await shot(client, '20-final-home.png')

    const logText = run(adbPath, ['-s', serial, 'shell', 'logcat', '-d', '-t', '800'], 20000)
    fs.writeFileSync(path.join(outputDir, 'logcat.txt'), logText)
    const errorLines = logText.split(/\r?\n/u).filter((l) => /onError|pagehook executed failed|invalid pagename/i.test(l))
    fs.writeFileSync(path.join(outputDir, 'error-lines.txt'), errorLines.join('\n'), 'utf8')
    console.log(`关键错误行：${errorLines.length}`)
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
