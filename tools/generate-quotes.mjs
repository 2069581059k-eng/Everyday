import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const selectedPath = path.join(root, 'data', 'hitokoto-selected.json')
const knowledgePath = path.join(root, 'data', 'knowledge-selected.json')
const pagePath = path.join(root, 'src', 'pages', 'index', 'index.ux')
const expectedQuoteCount = 2000
const expectedKnowledgeCount = JSON.parse(fs.readFileSync(path.join(root, 'data', 'knowledge-sources.json'), 'utf8')).total

function compactSource(item) {
  const source = item.fromWho || item.from || '一言社区'
  return Array.from(source).slice(0, 16).join('')
}

const selected = JSON.parse(fs.readFileSync(selectedPath, 'utf8'))
const riddles = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'))
if (riddles.length !== expectedKnowledgeCount || riddles.length > 5000) {
  throw new Error(`真实知识题库应为 ${expectedKnowledgeCount} 条，当前为 ${riddles.length} 条`)
}
for (const category of ['脑筋急转弯', '十万个为什么', '百科全书', '冷笑话', '鬼故事']) {
  const count = riddles.filter((item) => item.category === category).length
  if (!count) throw new Error(`${category}内容为空`)
}
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
const page = fs.readFileSync(pagePath, 'utf8').replace(/\r\n/g, '\n')
const riddleRows = riddles.map((riddle) => {
  return '  { question: ' + JSON.stringify(riddle.question) +
    ', category: ' + JSON.stringify(riddle.category) +
    ', answer: ' + JSON.stringify(riddle.answer) +
    ', explain: ' + JSON.stringify(riddle.explain) +
    ', source: ' + JSON.stringify(riddle.source) +
    ', displayMode: ' + JSON.stringify(riddle.displayMode || 'qa') + ' }'
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
  ? `米环运行页面中的 ${expectedQuoteCount} 条真实语录和 ${expectedKnowledgeCount} 条真实知识题已是最新。`
  : `已将 ${expectedQuoteCount} 条真实语录和 ${expectedKnowledgeCount} 条真实知识题内联到米环运行页面。`)
