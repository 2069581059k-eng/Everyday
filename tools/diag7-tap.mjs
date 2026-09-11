// 诊断7：活区上边界探测 —— x≥45 时顶部是否存在死区
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { createGrpcClient } = require('@aiot-toolkit/emulator/lib/vvd/grpc')

const runningDir = path.join(os.tmpdir(), 'avd', 'running')
let config = null
for (const name of require('node:fs').readdirSync(runningDir)) {
  if (!name.endsWith('.ini')) continue
  const cfg = {}
  for (const line of require('node:fs').readFileSync(path.join(runningDir, name), 'utf8').split(/\r?\n/u)) {
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

try {
  await client.waitForReady()
  await tap(246, 429) // 进收藏室
  await tap(168, 138) // 进详情
  for (const [x, y] of [[45, 15], [50, 30], [60, 30], [70, 30], [46, 46]]) {
    const before = await client.getScreenshot()
    await tap(x, y)
    const after = await client.getScreenshot()
    const changed = !after.equals(before)
    console.log(`tap (${x},${y}) changed: ${changed}`)
    if (changed) await tap(168, 138) // 回列表了 → 重进详情
  }
} finally {
  client.close()
}
