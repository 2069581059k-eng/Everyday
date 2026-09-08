import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import AdmZip from 'adm-zip'

const root = path.resolve(import.meta.dirname, '..')
const dataDir = path.join(root, 'data')
const archivePath = process.argv[2]
const read = (name) => JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'))
const write = (name, value) => fs.writeFileSync(path.join(dataDir, name), JSON.stringify(value, null, 2) + '\n')
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex')
export const normalize = (value) => String(value || '').normalize('NFKC').toLowerCase().replace(/[\p{P}\p{Z}\s]/gu, '')

fs.mkdirSync(path.join(dataDir, 'merge-inputs'), { recursive: true })
if (archivePath) {
  const bytes = fs.readFileSync(archivePath)
  const zip = new AdmZip(bytes)
  const entries = zip.getEntries().filter((e) => e.entryName.endsWith('/content_2000.json'))
  if (entries.length !== 1) throw new Error('压缩包主数据文件不唯一')
  const input = JSON.parse(entries[0].getData().toString('utf8'))
  if (!Array.isArray(input) || input.length !== 2000) throw new Error('输入应为 2000 条数组')
  write('merge-inputs/user-v2.json', input)
  write('merge-inputs/archive.json', { filename: path.basename(archivePath), sha256: hash(bytes), entry: entries[0].entryName })
}
if (!fs.existsSync(path.join(dataDir, 'merge-inputs/baseline-1.7.0.json'))) {
  if (read('knowledge-selected.json').length !== 2000) throw new Error('缺少原始 2000 条基线')
  write('merge-inputs/baseline-1.7.0.json', read('knowledge-selected.json'))
  write('merge-inputs/baseline-sources.json', read('knowledge-sources.json'))
}
const baseline = read('merge-inputs/baseline-1.7.0.json')
const incoming = read('merge-inputs/user-v2.json')
const archive = read('merge-inputs/archive.json')
const retained = [], duplicates = [], conflicts = []
const questions = new Map(), origins = new Map(), contents = new Map()
const originKey = (r) => r.sourceUrl && r.sourceId ? `${r.sourceUrl}#${r.sourceId}` : ''
function add(record, input) {
  const q = normalize(record.question)
  if (!q || !record.explain || !record.answer) throw new Error(`记录不完整：${record.id}`)
  const origin = originKey(record)
  const body = record.displayMode === 'card' ? normalize(record.explain) : ''
  const existing = questions.get(q) || (origin && origins.get(origin)) || (body && contents.get(body))
  if (existing) {
    duplicates.push({ input, removedId: record.id, keptId: existing.id, reason: questions.has(q) ? 'normalized-question-or-title' : origins.has(origin) ? 'same-source-record' : 'same-card-content' })
    if (normalize(existing.answer) !== normalize(record.answer) || normalize(existing.explain) !== normalize(record.explain)) {
      conflicts.push({ removedId: record.id, keptId: existing.id, policy: '保留旧库，输入原文保存在 merge-inputs', incomingAnswer: record.answer, keptAnswer: existing.answer })
    }
    return
  }
  retained.push(record)
  questions.set(q, record)
  if (origin) origins.set(origin, record)
  if (body) contents.set(body, record)
}
for (const item of baseline) add(item, 'baseline')
for (const item of incoming) {
  const card = item.display_mode === 'card'
  add({
    id: `user-v2:${item.id}`, category: item.category === '百科全书' ? '百科知识' : item.category,
    question: card ? item.title : item.question, answer: card ? item.title : item.answer,
    explain: card ? item.content : item.explanation || item.answer,
    displayMode: card ? 'card' : 'qa', title: item.title,
    source: item.source || '米环综合内容库 V2', sourceId: item.source_id || String(item.id),
    sourceUrl: item.source_url || '', sourceLicense: item.source_license || '',
    provenance: { archive: archive.filename, archiveSha256: archive.sha256, inputId: item.id, sourceType: item.source_type, verification: item.source_url ? 'supplied-reference' : 'source-not-provided' }
  }, 'user-v2')
}
if (retained.length > 5000) throw new Error('合并结果超过 5000 条，需明确筛选后再发布')
const counts = Object.fromEntries(['脑筋急转弯', '十万个为什么', '百科知识'].map(c => [c, retained.filter(r => r.category === c).length]))
const report = { baseline: baseline.length, incoming: incoming.length, total: retained.length, added: retained.length - baseline.length, removed: duplicates.length, counts, missingExternalSource: retained.filter(r => !r.sourceUrl).length, policy: '统一百科分类；按规范化问题/标题、来源记录、卡片全文去重；重复或冲突优先保留旧库。知识卡不补写问答，原文完整保留。', duplicates, conflicts }
write('knowledge-selected.json', retained)
write('knowledge-merge-report.json', report)
const sources = read('merge-inputs/baseline-sources.json')
write('knowledge-sources.json', { ...sources, selectionPolicy: report.policy, total: retained.length, counts, targets: counts, merge: { ...archive, baseline: baseline.length, incoming: incoming.length, removed: duplicates.length, missingExternalSource: report.missingExternalSource } })
console.log(JSON.stringify({ ...report, duplicates: duplicates.length, conflicts: conflicts.length }, null, 2))
