// tools/capture-full.mjs
// 全功能模拟器验收：首页（抽签/收藏）→ 知识大全（答题/阅读/翻题）→ 今日日历（翻月）→
// 趣味星象（遮罩/换星座/答题/结果分页/重测/退出）
// 用法：VELA_RPK=<rpk路径> node tools/capture-full.mjs
// 坐标全部取自 src/pages/*.ux 的绝对定位（336x480）
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import zlib from 'node:zlib'
import { spawn, spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

// 内置 PNG 解码（仅用于判断截图平均亮度，检测模拟器屏幕变暗/黑屏）
function decodePng(buf) {
  let pos = 8, width = 0, height = 0, bd = 0, ct = 0
  const idat = []
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos)
    const type = buf.toString('ascii', pos + 4, pos + 8)
    const d = buf.subarray(pos + 8, pos + 8 + len)
    if (type === 'IHDR') { width = d.readUInt32BE(0); height = d.readUInt32BE(4); bd = d[8]; ct = d[9] }
    else if (type === 'IDAT') idat.push(d)
    else if (type === 'IEND') break
    pos += 12 + len
  }
  const ch = ct === 6 ? 4 : ct === 2 ? 3 : 1
  const raw = zlib.inflateSync(Buffer.concat(idat))
  const stride = width * ch
  const out = Buffer.alloc(height * stride)
  let prev = Buffer.alloc(stride), rp = 0
  for (let y = 0; y < height; y++) {
    const f = raw[rp++]
    const line = Buffer.from(raw.subarray(rp, rp + stride)); rp += stride
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? line[x - ch] : 0, b = prev[x], c = x >= ch ? prev[x - ch] : 0
      let v = line[x]
      if (f === 1) v += a
      else if (f === 2) v += b
      else if (f === 3) v += (a + b) >> 1
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c) }
      line[x] = v & 0xff
    }
    line.copy(out, y * stride); prev = line
  }
  return { width, height, ch, data: out }
}

