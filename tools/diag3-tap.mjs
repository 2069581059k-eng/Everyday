// 诊断3：对照实验 —— 收藏室右滑 vs 知识页回退箭头（同构页面，定位是个案还是全局）
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

async function shot(label) {
  const image = await client.getScreenshot()
  fs.writeFileSync(`D:/AGI/TraeCode/Temp/diag3-${label}.png`, image)
  return image
}

async function tap(x, y) {
  client.sendMouse({ x, y, buttons: 1 })
  await wait(120)
  client.sendMouse({ x, y, buttons: 0 })
  await wait(1000)
}

// 快速右滑：x≥56 起点，6 步 × 8ms（项目实测手势参数）
async function swipeRight() {
  client.sendMouse({ x: 60, y: 240, buttons: 1 })
  for (let i = 1; i <= 6; i++) {
    await wait(8)
    client.sendMouse({ x: 60 + i * 32, y: 240, buttons: 1 })
  }
  await wait(8)
  client.sendMouse({ x: 252, y: 240, buttons: 0 })
  await wait(1000)
}

try {
  await client.waitForReady()
  const s0 = await shot('0-start')
  // 1. 收藏室列表右滑 → 应回主页（验证 onswipe 路径）
  await swipeRight()
  const s1 = await shot('1-after-swipe')
  console.log('swipe-right changed:', !s1.equals(s0))
  // 2. 主页 → 知识页（四宫格左下）
  await tap(90, 429)
  const s2 = await shot('2-knowledge')
  console.log('enter-knowledge changed:', !s2.equals(s1))
  // 3. 知识页回退箭头（30,30）
  await tap(30, 30)
  const s3 = await shot('3-knowledge-back')
  console.log('knowledge-back changed:', !s3.equals(s2))
} finally {
  client.close()
}
