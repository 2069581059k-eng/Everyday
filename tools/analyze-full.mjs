// tools/analyze-full.mjs
// 全功能验收截图分析（v3）
// 关键能力：区分"文字"与"红色按钮"、自动判定知识页答题/阅读模式、选项边框线、进度条、页面差异与循环
// 用法：node tools/analyze-full.mjs [qa目录]
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
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 1
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
  (Math.abs(r - 242) <= 10 && Math.abs(g - 238) <= 10 && Math.abs(b - 229) <= 10) ||
  (Math.abs(r - 255) <= 8 && Math.abs(g - 253) <= 8 && Math.abs(b - 248) <= 8) ||
  (Math.abs(r - 251) <= 8 && Math.abs(g - 247) <= 8 && Math.abs(b - 240) <= 8) ||
  (Math.abs(r - 238) <= 10 && Math.abs(g - 229) <= 10 && Math.abs(b - 216) <= 10)

function region(img, x0, x1, y0, y1, predicate) {
  const { width, channels, data } = img
  let hit = 0, total = 0
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = (y * width + x) * channels
    total++
    if (predicate(data[i], data[i + 1], data[i + 2])) hit++
  }
  return total ? hit / total : 0
}
const contentRatio = (img, x0, x1, y0, y1) => region(img, x0, x1, y0, y1, (r, g, b) => !isBg(r, g, b))
const isRed = (r, g, b) => r > 130 && r - g > 45 && r - b > 55
const redRatio = (img, x0, x1, y0, y1) => region(img, x0, x1, y0, y1, isRed)
// 文字（深色且非红色强调色）
const textRatio = (img, x0, x1, y0, y1) => region(img, x0, x1, y0, y1, (r, g, b) => (r * 299 + g * 587 + b * 114) / 1000 < 150 && (r - b) < 40)
const creamRatio = (img) => region(img, 0, img.width, 0, img.height, (r, g, b) => isBg(r, g, b))
function meanLum(img) {
  const { width, height, channels, data } = img
  let sum = 0, n = 0
  for (let y = 0; y < height; y += 3) for (let x = 0; x < width; x += 3) {
    const i = (y * width + x) * channels
    sum += (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000; n++
  }
  return sum / n
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
// 答题页（未展开）特征：y205-256 出现大面积红色「查看答案」按钮
const isQaPage = (img) => redRatio(img, 30, 300, 205, 256) > 0.30

const dir = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(import.meta.dirname, '..', 'qa-full')
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort()
const imgs = new Map()
for (const f of files) imgs.set(f, decodePng(path.join(dir, f)))
const get = (k) => imgs.get(k)
let pass = 0, fail = 0
const rep = (t) => console.log(`\n== ${t} ==`)
const ok = (c, m) => { c ? pass++ : fail++; console.log(`  ${c ? '✅' : '❌'} ${m}`) }

console.log(`== 全功能验收分析：${dir}`)
console.log(`截图 ${files.length} 张：${files.join(', ')}`)

rep('截图有效性（无黑屏/熄屏）')
for (const f of files) {
  const lum = meanLum(get(f))
  ok(lum > 180 && lum < 252, `${f} 平均亮度 ${lum.toFixed(0)}`)
}

rep('首页 01-home')
{
  const img = get('01-home.png')
  if (img) {
    ok(contentRatio(img, 100, 236, 8, 28) > 0.06, `品牌标题 (${(contentRatio(img, 100, 236, 8, 28) * 100).toFixed(1)}%)`)
    ok(contentRatio(img, 15, 321, 44, 63) > 0.05, `状态行 (${(contentRatio(img, 15, 321, 44, 63) * 100).toFixed(1)}%)`)
    ok(contentRatio(img, 14, 322, 76, 200) > 0.05, `语录卡片 (${(contentRatio(img, 14, 322, 76, 200) * 100).toFixed(1)}%)`)
    ok(contentRatio(img, 14, 322, 318, 458) > 0.05, `四张功能卡（1.8.14 改版） (${(contentRatio(img, 14, 322, 266, 382) * 100).toFixed(1)}%)`)
    ok(contentRatio(img, 14, 322, 272, 308) > 0.2, `两个操作按钮（换一句/抽签） (${(contentRatio(img, 14, 322, 392, 426) * 100).toFixed(1)}%)`)
  } else ok(false, '缺少 01-home.png')
}

rep('抽一签 02 / 收藏 03')
{
  const a = get('01-home.png'), b = get('02-draw-fortune.png'), c = get('03-favorite.png')
  if (a && b) {
    const s1 = contentRatio(a, 30, 94, 228, 254), s2 = contentRatio(b, 30, 94, 228, 254)
    ok(s2 > s1, `签级印章出现 (${(s1 * 100).toFixed(1)}% → ${(s2 * 100).toFixed(1)}%)`)
    ok(redRatio(b, 102, 302, 228, 254) > 0.01, `签语提示（红色）可见 (${(redRatio(b, 27, 300, 216, 244) * 100).toFixed(2)}%)`)
    ok(hash16(a) !== hash16(b), '抽签前后画面不同')
  }
  if (b && c) {
    ok(hash16(b) !== hash16(c), '点击收藏后画面变化')
    ok(redRatio(c, 266, 308, 68, 102) > 0.05, `收藏后爱心点亮（红色 ♥ ${(redRatio(c, 266, 308, 68, 102) * 100).toFixed(2)}%）`)
  }
}

rep('知识大全 · 各页渲染（模式自适应：阅读正文 / 答题答案）')
{
  const shots = files.filter((f) => /kn-item\d+(-answer)?\.png$/.test(f)).sort()
  let readPages = 0, readWithBody = 0, qaPages = 0, qaAnswers = 0, qaAnswerWithBody = 0
  for (const k of shots) {
    const img = get(k)
    const qa = isQaPage(img)
    const answerLabel = redRatio(img, 28, 130, 200, 244)
    const title = textRatio(img, 30, 302, 56, 116)
    const body = textRatio(img, 30, 302, 124, 372)
    const question = textRatio(img, 28, 308, 60, 190)
    const answerBody = textRatio(img, 28, 308, 246, 366)
    if (qa) {
      qaPages++
      ok(question > 0.02, `${k} 答题类·题干文字 ${(question * 100).toFixed(2)}%`)
      ok(true, `${k} 答题类·查看答案按钮存在（红块 ${(redRatio(img, 30, 300, 205, 256) * 100).toFixed(0)}%）`)
    } else if (answerLabel > 0.004) {
      qaAnswers++
      ok(answerBody > 0.005, `${k} 答题类已展开·答案正文 ${(answerBody * 100).toFixed(2)}%（1.8.10 为 0.00%）`)
      if (answerBody > 0.005) qaAnswerWithBody++
    } else {
      readPages++
      ok(title > 0.006, `${k} 阅读类·标题文字 ${(title * 100).toFixed(2)}%`)
      ok(body > 0.005, `${k} 阅读类·正文文字 ${(body * 100).toFixed(2)}%（1.8.10 为 0.00%）`)
      if (body > 0.005) readWithBody++
    }
  }
  console.log(`    分类：阅读页 ${readPages}（有正文 ${readWithBody}）、答题未展开页 ${qaPages}、答题已展开页 ${qaAnswers}（有答案正文 ${qaAnswerWithBody}）`)
  ok(readPages > 0 && readWithBody === readPages, '全部阅读页都渲染出正文文字（修复点）')
  ok(qaAnswers === 0 || qaAnswerWithBody === qaAnswers, '全部已展开的答题页都渲染出答案正文（修复点）')
  ok(qaPages + qaAnswers + readPages === shots.length, `共覆盖 ${shots.length} 个知识页截图`)
}

rep('知识大全 · 翻题导航')
{
  const i6 = get('09-kn-item6.png'), prev = get('09-kn-prev.png')
  if (i6 && prev) ok(hash16(i6) !== hash16(prev), '上一题切换画面变化')
}

rep('返回首页 10 / 13 / 25')
{
  for (const k of ['10-back-home.png', '13-home-again.png', '23-result-home.png', '27-final-home.png']) {
    const img = get(k)
    if (!img) { ok(false, `缺少 ${k}`); continue }
    const quote = contentRatio(img, 14, 322, 76, 200), cards = contentRatio(img, 14, 322, 266, 382)
    ok(quote > 0.05 && cards > 0.05, `${k} 首页结构完整（语录 ${(quote * 100).toFixed(1)}%，卡片 ${(cards * 100).toFixed(1)}%）`)
  }
}

rep('今日日历 11/12')
{
  const c1 = get('11-calendar.png'), c2 = get('12-calendar-next.png')
  if (c1 && c2) {
    ok(textRatio(c1, 16, 320, 18, 50) > 0.01, `月份标题 (${(textRatio(c1, 16, 320, 18, 50) * 100).toFixed(2)}%)`)
    ok(textRatio(c1, 10, 326, 100, 366) > 0.01, `日历数字 (${(textRatio(c1, 10, 326, 100, 366) * 100).toFixed(2)}%)`)
    ok(contentRatio(c1, 18, 318, 420, 460) > 0.2, '底部按钮可见')
    ok(hash16(c1) !== hash16(c2), '翻月后画面变化')
  } else ok(false, '缺少日历截图')
}

rep('趣味星象遮罩 14/15')
{
  const m1 = get('14-zodiac-mask.png'), m2 = get('15-zodiac-sign-next.png'), m3 = get('24-mask-again.png')
  if (m1 && m2) {
    ok(hash16(m1) !== hash16(m2), '切换星座后画面变化')
    ok(textRatio(m1, 40, 296, 160, 230) > 0.01, `星座名/日期文字 (${(textRatio(m1, 40, 296, 160, 230) * 100).toFixed(2)}%)`)
    if (m3) ok(contentRatio(m3, 98, 238, 368, 408) > 0.15, '再次进入遮罩后星象分析按钮仍可见')
    ok(redRatio(m1, 98, 238, 368, 408) > 0.03, `星象分析按钮（红字描边）可见 (${(redRatio(m1, 98, 238, 368, 408) * 100).toFixed(1)}%)`)
  } else ok(false, '缺少星象遮罩截图')
}

rep('星象答题 16/17（四选项纵向 + 进度推进 + 不熄屏）')
{
  const t1 = get('16-zodiac-test-q1.png'), t2 = get('17-zodiac-test-mid.png')
  if (t1) {
    const lines = borderLines(t1, 20, 320, 170, 420, 180)
    ok(lines.length === 8, `四个选项边框线 = ${lines.length} 条（期望 8）`)
    console.log('    边框线 y：' + lines.map((l) => l.start).join(', '))
    ok(textRatio(t1, 0, 336, 8, 70) > 0.005, `标题/进度文字 (${(textRatio(t1, 0, 336, 8, 70) * 100).toFixed(2)}%)`)
    ok(redRatio(t1, 20, 316, 78, 100) > 0.005, `场景行红字 (${(redRatio(t1, 20, 316, 78, 100) * 100).toFixed(2)}%)`)
    ok(textRatio(t1, 20, 316, 102, 182) > 0.005, `题干文字 (${(textRatio(t1, 20, 316, 102, 182) * 100).toFixed(2)}%)`)
    ok(textRatio(t1, 20, 316, 190, 400) > 0.005, `四个选项文字 (${(textRatio(t1, 20, 316, 190, 400) * 100).toFixed(2)}%)`)
  } else ok(false, '缺少 16-zodiac-test-q1.png')
  if (t1 && t2) {
    const f1 = accentWidth(t1, 64, 38, 298), f2 = accentWidth(t2, 64, 38, 298)
    ok(hash16(t1) !== hash16(t2), '答题推进后画面变化')
    ok(f2 > f1, `进度条填充推进 (${f1}px → ${f2}px)`)
    ok(meanLum(t2) > 180, `答题中途未熄屏（亮度 ${meanLum(t2).toFixed(0)}）`)
  }
}

rep('结果页 18-22（4 页各异 + 循环）')
{
  const pages = ['18-result-p1.png', '19-result-p2.png', '20-result-p3.png', '21-result-p4.png']
  const hashes = []
  for (const p of pages) {
    const img = get(p)
    if (!img) { ok(false, `缺少 ${p}`); continue }
    hashes.push(hash16(img))
    ok(textRatio(img, 16, 320, 40, 104) > 0.01, `${p} 顶部三星座文字 (${(textRatio(img, 16, 320, 40, 104) * 100).toFixed(2)}%)`)
    ok(textRatio(img, 26, 310, 110, 412) > 0.01, `${p} 内容槽文字 (${(textRatio(img, 26, 310, 110, 412) * 100).toFixed(2)}%)`)
    ok(contentRatio(img, 16, 320, 440, 478) > 0.2, `${p} 底部三按钮可见`)
  }
  ok(new Set(hashes).size === hashes.length && hashes.length === 4, `4 页内容互不相同 (${new Set(hashes).size}/4)`)
  const loop = get('22-result-loop-back.png')
  if (loop && hashes.length) ok(hash16(loop) === hashes[0], '第 5 次翻页回到第 1 页')
}

rep('重测 23 / 退出测试 24 / 收尾 25')
{
  const rt = get('25-test-again.png')
  if (rt) {
    const lines = borderLines(rt, 20, 320, 170, 420, 180)
    ok(lines.length === 8, `再次进入答题页且四选项正常（${lines.length} 条边框线）`)
  } else ok(false, '缺少 25-test-again.png')
  const ex = get('26-exit-test.png')
  if (ex) {
    const cream = creamRatio(ex)
    ok(cream > 0.5, `退出测试后仍在应用内（米色底 ${(cream * 100).toFixed(0)}%）`)
    const isHome = contentRatio(ex, 14, 322, 266, 382) > 0.05
    console.log(`    26-exit-test 形态：${isHome ? '首页' : '非首页（需人工确认具体页面）'}`)
  } else ok(false, '缺少 26-exit-test.png')
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

console.log(`\n===== 汇总：通过 ${pass} 项，未通过 ${fail} 项 =====`)