function meanLum(image) {
  try {
    const img = decodePng(image)
    const { width, height, ch, data } = img
    let sum = 0, n = 0
    for (let y = 0; y < height; y += 4) for (let x = 0; x < width; x += 4) {
      const i = (y * width + x) * ch
      sum += (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000; n++
    }
    return sum / n
  } catch { return -1 }
}

// 判断是否为"答题类未展开"页：答案区出现大面积红色实心按钮
function hasRedBlock(image) {
  try {
    const img = decodePng(image)
    const { width, ch, data } = img
    let red = 0, total = 0
    for (let y = 205; y < 256; y++) for (let x = 30; x < 300; x++) {
      const i = (y * width + x) * ch
      const R = data[i], G = data[i + 1], B = data[i + 2]
      total++
      if (R > 130 && R - G > 45 && R - B > 55) red++
    }
    return total > 0 && red / total > 0.30
  } catch { return false }
}

const require = createRequire(import.meta.url)
const { createGrpcClient } = require('@aiot-toolkit/emulator/lib/vvd/grpc')
const projectRoot = path.resolve(import.meta.dirname, '..')
// 环境隔离：SDK 只读共享（可用 WB_VELA_SDK 覆盖），AVD 数据与实例名独立在 D 盘
const sdkHome = process.env.WB_VELA_SDK || 'D:\\AGI\\WorkBuddy\\Simulator\\sdk'
const vvdHome = process.env.WB_VELA_AVD_HOME || 'D:\\AGI\\WorkBuddy\\Simulator\\vvd'
// 注意：Vela 模拟器对 VVD 实例名有白名单，自定义名会报 Unknown VVD name；
// 因此隔离靠“独立数据目录 + 独立端口 + 仅子进程环境变量”，实例名沿用受支持名。
const vvdName = process.env.WB_VELA_AVD || 'WorkBuddy_Band10Pro'
// 独立端口（避免与 Codex/Trae 实例冲突）：模拟器 5580 → adb serial emulator-5580，grpc 8580，hostfwd 10081
const emuPort = Number(process.env.WB_EMU_PORT || 5580)
const emuSerial = `emulator-${emuPort}`
const emuForward = Number(process.env.WB_EMU_FORWARD || 10081)

const packageName = 'com.dailyquote.band10pro'
const adbPath = 'C:\\Windows\\System32\\adb.exe'
const emulatorPath = path.join(sdkHome, 'emulator', 'windows-x86_64', 'emulator.exe')
const manifest = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src', 'manifest.json'), 'utf8'))
const rpkPath = process.env.VELA_RPK || path.join(projectRoot, 'dist', `${packageName}.debug.${manifest.versionName}.rpk`)
const outputDir = path.join(projectRoot, process.env.QA_DIR || 'qa-full')
let serial = `emulator-${Number(process.env.WB_EMU_PORT || 5580)}`
let startedHere = false
let lastLum = 226   // 最近一次截图平均亮度（用于点击前自动唤醒）
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

function deviceSerial() {
  const result = spawnSync(adbPath, ['devices'], { encoding: 'utf8', timeout: 5000, windowsHide: true })
  const ids = (result.stdout || '').split(/\r?\n/).map((l) => l.trim()).filter((l) => /\sdevice$/.test(l)).map((l) => l.split(/\s+/)[0])
  // 只认自己的实例端口，避免连到其它工具（Codex/Trae）的模拟器
  const mine = `emulator-${emuPort}`
  return ids.includes(mine) ? mine : null
}

function deviceReady() {
  return !!deviceSerial()
}

function readRunningConfig() {
  const expectedDir = path.join(vvdHome, vvdName + '.vvd').toLowerCase()
  const candidates = [
    path.join(os.tmpdir(), 'avd', 'running'),
    path.join(process.env.LOCALAPPDATA || '', 'Temp', 'avd', 'running'),
    'C:\\Users\\20695\\AppData\\Local\\Temp\\avd\\running'
  ]
  for (const runningDir of candidates) {
    if (!fs.existsSync(runningDir)) continue
    for (const name of fs.readdirSync(runningDir)) {
      if (!name.endsWith('.ini')) continue
      const config = {}
      for (const line of fs.readFileSync(path.join(runningDir, name), 'utf8').split(/\r?\n/u)) {
        const i = line.indexOf('=')
        if (i > 0) config[line.slice(0, i)] = line.slice(i + 1)
      }
      if (!config['avd.dir'] || !config['grpc.port']) continue
      // 精确匹配自己的数据目录，避免选到 Codex/Trae 的实例
      if (config['avd.dir'].toLowerCase() !== expectedDir) continue
      return config
    }
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
  if (lastLum < 170) await wakeScreen(client, serial)
  client.sendMouse({ x, y, buttons: 1 })
  await wait(hold)
  client.sendMouse({ x, y, buttons: 0 })
  await wait(650)
}

async function shot(client, filename) {
  // 模拟器 gRPC 偶发丢帧（response.image 为空）→ 重试
  let image = null
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      image = await client.getScreenshot()
      if (image && image.length >= 1000) break
    } catch (error) {
      runtimeLog.push(`截图异常(${attempt}/5)：${error?.message || error}`)
    }
    await wait(600)
  }
  if (!image || image.length < 1000) throw new Error(`截图为空：${filename}`)
  fs.writeFileSync(path.join(outputDir, filename), image)
  lastLum = meanLum(image)
  console.log(`${filename}: ${image.length} bytes (亮度 ${lastLum.toFixed(0)})`)
  runtimeLog.push(`${filename}: ${image.length} bytes lum=${lastLum.toFixed(0)}`)
  return image.length
}

// 模拟器首次启动/闲置会熄屏（纯黑截图），发 WAKEUP 并重试
// 唤醒模拟器屏幕：KEYCODE_WAKEUP 常常无效，需要在显示区外的底部边框轻点一下
async function wakeScreen(client, serial) {
  try { run(adbPath, ['-s', serial, 'shell', 'input', 'keyevent', 'KEYCODE_WAKEUP'], 10000) } catch {}
  try {
    client.sendMouse({ x: 168, y: 474, buttons: 1 })
    await wait(60)
    client.sendMouse({ x: 168, y: 474, buttons: 0 })
  } catch {}
  await wait(1600)
}

