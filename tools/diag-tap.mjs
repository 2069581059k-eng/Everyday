// 诊断：当前屏幕状态 + 单点响应测试（验证应用是否卡死）
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
console.log('grpc port', config['grpc.port'])

const client = createGrpcClient(config)
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
try {
  await client.waitForReady()
  const shot1 = await client.getScreenshot()
  fs.writeFileSync('D:/AGI/TraeCode/Temp/diag-1.png', shot1)
  console.log('shot1', shot1.length)
  client.sendMouse({ x: 30, y: 30, buttons: 1 })
  await wait(120)
  client.sendMouse({ x: 30, y: 30, buttons: 0 })
  await wait(1200)
  const shot2 = await client.getScreenshot()
  fs.writeFileSync('D:/AGI/TraeCode/Temp/diag-2.png', shot2)
  console.log('shot2', shot2.length, 'changed:', !shot2.equals(shot1))
} finally {
  client.close()
}
