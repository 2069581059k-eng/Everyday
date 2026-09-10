// tools/band-report.mjs
// 按行带输出内容密度（非背景像素占比），精确定位页面文字所在行。
// 用法：node tools/band-report.mjs <png> [x0 x1] [step]
import fs from 'node:fs'
import zlib from 'node:zlib'

function decodePng(file) {
  const buf = fs.readFileSync(file)
  let pos = 8, width = 0, height = 0, bd = 0, ct = 0
  const idat = []
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos)
    const t = buf.toString('ascii', pos + 4, pos + 8)
    const d = buf.subarray(pos + 8, pos + 8 + len)
    if (t === 'IHDR') { width = d.readUInt32BE(0); height = d.readUInt32BE(4); bd = d[8]; ct = d[9] }
    else if (t === 'IDAT') idat.push(d)
    else if (t === 'IEND') break
    pos += 12 + len
  }
  const ch = ct === 6 ? 4 : ct === 2 ? 3 : 1
  const raw = zlib.inflateSync(Buffer.concat(idat))
  const stride = width * ch
  const out = Buffer.alloc(height * stride)
  let prev = Buffer.alloc(stride), rp = 0
  for (let y = 0; y < height; y++) {
    const f = raw[rp++]
    const line = Buffer.from(raw.subarray(rp, rp + stride)); rp += stride
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? line[x - ch] : 0, b = prev[x], c = x >= ch ? prev[x - ch] : 0
      let v = line[x]
      if (f === 1) v += a
      else if (f === 2) v += b
      else if (f === 3) v += (a + b) >> 1
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c) }
      line[x] = v & 0xff
    }
    line.copy(out, y * stride); prev = line
  }
  return { width, height, ch, data: out }
}

const isBg = (r, g, b) =>
  (Math.abs(r - 242) <= 8 && Math.abs(g - 238) <= 8 && Math.abs(b - 229) <= 8) ||
  (Math.abs(r - 255) <= 7 && Math.abs(g - 253) <= 7 && Math.abs(b - 248) <= 7) ||
  (Math.abs(r - 251) <= 7 && Math.abs(g - 247) <= 7 && Math.abs(b - 240) <= 7) ||
  (Math.abs(r - 238) <= 8 && Math.abs(g - 229) <= 8 && Math.abs(b - 216) <= 8)

const file = process.argv[2]
const X0 = process.argv[3] ? Number(process.argv[3]) : 20
const X1 = process.argv[4] ? Number(process.argv[4]) : 316
const step = process.argv[5] ? Number(process.argv[5]) : 20
const img = decodePng(file)
const { width, ch, data, height } = img
console.log(`== ${file} (${width}x${height}) 行带密度 x[${X0},${X1}]`)
for (let y0 = 0; y0 < height; y0 += step) {
  const y1 = Math.min(height, y0 + step)
  let content = 0, total = 0
  for (let y = y0; y < y1; y++) for (let x = X0; x < X1; x++) {
    const i = (y * width + x) * ch
    total++
    if (!isBg(data[i], data[i + 1], data[i + 2])) content++
  }
  const pct = content / total * 100
  console.log(`  y ${String(y0).padStart(3)}-${String(y1).padStart(3)}  ${pct.toFixed(1).padStart(5)}%  ${'#'.repeat(Math.round(pct / 2))}`)
}
