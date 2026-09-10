// tools/color-census.mjs
// 区域颜色普查：判断文字是否以"接近背景/白色"的颜色渲染（白字白底会看不见）
// 用法：node tools/color-census.mjs <png> <x0> <x1> <y0> <y1>
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

const [file, x0s, x1s, y0s, y1s] = process.argv.slice(2)
const x0 = Number(x0s), x1 = Number(x1s), y0 = Number(y0s), y1 = Number(y1s)
const img = decodePng(file)
const { width, ch, data } = img
const hist = new Map()
let n = 0
for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
  const i = (y * width + x) * ch
  const k = data[i] + ',' + data[i + 1] + ',' + data[i + 2]
  hist.set(k, (hist.get(k) || 0) + 1)
  n++
}
const top = [...hist.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
console.log(`== ${file} 区域 x[${x0},${x1}] y[${y0},${y1}] 共 ${n} 像素，不同颜色 ${hist.size} 种`)
for (const [k, v] of top) {
  const [R, G, B] = k.split(',').map(Number)
  const lum = (R * 299 + G * 587 + B * 114) / 1000
  console.log(`  (${k}) ${(v / n * 100).toFixed(2)}%  亮度 ${lum.toFixed(0)}`)
}
const dark = [...hist.entries()].filter(([k]) => {
  const [R, G, B] = k.split(',').map(Number)
  return (R * 299 + G * 587 + B * 114) / 1000 < 150
}).reduce((a, e) => a + e[1], 0)
console.log(`  深色(疑似文字)像素占比: ${(dark / n * 100).toFixed(2)}%`)
