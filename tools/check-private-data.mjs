// tools/check-private-data.mjs
// 静态检查：页面 script 中通过 this.X = ... 赋值、但未在 export default 的 private 中声明的属性。
// 背景：AIoT/Vela 只把 private 中声明的属性作为模板数据源，未声明的属性赋值不会渲染（模板绑定为空）。
// 用法：node tools/check-private-data.mjs
import fs from 'node:fs'
import path from 'node:path'

const pagesDir = path.resolve(import.meta.dirname, '..', 'src', 'pages')
const pageFiles = []
for (const dir of fs.readdirSync(pagesDir)) {
  const p = path.join(pagesDir, dir, `${dir}.ux`)
  if (fs.existsSync(p)) pageFiles.push(p)
}

let failed = 0
for (const file of pageFiles) {
  const src = fs.readFileSync(file, 'utf8')
  // 提取 private: { ... } 块
  const m = /private\s*:\s*\{/.exec(src)
  if (!m) { console.log(`FAIL  ${path.basename(file)} 未找到 private 块`); failed++; continue }
  let i = m.index + m[0].length - 1
  let depth = 0
  let end = -1
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++
    else if (src[j] === '}') { depth--; if (depth === 0) { end = j; break } }
  }
  const block = src.slice(i + 1, end)
  const declared = new Set()
  for (const line of block.split(/\r?\n/u)) {
    const mm = /^\s*([A-Za-z_$][\w$]*)\s*:/.exec(line)
    if (mm) declared.add(mm[1])
    // 支持一行声明多个：a: '', b: ''
    const all = line.match(/([A-Za-z_$][\w$]*)\s*:/g)
    if (all) for (const a of all) declared.add(a.replace(/\s*:$/, ''))
  }
  // 支持 this['calCell' + i] = ... 形式的动态属性，跳过
  const assigned = new Set()
  const re = /this\.([A-Za-z_$][\w$]*)\s*=(?!=)/g
  let mm
  while ((mm = re.exec(src))) {
    const name = mm[1]
    if (name === 'setAwake') continue
    assigned.add(name)
  }
  const missing = [...assigned].filter((n) => !declared.has(n))
  if (missing.length) {
    console.log(`FAIL  ${path.basename(file)}：赋值但未在 private 声明 → ${missing.join(', ')}`)
    failed++
  } else {
    console.log(`PASS  ${path.basename(file)}（private ${declared.size} 项，赋值 ${assigned.size} 项均已声明）`)
  }
}
if (failed) { console.log(`\n${failed} 个页面存在未声明属性（模板会渲染为空）。`); process.exit(1) }
console.log('\n所有页面赋值属性均已声明在 private 中。')
