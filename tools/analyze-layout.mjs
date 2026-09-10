// tools/analyze-layout.mjs
// 轻量 PNG 像素分析（无第三方库）：通过检测按钮边框线，判断选项是否纵向堆叠。
// 原理：每个按钮有上下两条边框线（#d4c9ba）。4 个纵向堆叠 → 8 条边框线；
//       若被压成一行 → 只剩该行的上下 2 条。
// 用法：node tools/analyze-layout.mjs <png> [x0 x1 y0 y1] [期望边框线数]
import fs from 'node:fs'
import zlib from 'node:zlib'

function decodePng(file) {
  const buf = fs.readFileSync(file)
  let pos = 8
  let width = 0, height = 0, bitDepth = 0, colorType = 0
  const idat = []
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos)
    const type = buf.toString('ascii', pos + 4, pos + 8)
    const data = buf.subarray(pos + 8, pos + 8 + len)
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4)
      bitDepth = data[8]; colorType = data[9]
    } else if (type === 'IDAT') idat.push(data)
    else if (type === 'IEND') break
    pos += 12 + len
  }
  if (bitDepth !== 8) throw new Error('仅支持 8bit PNG')
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 0 ? 1 : 0
  if (!channels) throw new Error('不支持的 colorType ' + colorType)
  const raw = zlib.inflateSync(Buffer.concat(idat))
  const stride = width * channels
  const out = Buffer.alloc(height * stride)
  let prev = Buffer.alloc(stride)
  let rp = 0
  for (let y = 0; y < height; y++) {
    const filter = raw[rp++]
    const line = Buffer.from(raw.subarray(rp, rp + stride))
    rp += stride
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? line[x - channels] : 0
      const b = prev[x]
      const c = x >= channels ? prev[x - channels] : 0
      let v = line[x]
      if (filter === 1) v += a
      else if (filter === 2) v += b
      else if (filter === 3) v += (a + b) >> 1
      else if (filter === 4) {
        const p = a + b - c
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c)
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c)
      }
      line[x] = v & 0xff
    }
    line.copy(out, y * stride)
    prev = line
  }
  return { width, height, channels, data: out }
}

const file = process.argv[2]
const nums = process.argv.slice(3).map(Number).filter(Number.isFinite)
const expect = nums.length >= 5 ? nums[4] : 8
const img = decodePng(file)
const X0 = nums.length >= 1 ? nums[0] : 20
const X1 = nums.length >= 2 ? nums[1] : img.width - 20
const Y0 = nums.length >= 3 ? nums[2] : 0
const Y1 = nums.length >= 4 ? nums[3] : img.height
const ch = img.channels

// 边框色 #d4c9ba = (212,201,186)，容差 ±14
function isBorder(x, y) {
  const i = (y * img.width + x) * ch
  return Math.abs(img.data[i] - 212) <= 14 && Math.abs(img.data[i + 1] - 201) <= 14 && Math.abs(img.data[i + 2] - 186) <= 14
}

const borderRows = []
for (let y = Y0; y < Y1; y++) {
  let count = 0
  for (let x = X0; x < X1; x++) if (isBorder(x, y)) count++
  if (count >= 180) borderRows.push(y)
}
// 聚类连续边框行 → 一条边框线
const lines = []
for (const y of borderRows) {
  const last = lines[lines.length - 1]
  if (last && y - last.end <= 2) last.end = y
  else lines.push({ start: y, end: y })
}

console.log(`图像 ${img.width}x${img.height} 区域 x[${X0},${X1}] y[${Y0},${Y1}]`)
console.log(`检测到 ${lines.length} 条按钮边框线：`)
for (const l of lines) console.log(`  y ${l.start}..${l.end}`)
if (lines.length === expect) {
  console.log(`✅ 边框线数 = ${expect}，符合预期（4 个按钮纵向堆叠）`)
  process.exit(0)
}
if (lines.length === 2) {
  console.log('⚠️ 仅 2 条边框线 → 四个选项被压在同一行（重叠）')
} else {
  console.log(`⚠️ 边框线数 ${lines.length} ≠ 期望 ${expect}`)
}
process.exit(1)
