// 诊断5：埋点验证 —— handleBack 是否被触发（标题对照实验 + 计数器埋点）
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { createGrpcClient } = require('@aiot-toolkit/emulator/lib/vvd/grpc')

const runningDir = path.join(os.tmpdir(), 'avd', 'running')
let config = null
for (const name of fs.readdirSync(runningDir)) {
  if (!name.endsWith('.ini')) continue
  const cfg = {}
  for (const line of fs.readFileSync(path.join(runningDir, name), 'utf8').split(/\r?\n/u)) {
    const s = line.indexOf('=')
    if (s > 0) cfg[line.slice(0, s)] = line.slice(s + 1)
  }
  if (cfg['avd.name'] === 'Trae_AGI' && cfg['grpc.port']) config = cfg
}
if (!config) throw new Error('Trae_AGI gRPC 配置未找到')

const client = createGrpcClient(config)
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function tap(x, y) {
  client.sendMouse({ x, y, buttons: 1 })
  await wait(120)
  client.sendMouse({ x, y, buttons: 0 })
  await wait(1100)
}

async function step(label, x, y) {
  const before = await client.getScreenshot()
  await tap(x, y)
  const after = await client.getScreenshot()
  fs.writeFileSync(`D:/AGI/TraeCode/Temp/diag5-${label}.png`, after)
  console.log(`${label} (${x},${y}) changed:`, !after.equals(before))
}

try {
  await client.waitForReady()
  await step('1-enter-favorites', 246, 429)
  await step('2-tap-title', 116, 28) // 对照：标题也绑了 handleBack
  await step('3-tap-arrow', 30, 30)
} finally {
  client.close()
}
