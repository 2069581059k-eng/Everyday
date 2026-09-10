// tools/analyze-full.mjs
// 1.8.10 全功能验收结果分析：分区内容检测、选项边框线、进度条填充、页面差异比对
// 用法：node tools/analyze-full.mjs [qa-full 目录]
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

function decodePng(file) {
  const buf = fs.readFileSync(file)
  let pos = 8, width = 0, height = 0, bitDepth = 0, colorType = 0
  const idat = []
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos)
    const type = buf.toString('ascii', pos + 4, pos + 8)
    const data = buf.subarray(pos + 8, pos + 8 + len)
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9] }
    else if (type === 'IDAT') idat.push(data)
    else if (type === 'IEND') break
    pos += 12 + len
  }
  if (bitDepth !== 8) throw new Error('仅支持 8bit PNG')
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 0 ? 1 : 0
  const raw = zlib.inflateSync(Buffer.concat(idat))
  const stride = width * channels
  const out = Buffer.alloc(height * stride)
  let prev = Buffer.alloc(stride), rp = 0
  for (let y = 0; y < height; y++) {
    const filter = raw[rp++]
    const line = Buffer.from(raw.subarray(rp, rp + stride)); rp += stride
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? line[x - channels] : 0
      const b = prev[x]
      const c = x >= channels ? prev[x - channels] : 0
      let v = line[x]
      if (filter === 1) v += a
      else if (filter === 2) v += b
      else if (filter === 3) v += (a + b) >> 1
      else if (filter === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c) }
      line[x] = v & 0xff
    }
    line.copy(out, y * stride); prev = line
  }
  return { width, height, channels, data: out }
}

const isBg = (r, g, b) =>
  (Math.abs(r - 242) <= 8 && Math.abs(g - 238) <= 8 && Math.abs(b - 229) <= 8) ||
  (Math.abs(r - 255) <= 7 && Math.abs(g - 253) <= 7 && Math.abs(b - 248) <= 7) ||
  (Math.abs(r - 251) <= 7 && Math.abs(g - 247) <= 7 && Math.abs(b - 240) <= 7) ||
  (Math.abs(r - 238) <= 8 && Math.abs(g - 229) <= 8 && Math.abs(b - 216) <= 8)

function regionRatio(img, x0, x1, y0, y1) {
  const { width, channels, data } = img
  let content = 0, total = 0
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = (y * width + x) * channels
    total++
    if (!isBg(data[i], data[i + 1], data[i + 2])) content++
  }
  return total ? content / total : 0
}

function borderLines(img, x0, x1, y0, y1, minCount = 180) {
  const { width, channels, data } = img
  const rows = []
  for (let y = y0; y < y1; y++) {
    let count = 0
    for (let x = x0; x < x1; x++) {
      const i = (y * width + x) * channels
      if (Math.abs(data[i] - 212) <= 14 && Math.abs(data[i + 1] - 201) <= 14 && Math.abs(data[i + 2] - 186) <= 14) count++
    }
    if (count >= minCount) rows.push(y)
  }
  const lines = []
  for (const y of rows) {
    const last = lines[lines.length - 1]
    if (last && y - last.end <= 2) last.end = y; else lines.push({ start: y, end: y })
  }
  return lines
}

// 统计某行内主色（红 #a83b2d）连续像素宽度 → 进度条填充
function accentWidth(img, y, x0, x1) {
  const { width, channels, data } = img
  let count = 0
  for (let x = x0; x < x1; x++) {
    const i = (y * width + x) * channels
    if (Math.abs(data[i] - 168) <= 30 && Math.abs(data[i + 1] - 59) <= 30 && Math.abs(data[i + 2] - 45) <= 30) count++
  }
  return count
}

