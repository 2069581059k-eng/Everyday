// tools/capture-zodiac.mjs
// 星象分析链路验收：首页 → 趣味星象遮罩 → 星象分析 → 答题页 → 完成 → 结果页
// 用法：VELA_RPK=<rpk路径> node tools/capture-zodiac.mjs
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
const outputDir = path.join(projectRoot, 'qa-zodiac')
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
    if (Date.now() - startedAt > 70000) throw new Error('模拟器启动超时')
    await wait(700)
  }
  const configAt = Date.now()
  while (!readRunningConfig()) {
    if (Date.now() - configAt > 20000) throw new Error('未找到模拟器 gRPC 配置')
    await wait(300)
  }
}

async function click(client, x, y, hold = 100) {
  client.sendMouse({ x, y, buttons: 1 })
  await wait(hold)
  client.sendMouse({ x, y, buttons: 0 })
  await wait(600)
}

async function shot(client, filename) {
  const image = await client.getScreenshot()
  if (!image || image.length < 1000) throw new Error(`截图为空：${filename}`)
  fs.writeFileSync(path.join(outputDir, filename), image)
  console.log(`${filename}: ${image.length} bytes`)
  runtimeLog.push(`${filename}: ${image.length} bytes`)
  return image.length
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true })
  if (!fs.existsSync(rpkPath)) throw new Error(`RPK 不存在：${rpkPath}`)
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

  const installed = JSON.parse(run(adbPath, ['-s', serial, 'shell', 'cat', `/data/app/${packageName}/manifest-watch.json`], 15000))
  if (installed.versionName !== manifest.versionName) {
    throw new Error(`模拟器版本不一致：期望 ${manifest.versionName}，实际 ${installed.versionName}`)
  }

  const client = createGrpcClient(readRunningConfig())
  try {
    await client.waitForReady()
    await shot(client, '01-home.png')
    // 点击「趣味星象」卡片（capture-vvd 已验证坐标 300,307）
    await click(client, 300, 307)
    await wait(800)
    await shot(client, '02-zodiac-mask.png')
    // 点击「星象分析 ›」（遮罩内按钮 left98 top368 宽140 高40）
    await click(client, 168, 388)
    await wait(2500)
    await shot(client, '03-zodiac-test.png')
    // 连续答题：选项 A 约 y=242
    for (let i = 0; i < 32; i++) {
      await click(client, 168, 242, 60)
    }
    await wait(2500)
    await shot(client, '04-zodiac-result.png')
    const logText = run(adbPath, ['-s', serial, 'shell', 'logcat', '-d', '-t', '400'], 20000)
    fs.writeFileSync(path.join(outputDir, 'logcat.txt'), logText)
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
