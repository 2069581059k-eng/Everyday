// tools/check-undefined.mjs
// 静态检查：页面 <script> 中「被调用但未声明/未导入」的标识符。
// 起因：index.ux 曾出现 quoteIndex(...) 被调用却无定义（数据抽取时误删），
// 顶层求值即 ReferenceError，真机/模拟器直接黑屏，而当时的验收只查“调用存在”查不出。
// 用法：node tools/check-undefined.mjs [src/pages]
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const pagesDir = process.argv[2] ? path.resolve(root, process.argv[2]) : path.join(root, 'src', 'pages')

const BUILTINS = new Set([
  'Math', 'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'RegExp', 'Error', 'TypeError',
  'Map', 'Set', 'WeakMap', 'WeakSet', 'Promise', 'Symbol', 'BigInt', 'Proxy', 'Reflect',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent',
  'encodeURI', 'decodeURI', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
  'console', 'require', 'Function', 'eval', 'NaN', 'Infinity', 'undefined', 'globalThis',
  'if', 'for', 'while', 'switch', 'catch', 'return', 'typeof', 'new', 'function', 'do', 'else', 'case', 'in', 'of', 'delete', 'void', 'instanceof'
])

// 去掉注释与字符串，避免误报
function stripNoise(code) {
  let out = ''
  let i = 0
  while (i < code.length) {
    const c = code[i]
    const next = code[i + 1]
    if (c === '/' && next === '/') {
      while (i < code.length && code[i] !== '\n') i++
      continue
    }
    if (c === '/' && next === '*') {
      i += 2
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) i++
      i += 2
      continue
    }
    if (c === '"' || c === "'" || c === '`') {
      const quote = c
      i++
      while (i < code.length) {
        if (code[i] === '\\') { i += 2; continue }
        if (code[i] === quote) { i++; break }
        i++
      }
      out += '""'
      continue
    }
    out += c
    i++
  }
  return out
}

function collectDeclared(code) {
  const names = new Set()
  const patterns = [
    /(?:^|[\s;{}()])(?:function|class)\s+([A-Za-z_$][\w$]*)/g,
    /(?:^|[\s;{}()])(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g,
    /(?:const|let|var)\s*\{([^}]*)\}\s*=/g,
    /(?:const|let|var)\s*\[([^\]]*)\]\s*=/g,
    /(?:^|[\s;{}()])(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/g,
    // 对象方法简写：onInit() {} / success(data) {} —— 页面生命周期与回调
    /(?:^|[\s,{])([A-Za-z_$][\w$]*)\s*\([^()]*\)\s*\{/g
  ]
  for (const re of patterns) {
    let m
    while ((m = re.exec(code)) !== null) {
      if (m[1].includes(',')) {
        for (const part of m[1].split(',')) {
          const name = part.split(':').pop().trim().replace(/=.*$/, '').trim()
          if (/^[A-Za-z_$][\w$]*$/.test(name)) names.add(name)
        }
      } else if (/^[A-Za-z_$][\w$]*$/.test(m[1])) {
        names.add(m[1])
      }
    }
  }
  return names
}

function collectImported(code) {
  const names = new Set()
  const re = /import\s+(?:([A-Za-z_$][\w$]*)\s*,\s*)?(?:\{([^}]*)\}\s*)?from\s*['"][^'"]+['"]/g
  let m
  while ((m = re.exec(code)) !== null) {
    if (m[1]) names.add(m[1])
    if (m[2]) for (const part of m[2].split(',')) {
      const name = part.split(/\s+as\s+/).pop().trim()
      if (/^[A-Za-z_$][\w$]*$/.test(name)) names.add(name)
    }
  }
  return names
}

function collectCalls(code) {
  const calls = new Set()
  const re = /(^|[^.\w$])([A-Za-z_$][\w$]*)\s*\(/g
  let m
  while ((m = re.exec(code)) !== null) {
    calls.add(m[2])
  }
  return calls
}

function checkPage(uxPath) {
  const src = fs.readFileSync(uxPath, 'utf8').replace(/\r\n/g, '\n')
  const match = src.match(/<script>([\s\S]*?)<\/script>/)
  if (!match) return []
  const code = stripNoise(match[1])
  const declared = collectDeclared(code)
  const imported = collectImported(match[1])
  const calls = collectCalls(code)
  const missing = []
  for (const name of calls) {
    if (declared.has(name) || imported.has(name) || BUILTINS.has(name)) continue
    missing.push(name)
  }
  return missing
}

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(p, results)
    else if (entry.name.endsWith('.ux')) results.push(p)
  }
  return results
}

let failed = false
for (const page of walk(pagesDir)) {
  const missing = checkPage(page)
  const rel = path.relative(root, page)
  if (missing.length) {
    failed = true
    console.log('FAIL  ' + rel + ' 调用了未声明/未导入的标识符: ' + missing.join(', '))
  } else {
    console.log('PASS  ' + rel + ' 无未定义调用')
  }
}
if (failed) {
  console.error('\n存在未定义引用，运行时会抛 ReferenceError 导致页面黑屏。')
  process.exit(1)
}
console.log('\n未定义引用检查通过。')