function hash16(img) {
  const { width, height, channels, data } = img
  let h = 0
  for (let y = 0; y < height; y += 4) for (let x = 0; x < width; x += 4) {
    const i = (y * width + x) * channels
    h = (h * 31 + data[i] + data[i + 1] * 3 + data[i + 2] * 7) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

const dir = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(import.meta.dirname, '..', 'qa-full')
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort()
const imgs = new Map()
console.log(`== 1.8.10 全功能验收分析（${files.length} 张）==\n`)
console.log('文件'.padEnd(30) + '尺寸'.padEnd(12) + '内容占比')
for (const f of files) {
  const img = decodePng(path.join(dir, f))
  imgs.set(f, img)
  const ratio = regionRatio(img, 10, img.width - 10, 0, img.height)
  console.log(f.padEnd(30) + `${img.width}x${img.height}`.padEnd(12) + (ratio * 100).toFixed(1) + '%')
}

const rep = (t) => console.log(`\n== ${t} ==`)
const ok = (c, m) => console.log(`  ${c ? '✅' : '❌'} ${m}`)
const get = (k) => imgs.get(k)
const near = (a, b, tol) => Math.abs(a - b) <= tol

rep('首页 01-home')
{
  const img = get('01-home.png')
  if (img) {
    const brand = regionRatio(img, 100, 236, 8, 28)
    const stat = regionRatio(img, 15, 321, 44, 63)
    const quote = regionRatio(img, 14, 322, 76, 200)
    const cards = regionRatio(img, 14, 322, 266, 382)
    const btns = regionRatio(img, 14, 322, 392, 426)
    ok(brand > 0.06, `品牌标题有内容 (${(brand * 100).toFixed(1)}%)`)
    ok(stat > 0.05, `状态行有内容 (${(stat * 100).toFixed(1)}%)`)
    ok(quote > 0.05, `语录卡片有内容 (${(quote * 100).toFixed(1)}%)`)
    ok(cards > 0.05, `两张功能卡片有内容 (${(cards * 100).toFixed(1)}%)`)
    ok(btns > 0.2, `两个操作按钮有内容 (${(btns * 100).toFixed(1)}%)`)
  } else ok(false, '缺少 01-home.png')
}

rep('抽签 02-draw-fortune（签级+提示应出现）')
{
  const a = get('01-home.png'), b = get('02-draw-fortune.png')
  if (a && b) {
    // 签级印章区（quote-card 内 top37）：abs x30..88 y113..142
    const stampA = regionRatio(a, 26, 92, 110, 146)
    const stampB = regionRatio(b, 26, 92, 110, 146)
    const tipB = regionRatio(b, 27, 300, 220, 240) // 签语提示行
    ok(stampB > stampA, `抽签后签级印章区内容增加 (${(stampA * 100).toFixed(1)}% → ${(stampB * 100).toFixed(1)}%)`)
    ok(stampB > 0.1, `签级印章可见 (${(stampB * 100).toFixed(1)}%)`)
    ok(tipB > 0.03, `签语提示行可见 (${(tipB * 100).toFixed(1)}%)`)
    ok(hash16(a) !== hash16(b), '抽签前后画面不同')
  } else ok(false, '缺少抽签截图')
}

rep('收藏 03-favorite（按钮文案应变化）')
{
  const b = get('02-draw-fortune.png'), c = get('03-favorite.png')
  if (b && c) {
    const favB = regionRatio(b, 258, 312, 83, 110)
    const favC = regionRatio(c, 258, 312, 83, 110)
    ok(hash16(b) !== hash16(c), '点击收藏后画面变化')
    ok(favB > 0.02 && favC > 0.02, `收藏按钮有文案 (${(favB * 100).toFixed(1)}% → ${(favC * 100).toFixed(1)}%)`)
  } else ok(false, '缺少收藏截图')
}

rep('知识大全 04-06（答题/阅读两种模式）')
{
  const k1 = get('04-knowledge-1.png'), k2 = get('05-knowledge-2-reveal.png')
  const k3 = get('06-knowledge-3.png'), k4 = get('05-knowledge-4-reveal.png')
  const k5 = get('06-knowledge-5.png')
  const list = [['04-knowledge-1', k1], ['06-knowledge-3', k3], ['06-knowledge-5', k5]]
  for (const [name, img] of list) {
    if (!img) { ok(false, `缺少 ${name}.png`); continue }
    const kicker = regionRatio(img, 28, 178, 22, 42)
    const qbox = regionRatio(img, 28, 308, 60, 190)
    const bar = regionRatio(img, 28, 308, 412, 460)
    ok(kicker > 0.08, `${name}: 分类标签有内容 (${(kicker * 100).toFixed(1)}%)`)
    ok(qbox > 0.05, `${name}: 题干/正文区有内容 (${(qbox * 100).toFixed(1)}%)`)
    ok(bar > 0.05, `${name}: 底部导航有内容 (${(bar * 100).toFixed(1)}%)`)
  }
  if (k1 && k2) ok(hash16(k1) !== hash16(k2), '查看答案后画面变化（答题类展开答案）')
  if (k4 && k5) ok(hash16(k4) !== hash16(k5), '阅读类下一步后画面变化')
  if (k2 && k4) {
    const ansBox = regionRatio(k2, 16, 296, 190, 394)
    const readBox = regionRatio(k4, 18, 294, 112, 360)
    ok(ansBox > 0.05, `答题类答案框有内容 (${(ansBox * 100).toFixed(1)}%)`)
    ok(readBox > 0.05, `阅读类正文区有内容 (${(readBox * 100).toFixed(1)}%)`)
  }
}

rep('返回首页 07 / 10 / 20')
{
  const h1 = get('01-home.png')
  for (const k of ['07-back-home.png', '10-home-again.png', '20-final-home.png']) {
    const img = get(k)
    if (!img) { ok(false, `缺少 ${k}`); continue }
    const cards = regionRatio(img, 14, 322, 266, 382)
    const quote = regionRatio(img, 14, 322, 76, 200)
    ok(cards > 0.05 && quote > 0.05, `${k}: 首页结构完整（语录 ${(quote * 100).toFixed(1)}%，卡片 ${(cards * 100).toFixed(1)}%）`)
    if (h1) ok(hash16(img) === hash16(h1), `${k}: 与首次首页一致`)
  }
}

rep('今日日历 08/09（网格+翻月）')
{
  const c1 = get('08-calendar.png'), c2 = get('09-calendar-next.png')
  if (c1 && c2) {
    const title = regionRatio(c1, 16, 320, 18, 50)
    const grid = regionRatio(c1, 10, 326, 100, 366)
    const btns = regionRatio(c1, 18, 318, 420, 460)
    ok(title > 0.05, `月份标题有内容 (${(title * 100).toFixed(1)}%)`)
    ok(grid > 0.05, `日历网格有内容 (${(grid * 100).toFixed(1)}%)`)
    ok(btns > 0.2, `底部按钮有内容 (${(btns * 100).toFixed(1)}%)`)
    ok(hash16(c1) !== hash16(c2), '翻月后画面变化')
    ok(regionRatio(c2, 16, 320, 18, 50) > 0.05, '翻月后标题仍有内容')
  } else ok(false, '缺少日历截图')
}

rep('趣味星象遮罩 11/12（换星座）')
{
  const m1 = get('11-zodiac-mask.png'), m2 = get('12-zodiac-next-sign.png')
  if (m1 && m2) {
    ok(hash16(m1) !== hash16(m2), '切换星座后画面变化')
    const name1 = regionRatio(m1, 40, 296, 170, 220)
    const analyze = regionRatio(m1, 98, 238, 368, 408)
    ok(name1 > 0.05, `星座名区有内容 (${(name1 * 100).toFixed(1)}%)`)
    ok(analyze > 0.2, `星象分析按钮可见 (${(analyze * 100).toFixed(1)}%)`)
  } else ok(false, '缺少星象遮罩截图')
}

rep('星象答题 13/14（四选项纵向 + 进度推进）')
{
  const t1 = get('13-zodiac-test-q1.png'), t2 = get('14-zodiac-test-mid.png')
  if (t1) {
    const lines = borderLines(t1, 20, 320, 170, 420, 180)
    ok(lines.length === 8, `四个选项边框线 = ${lines.length} 条（期望 8）`)
    console.log('    边框线 y：' + lines.map((l) => l.start).join(', '))
    const head = regionRatio(t1, 0, 336, 8, 70)
    const scene = regionRatio(t1, 20, 316, 78, 100)
    const q = regionRatio(t1, 20, 316, 102, 182)
    ok(head > 0.08, `标题/进度有内容 (${(head * 100).toFixed(1)}%)`)
    ok(scene > 0.05, `场景行有内容 (${(scene * 100).toFixed(1)}%)`)
    ok(q > 0.05, `题干有内容 (${(q * 100).toFixed(1)}%)`)
  } else ok(false, '缺少答题页截图')
  if (t1 && t2) {
    const fill1 = accentWidth(t1, 64, 38, 298)
    const fill2 = accentWidth(t2, 64, 38, 298)
    ok(hash16(t1) !== hash16(t2), '答题推进后画面变化')
    ok(fill2 > fill1, `进度条填充推进 (${fill1}px → ${fill2}px)`)
  }
}

rep('结果页 15-17（分页内容各异 + 循环）')
{
  const pages = ['15-result-p1.png', '16-result-p2.png', '16-result-p3.png', '16-result-p4.png', '16-result-p5.png']
  const hashes = []
  for (const p of pages) {
    const img = get(p)
    if (!img) { ok(false, `缺少 ${p}`); continue }
    hashes.push(hash16(img))
    const top3 = regionRatio(img, 16, 320, 40, 104)
    const slots = regionRatio(img, 26, 310, 112, 412)
    const actions = regionRatio(img, 16, 320, 440, 478)
    ok(top3 > 0.05 && slots > 0.05, `${p}: 顶部三星座+内容槽有内容 (${(top3 * 100).toFixed(1)}% / ${(slots * 100).toFixed(1)}%)`)
    ok(actions > 0.2, `${p}: 底部三按钮可见 (${(actions * 100).toFixed(1)}%)`)
  }
  const uniq = new Set(hashes)
  ok(uniq.size === hashes.length && hashes.length === 5, `5 页内容互不相同 (${uniq.size}/5 唯一)`)
  const loop = get('17-result-loop-back.png')
  if (loop && hashes.length) ok(hash16(loop) === hashes[0], '第 6 次翻页回到第 1 页')
  else ok(false, '缺少 17-result-loop-back.png')
}

rep('再测一次 / 退出 / 收尾 18-20')
{
  const rt = get('18-retest.png'), ex = get('19-exit-to-result.png')
  if (rt) {
    const lines = borderLines(rt, 20, 320, 170, 420, 180)
    ok(lines.length === 8, `重测进入答题页且四选项正常 (${lines.length} 条边框线)`)
  } else ok(false, '缺少 18-retest.png')
  if (ex) {
    const actions = regionRatio(ex, 16, 320, 440, 478)
    ok(actions > 0.2, `退出测试回到结果页 (${(actions * 100).toFixed(1)}%)`)
  } else ok(false, '缺少 19-exit-to-result.png')
}

rep('错误日志')
{
  const errFile = path.join(dir, 'error-lines.txt')
  if (fs.existsSync(errFile)) {
    const lines = fs.readFileSync(errFile, 'utf8').split(/\r?\n/u).filter(Boolean)
    ok(lines.length === 0, `onError / invalid pagename 关键错误：${lines.length} 行`)
    for (const l of lines.slice(0, 8)) console.log('    ' + l)
  } else ok(false, '缺少 error-lines.txt')
}