// 唤醒后截图：模拟器屏幕会变暗/进入低功耗态（截图呈黑底白字），按平均亮度判定并重试
async function shotAwake(client, filename, serial) {
  let last = null
  for (let attempt = 1; attempt <= 5; attempt++) {
    const len = await shot(client, filename)
    const image = fs.readFileSync(path.join(outputDir, filename))
    const lum = meanLum(image)
    last = { len, lum }
    if (lum >= 170) return len
    runtimeLog.push(`${filename} 亮度 ${lum.toFixed(0)} 偏暗，第 ${attempt} 次唤醒重试`)
    console.log(`${filename} 亮度 ${lum.toFixed(0)} 偏暗，唤醒重试 ${attempt}`)
    await wakeScreen(client, serial)
  }
  runtimeLog.push(`${filename} 最终亮度 ${last ? last.lum.toFixed(0) : 'n/a'}（偏低，已保存供诊断）`)
  return 0
}

// 坐标：均来自各页 .ux 的绝对定位
const P = {
  draw: [248, 290],        // 首页 抽签按钮（1.8.14 布局：quote-actions y272-308，右侧按钮 x174-322）
  favorite: [287, 85],     // 首页 爱心收藏（quote-card(14,62)+heart-btn(254,8)→中心 287,85）
  knowledge: [88, 425],    // 首页 知识大全卡（feature-grid(14,318) 左下卡）
  calendarCard: [88, 351], // 首页 今日日历卡（feature-grid 左上卡 中心）
  astroCard: [248, 351],   // 首页 趣味星象卡（feature-grid 右上卡 中心）
  zodAnalyze: [168, 388],  // 星象遮罩 星象分析 ›
  zodNext: [302, 78],      // 星象遮罩 › 换星座
  knHome: [281, 34],       // 知识页 返回主页
  knReveal: [168, 232],    // 知识页 查看答案
  knPrev: [71, 434],       // 知识页 上一题
  knNext: [265, 434],      // 知识页 下一题
  calNext: [275, 78],      // 日历 下月
  calHome: [248, 440],     // 日历 返回主页
  opt: [[168, 214], [168, 268], [168, 322], [168, 376]], // 星象选项 A/B/C/D
  ztExit: [168, 429],      // 星象测试 退出测试
  zrHome: [64, 459],       // 结果页 返回主页
  zrPage: [168, 459],      // 结果页 下一页
  zrRetest: [272, 459],    // 结果页 再测一次
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true })
  if (!fs.existsSync(rpkPath)) throw new Error(`RPK 不存在：${rpkPath}`)
  console.log(`使用 RPK：${rpkPath}`)
  if (!deviceReady()) {
    startedHere = true
    const child = spawn(emulatorPath, [
      '-vela', '-avd', vvdName, '-port', String(emuPort), '-grpc', String(emuPort + 3000), '-show-kernel',
      '-network-user-mode-options', `hostfwd=tcp:127.0.0.1:${emuForward}-10.0.2.15:101`,
      '-qt-hide-window', '-qemu', '-device', 'virtio-snd,bus=virtio-mmio-bus.2',
      '-allow-host-audio', '-semihosting'
    ], { cwd: sdkHome, env: { ...process.env, ANDROID_AVD_HOME: process.env.WB_VELA_REGISTRY || 'C:\\Users\\20695\\Documents\\New project\\.codex_tmp\\vela-home\\.vela\\vvd', ANDROID_SDK_HOME: path.dirname(sdkHome) }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
    child.stdout.on('data', (d) => runtimeLog.push(String(d)))
    child.stderr.on('data', (d) => runtimeLog.push(String(d)))
  }
  await waitForDevice()
  serial = deviceSerial() || serial
  console.log('模拟器串口：' + serial)
  runtimeLog.push('serial=' + serial)
  if (serial !== emuSerial) throw new Error(`串口不符：期望 WorkBuddy 自己的 ${emuSerial}，实际 ${serial}（可能存在其它实例）`)

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
  try { run(adbPath, ['-s', serial, 'shell', 'pm', 'clear', packageName], 15000) } catch {}
  try { run(adbPath, ['-s', serial, 'shell', 'settings', 'put', 'system', 'screen_off_timeout', '1800000'], 10000) } catch {}
  try { run(adbPath, ['-s', serial, 'shell', 'input', 'keyevent', 'KEYCODE_WAKEUP'], 10000) } catch {}
  run(adbPath, ['-s', serial, 'shell', 'am', 'start', packageName], 15000)
  await wait(12000)

  const watchText = run(adbPath, ['-s', serial, 'shell', 'cat', `/data/app/${packageName}/manifest-watch.json`], 15000)
  const installed = JSON.parse(watchText)
  runtimeLog.push(`installed: versionName=${installed.versionName} versionCode=${installed.versionCode}`)
  console.log(`模拟器安装版本：${installed.versionName} / ${installed.versionCode}`)
  // 期望版本以 RPK 文件名为准（可验收历史版本包），其次环境变量，最后回退源码 manifest
  const rpkVersion = (path.basename(rpkPath).match(/(\d+\.\d+\.\d+)\.rpk$/) || [])[1]
  const expectedVersion = process.env.VELA_EXPECT_VERSION || rpkVersion || manifest.versionName
  const expectedCode = process.env.VELA_EXPECT_CODE || (rpkVersion ? Number(rpkVersion.split('.').map((v, i) => (i === 0 ? v : String(v).padStart(2, '0'))).join('')) : manifest.versionCode)
  if (installed.versionName !== expectedVersion) {
    throw new Error(`模拟器版本不一致：期望 ${expectedVersion}（RPK ${path.basename(rpkPath)}），实际 ${installed.versionName}`)
  }
  if (Number(installed.versionCode) !== Number(expectedCode)) {
    throw new Error(`模拟器 versionCode 不一致：期望 ${expectedCode}，实际 ${installed.versionCode}`)
  }

  const client = createGrpcClient(readRunningConfig())
  try {
    await client.waitForReady()

    // ---------- 首页 ----------
    await shotAwake(client, '01-home.png', serial)
    await click(client, ...P.draw)                 // 抽一签
    await wait(700)
    await shotAwake(client, '02-draw-fortune.png', serial)
    await click(client, ...P.favorite)             // 收藏
    await wait(700)
    await shotAwake(client, '03-favorite.png', serial)

    // ---------- 知识大全（自适应：答题类展开答案，阅读类直接读正文） ----------
    await click(client, ...P.knowledge)
    await wait(1800)
    for (let idx = 1; idx <= 6; idx++) {
      const name = `0${3 + idx}-kn-item${idx}.png`
      await shotAwake(client, name, serial)
      const img = fs.readFileSync(path.join(outputDir, name))
      if (hasRedBlock(img)) {                      // 答题类未展开 → 点开答案
        await click(client, ...P.knReveal, 60)
        await wait(900)
        await shotAwake(client, `0${3 + idx}-kn-item${idx}-answer.png`, serial)
      }
      if (idx < 6) { await click(client, ...P.knNext); await wait(900) }
    }
    await click(client, ...P.knPrev)               // 上一题
    await wait(900)
    await shotAwake(client, '09-kn-prev.png', serial)
    await click(client, ...P.knHome)               // 返回主页
    await wait(1800)
    await shotAwake(client, '10-back-home.png', serial)

    // ---------- 今日日历 ----------
    await click(client, ...P.calendarCard)
    await wait(1800)
    await shotAwake(client, '11-calendar.png', serial)
    await click(client, ...P.calNext)              // 下月
    await wait(900)
    await shotAwake(client, '12-calendar-next.png', serial)
    await click(client, ...P.calHome)              // 返回主页
    await wait(1800)
    await shotAwake(client, '13-home-again.png', serial)

    // ---------- 趣味星象 ----------
    await click(client, ...P.astroCard)
    await wait(1000)
    await shotAwake(client, '14-zodiac-mask.png', serial)
    await click(client, ...P.zodNext)              // 换星座
    await wait(800)
    await shotAwake(client, '15-zodiac-sign-next.png', serial)
    await click(client, ...P.zodAnalyze)           // 星象分析 ›
    await wait(2500)
    await shotAwake(client, '16-zodiac-test-q1.png', serial)

    for (let i = 0; i < 15; i++) {                 // 前 15 题
      await click(client, ...P.opt[i % 4], 50)
      await wait(200)
    }
    await wait(1200)
    await shotAwake(client, '17-zodiac-test-mid.png', serial)
    for (let i = 15; i < 30; i++) {                // 后 15 题 → 出结果
      await click(client, ...P.opt[i % 4], 50)
      await wait(200)
    }
    await wait(3000)
    await shotAwake(client, '18-result-p1.png', serial)

    for (let p = 2; p <= 4; p++) {                 // 翻到第 4 页
      await click(client, ...P.zrPage)
      await wait(1000)
      await shotAwake(client, `${17 + p}-result-p${p}.png`, serial)
    }
    await click(client, ...P.zrPage)               // 循环回第 1 页
    await wait(1000)
    await shotAwake(client, '22-result-loop-back.png', serial)

    await click(client, ...P.zrHome)               // 结果页「返回主页」（验证结果页返回）
    await wait(1800)
    await shotAwake(client, '23-result-home.png', serial)

    await click(client, ...P.astroCard)            // 再次进入趣味星象遮罩
    await wait(1000)
    await shotAwake(client, '24-mask-again.png', serial)
    await click(client, ...P.zodAnalyze)           // 星象分析 › → 再次进入答题页
    await wait(2500)
    await shotAwake(client, '25-test-again.png', serial)
    await click(client, ...P.ztExit)               // 退出测试
    await wait(1800)
    await shotAwake(client, '26-exit-test.png', serial)
    const pidAfterExit = run(adbPath, ['-s', serial, 'shell', 'pidof', packageName], 10000).trim()
    runtimeLog.push(`退出测试后 pidof=${pidAfterExit || '(空)'}`)
    console.log(`退出测试后进程：${pidAfterExit || '(空，应用已退出)'}`)
    run(adbPath, ['-s', serial, 'shell', 'am', 'start', packageName], 15000)
    await wait(9000)
    await shotAwake(client, '27-final-home.png', serial)

    const logText = run(adbPath, ['-s', serial, 'shell', 'logcat', '-d', '-t', '900'], 20000)
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
  process.exit(0)
}

process.on('uncaughtException', (error) => {
  runtimeLog.push('uncaughtException: ' + (error?.stack || error))
  try {
    const dir = path.join(projectRoot, process.env.QA_DIR || 'qa-full')
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'runtime.log'), runtimeLog.join('\n') + '\n', 'utf8')
  } catch {}
  console.error('捕获未处理异常（模拟器 gRPC 偶发）：' + (error?.message || error))
  process.exit(1)
})
process.on('unhandledRejection', (error) => {
  runtimeLog.push('unhandledRejection: ' + (error?.stack || error))
  console.error('捕获未处理拒绝（模拟器 gRPC 偶发）：' + (error?.message || error))
})

main().catch((error) => {
  runtimeLog.push(String(error?.stack || error))
  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(path.join(outputDir, 'runtime.log'), `${runtimeLog.join('\n')}\n`, 'utf8')
  console.error(error)
  try { if (startedHere && process.env.VELA_KEEP_EMULATOR !== '1') spawnSync(adbPath, ['-s', serial, 'shell', 'poweroff'], { encoding: 'utf8', timeout: 5000, windowsHide: true }) } catch {}
  process.exit(1)
})
