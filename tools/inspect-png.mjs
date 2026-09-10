// tools/inspect-png.mjs
// 诊断用：输出 PNG 的主要颜色分布与粗粒度色块图，用于判定截图是白屏/黑屏/正常页面。
// 用法：node tools/inspect-png.mjs <png...>
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

for (const f of process.argv.slice(2)) {
  const img = decodePng(f)
  const { width, height, ch, data } = img
  const hist = new Map()
  for (let y = 0; y < height; y += 2) for (let x = 0; x < width; x += 2) {
    const i = (y * width + x) * ch
    const k = data[i] + ',' + data[i + 1] + ',' + data[i + 2]
    hist.set(k, (hist.get(k) || 0) + 1)
  }
  const top = [...hist.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
  const tot = [...hist.values()].reduce((a, b) => a + b, 0)
  console.log('===== ' + f + ' ' + width + 'x' + height)
  console.log('  主要颜色: ' + top.map((e) => '(' + e[0] + ') ' + (e[1] / tot * 100).toFixed(1) + '%').join('  '))
  const rows = 24, cols = 56
  for (let r = 0; r < rows; r++) {
    let line = ''
    for (let c = 0; c < cols; c++) {
      const x = Math.floor(c * width / cols), y = Math.floor(r * height / rows)
      const i = (y * width + x) * ch
      const R = data[i], G = data[i + 1], B = data[i + 2]
      const lum = (R * 299 + G * 587 + B * 114) / 1000
      let s = '.'
      if (R > 200 && G > 200 && B > 200) s = 'W'
      else if (lum < 60) s = '#'
      else if (R > 120 && R - G > 40 && R - B > 40) s = 'R'
      else if (Math.abs(lum - 238) < 12) s = '.'
      else s = ':'
      line += s
    }
    console.log('   ' + line)
  }
}
