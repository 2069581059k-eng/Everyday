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

async function main() {
  fs.mkdirSync(outputDir, { recursive: true })
  const oldCaptures = [
    '01-cover.png', '02-today.png', '03-zodiac-next.png', '04-riddle.png',
    '05-riddle-result.png', '03-calendar.png', '03-zodiac.png',
    '04-zodiac.png', '04-zodiac-next.png', '05-calendar.png',
    '05-zodiac-next.png', '06-riddle.png', '07-riddle-answer.png'
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

  const serial = 'emulator-5554'
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
    await screenshot(client, '01-cover.png')
    if (process.env.VELA_CAPTURE_ONLY === '1') return
    await click(client, 168, 388)
    await wait(800)
    await screenshot(client, '02-today.png')
    await click(client, 300, 307)
    await screenshot(client, '03-zodiac.png')
    await click(client, 302, 78)
    await screenshot(client, '04-zodiac-next.png')
    await click(client, 168, 440)
    await click(client, 88, 320)
    await screenshot(client, '05-calendar.png')
    await click(client, 248, 440)
    await click(client, 84, 409)
    await screenshot(client, '06-riddle.png')
    await click(client, 168, 212)
    await screenshot(client, '07-riddle-answer.png')
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
