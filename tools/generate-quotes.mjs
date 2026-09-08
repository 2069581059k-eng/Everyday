import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const selectedPath = path.join(root, 'data', 'hitokoto-selected.json')
const riddlesPath = path.join(root, 'data', 'riddles.json')
const pagePath = path.join(root, 'src', 'pages', 'index', 'index.ux')
const expectedQuoteCount = 2000

function compactSource(item) {
  const source = item.fromWho || item.from || '一言社区'
  return Array.from(source).slice(0, 16).join('')
}

const selected = JSON.parse(fs.readFileSync(selectedPath, 'utf8'))
const allRiddles = JSON.parse(fs.readFileSync(riddlesPath, 'utf8'))
// 运行包只内置真正的脑筋急转弯。decoy 是旧版选择题留下的可靠题型标记；
// 十万个为什么和百科资料仍保留在可审计源数据中，但不会进入每日题目。
const riddles = allRiddles.filter((item) => item.category === '脑筋急转弯' && item.decoy)
if (riddles.length < 100) throw new Error(`真正的脑筋急转弯不足 100 道，当前为 ${riddles.length} 道`)
if (selected.length !== expectedQuoteCount) {
  throw new Error(`真实语录应为 ${expectedQuoteCount} 条，当前为 ${selected.length} 条`)
}

const quotes = selected.map((item, index) => {
  return {
    text: item.text,
    note: item.category,
    source: compactSource(item),
    uuid: item.uuid
  }
})

const rows = quotes.map((quote) => {
  return '  { text: ' + JSON.stringify(quote.text) +
    ', note: ' + JSON.stringify(quote.note) +
    ', source: ' + JSON.stringify(quote.source) +
    ', uuid: ' + JSON.stringify(quote.uuid) + ' }'
})
const replacement = 'const QUOTES = [\n' + rows.join(',\n') + '\n]'
const page = fs.readFileSync(pagePath, 'utf8')
const riddleRows = riddles.map((riddle) => {
  const knowledge = riddle.knowledge ? ', knowledge: ' + JSON.stringify(riddle.knowledge) : ''
  return '  { question: ' + JSON.stringify(riddle.question) +
    ', category: ' + JSON.stringify(riddle.category || '脑筋急转弯') +
    ', answer: ' + JSON.stringify(riddle.answer) +
    ', decoy: ' + JSON.stringify(riddle.decoy) +
    ', explain: ' + JSON.stringify(riddle.explain) + knowledge + ' }'
})
const riddleReplacement = 'const RIDDLES = [\n' + riddleRows.join(',\n') + '\n]'
const riddlePattern = /const RIDDLES = \[[\s\S]*?\](?=\n\nconst QUOTES)/u
const quotePattern = /const QUOTES = \[[\s\S]*?\n\]\n\nfunction pad/u
if (!riddlePattern.test(page)) throw new Error('没有找到 index.ux 中的 RIDDLES 数据段')
if (!quotePattern.test(page)) throw new Error('没有找到 index.ux 中的 QUOTES 数据段')
const next = page
  .replace(riddlePattern, riddleReplacement)
  .replace(quotePattern, replacement + '\n\nfunction pad')
if (next !== page) fs.writeFileSync(pagePath, next, 'utf8')
console.log(next === page
  ? `米环运行页面中的 ${expectedQuoteCount} 条真实语录已是最新。`
  : `已将 ${expectedQuoteCount} 条真实语录内联到米环运行页面。`)
