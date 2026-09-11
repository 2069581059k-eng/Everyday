// 诊断6：箭头命中框扫查 —— 详情态逐点测试（成功会回列表，自动重进详情继续）
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

async function currentShot() { return client.getScreenshot() }

try {
  await client.waitForReady()
  // 主页 → 收藏室 → 详情
  await tap(246, 429)
  await tap(168, 138)
  let shot = await currentShot()
  fs.writeFileSync('D:/AGI/TraeCode/Temp/diag6-0-detail.png', shot)

  const points = [[30, 30], [25, 25], [35, 35], [30, 15], [15, 30], [45, 45]]
  for (const [x, y] of points) {
    const before = await currentShot()
    await tap(x, y)
    const after = await currentShot()
    const changed = !after.equals(before)
    console.log(`tap (${x},${y}) changed: ${changed}`)
    if (changed) {
      // 成功回了列表 → 重新进入详情继续扫查
      await tap(168, 138)
    }
  }
  const finalShot = await currentShot()
  fs.writeFileSync('D:/AGI/TraeCode/Temp/diag6-final.png', finalShot)
} finally {
  client.close()
}
