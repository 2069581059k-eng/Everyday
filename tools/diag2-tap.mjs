// 诊断2：收藏详情页多点触摸测试 —— 定位是「仅回退箭头失效」还是「整页触摸失效」
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

async function tap(x, y, label) {
  const before = await client.getScreenshot()
  client.sendMouse({ x, y, buttons: 1 })
  await wait(120)
  client.sendMouse({ x, y, buttons: 0 })
  await wait(1200)
  const after = await client.getScreenshot()
  const changed = !after.equals(before)
  fs.writeFileSync(`D:/AGI/TraeCode/Temp/diag2-${label}.png`, after)
  console.log(`tap ${label} (${x},${y}) changed: ${changed}`)
  return changed
}

try {
  await client.waitForReady()
  const shot0 = await client.getScreenshot()
  fs.writeFileSync('D:/AGI/TraeCode/Temp/diag2-0-start.png', shot0)
  console.log('start shot', shot0.length)
  await tap(30, 30, '1-back-arrow') // 左上角回退箭头
  await tap(244, 430, '2-back-btn') // 详情页「返回列表」按钮
  await tap(30, 30, '3-back-arrow-again') // 再次回退箭头
} finally {
  client.close()
}
