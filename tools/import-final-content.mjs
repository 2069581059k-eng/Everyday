import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import AdmZip from 'adm-zip'

const root = path.resolve(import.meta.dirname, '..')
const data = path.join(root, 'data')
const inputPath = path.join(data, 'final-input.json')
const archiveInfoPath = path.join(data, 'final-archive.json')
const write = (file, obj) => fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n')
let rows, archive
if (process.argv[2]) {
  const bytes = fs.readFileSync(process.argv[2])
  const zip = new AdmZip(bytes)
  const entries = zip.getEntries().filter(e => e.entryName.endsWith('/content_2000plus.json'))
  if (entries.length !== 1) throw new Error('最终包主 JSON 不唯一')
  rows = JSON.parse(entries[0].getData().toString('utf8'))
  archive = { filename: path.basename(process.argv[2]), entry: entries[0].entryName, sha256: crypto.createHash('sha256').update(bytes).digest('hex') }
} else {
  rows = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
  archive = JSON.parse(fs.readFileSync(archiveInfoPath, 'utf8'))
}
const expected = { '脑筋急转弯': 312, '十万个为什么': 290, '百科全书': 923, '冷笑话': 293, '鬼故事': 205 }
if (!Array.isArray(rows) || rows.length !== 2023 || rows.length > 5000) throw new Error('最终包数量异常')
const keys = new Set(), ids = new Set()
const selected = rows.map(r => {
  const qa = r.display_mode === 'qa'
  const question = qa ? r.question : r.title
  const answer = qa ? r.answer : r.title
  const explain = qa ? r.explanation || r.answer : r.content
  const key = String(question || '').normalize('NFKC').toLowerCase().replace(/[\p{P}\p{Z}\s]/gu, '')
  if (!key || !answer || !explain || keys.has(key) || ids.has(r.id) || !expected[r.category] || !['qa', 'card', 'story'].includes(r.display_mode)) throw new Error(`无效或重复条目 ${r.id}`)
  keys.add(key); ids.add(r.id)
  return { id: `final:${r.id}`, category: r.category, displayMode: r.display_mode, title: r.title, question, answer, explain,
    source: r.source || '米环综合内容库 V2', sourceId: r.source_id || String(r.id), sourceUrl: r.source_url || '', sourceLicense: r.source_license || '',
    provenance: { archive: archive.filename, archiveSha256: archive.sha256, inputId: r.id, sourceType: r.source_type || '', verification: r.source_url ? 'supplied-reference' : 'source-not-provided' } }
})
const counts = Object.fromEntries(Object.keys(expected).map(c => [c, selected.filter(r => r.category === c).length]))
if (JSON.stringify(counts) !== JSON.stringify(expected)) throw new Error('分类计数异常')
write(inputPath, rows)
write(archiveInfoPath, archive)
write(path.join(data, 'knowledge-selected.json'), selected)
write(path.join(data, 'knowledge-sources.json'), { total: selected.length, counts, policy: '按用户要求仅使用最终包，完全替换旧题库。原文不改写，缺失来源不补造。', archive, missingExternalSource: selected.filter(r => !r.sourceUrl).length })
write(path.join(data, 'knowledge-replacement-report.json'), { mode: 'replace', input: rows.length, output: selected.length, oldOnlyEntriesRetained: 0, counts, archive, sourceValidation: '验证与用户原包的一致性，未独立核实科普事实或创作来源' })
console.log(JSON.stringify({ total: selected.length, counts, mode: 'replace' }, null, 2))
