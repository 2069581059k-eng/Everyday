// 诊断4：几何修复验证 —— 主页→收藏室→详情→回退箭头→列表→回退箭头→主页
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
  fs.writeFileSync(`D:/AGI/TraeCode/Temp/diag4-${label}.png`, after)
  console.log(`${label} (${x},${y}) changed:`, !after.equals(before))
}

try {
  await client.waitForReady()
  const s0 = await client.getScreenshot()
  fs.writeFileSync('D:/AGI/TraeCode/Temp/diag4-0-home.png', s0)
  await step('1-enter-favorites', 246, 429)
  await step('2-open-detail', 168, 138)
  await step('3-arrow-to-list', 30, 30)
  await step('4-arrow-to-home', 30, 30)
} finally {
  client.close()
}
