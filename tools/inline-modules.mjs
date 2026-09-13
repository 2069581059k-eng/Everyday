// tools/inline-modules.mjs
// AIoT(Vela) 真机无法解析 ux 页面里 import '../../common/...' 自定义模块（RPK 只含页面 .jsc），
// 启动即黑屏。本工具在打包前递归地把自定义 import 替换为模块源码，页面自包含。
// 用法：node tools/inline-modules.mjs   （原地改写 src/pages/*/*.ux；构建后再 git restore）
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const pagesDir = path.join(root, 'src', 'pages')

function resolveModule(fromFile, spec) {
  if (spec.startsWith('@')) return null
  const base = path.resolve(path.dirname(fromFile), spec)
  const candidates = [base, base + '.js', base + '.json']
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c
  }
  return null
}

// 计算模块内联片段：返回 { code } 供嵌入页面 script（同一作用域）。
function inlineModule(modPath, defaultName, seen) {
  let src = fs.readFileSync(modPath, 'utf8').replace(/\r\n/g, '\n')
  // 该模块自身的 import 先内联（递归）
  src = inlineImports(src, modPath, seen)
  // default 导出：转为 const <name> = <expr>
  if (defaultName) {
    if (/^export default\s/m.test(src)) {
      src = src.replace(/^export default\s+/m, `const ${defaultName} = `)
    }
  }
  // 命名导出：去掉 export 关键字与尾部 export {..}
  src = src.replace(/^export function /gm, 'function ')
  src = src.replace(/^export const /gm, 'const ')
  src = src.replace(/^export \{[\s\S]*?\};?\s*$/gm, '')
  src = src.replace(/^export default /gm, 'const __default__ = ')
  return src.trim()
}

function inlineImports(content, fromFile, seen) {
  const re = /^import\s+(?:(\w+)\s+from\s+)?(?:\{([\s\S]*?)\}\s+from\s+)?['"]([^'"]+)['"];?\s*$/gm
  let out = ''
  let last = 0
  let m
  while ((m = re.exec(content)) !== null) {
    out += content.slice(last, m.index)
    const defaultName = (m[1] || '').trim()
    const namedList = (m[2] || '').split(',').map(s => s.trim()).filter(Boolean)
    const spec = m[3]
    const modPath = resolveModule(fromFile, spec)
    if (modPath) {
      // 1.8.23：同一页面内同一模块经多条 import 链引入时只内联一次，
      // 否则顶层 const（如 HOLIDAYS_2026）重复声明导致 UxLoader 解析失败
      if (seen.has(modPath)) {
        out += '\n// [bundled-dedup:' + path.basename(modPath) + ']\n'
      } else {
        seen.add(modPath)
        const code = inlineModule(modPath, defaultName, seen)
        out += '\n// [bundled:' + path.basename(modPath) + ']\n' + code + '\n'
      }
    } else {
      out += m[0] // 非本项目模块（@system 等）保留原样
    }
    last = m.index + m[0].length
  }
  out += content.slice(last)
  return out
}

function processPage(pageFile) {
  let src = fs.readFileSync(pageFile, 'utf8').replace(/\r\n/g, '\n')
  const scriptMatch = src.match(/(<script>)([\s\S]*?)(<\/script>)/)
  if (!scriptMatch) return
  const next = inlineImports(scriptMatch[2], pageFile, new Set())
  if (next !== scriptMatch[2]) {
    fs.writeFileSync(pageFile, src.replace(scriptMatch[2], next))
    console.log('inlined', path.relative(root, pageFile))
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(p)
    else if (entry.name.endsWith('.ux')) processPage(p)
  }
}

walk(pagesDir)
console.log('完成：自定义模块 import 已内联。')
