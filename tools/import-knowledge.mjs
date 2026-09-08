import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = path.resolve(import.meta.dirname, '..')
const workspace = path.resolve(root, '..')
const brainPagesDir = path.join(workspace, 'brainteaser-pages')
const cmrcFiles = ['train', 'dev'].map((split) => ({
  split,
  path: path.join(workspace, `cmrc2018_${split}.json`)
}))
const outputPath = path.join(root, 'data', 'knowledge-selected.json')
const manifestPath = path.join(root, 'data', 'knowledge-sources.json')

const TARGETS = {
  '脑筋急转弯': 400,
  '十万个为什么': 600,
  '百科知识': 1000
}

const SOURCES = {
  brain: {
    name: 'ChineseDatasets / brainteasers',
    revision: '5090c4f0fc9f2fab0e2de7d9d229f034b0524923',
    url: 'https://huggingface.co/datasets/ShakaRover/ChineseDatasets/tree/5090c4f0fc9f2fab0e2de7d9d229f034b0524923/brainteasers',
    license: 'Apache-2.0',
    note: '源数据提供谜面与谜底；仅选择原谜底本身带解释信息的记录，答案栏只截取其中可完整显示的原文短语。'
  },
  cmrc: {
    name: 'CMRC 2018',
    revision: 'master',
    url: 'https://github.com/ymcui/cmrc2018/tree/master/squad-style-data',
    license: 'CC-BY-SA-4.0',
    files: {
      train: {
        url: 'https://raw.githubusercontent.com/ymcui/cmrc2018/master/squad-style-data/cmrc2018_train.json',
        sha256: '5497aa2f81908e31d6b0e27d99b1f90ab63a8f58fa92fffe5d17cf62eba0c212'
      },
      dev: {
        url: 'https://raw.githubusercontent.com/ymcui/cmrc2018/master/squad-style-data/cmrc2018_dev.json',
        sha256: 'e9ff74231f05c230c6fa88b84441ee334d97234cbb610991cd94b82db00c7f1f'
      }
    },
    note: '问题由专家基于中文维基百科条目人工标注；答案与解析均直接截取官方答案或对应原文句。'
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
}

function clean(value) {
  return String(value || '')
    .replace(/<br\s*\/?>/giu, ' ')
    .replace(/<[^>]+>/gu, '')
    .replace(/&nbsp;|&#160;/giu, ' ')
    .replace(/[\u0000-\u001f\u007f]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
}

function charLength(value) {
  return Array.from(value).length
}

function normalizedQuestion(value) {
  return clean(value).toLowerCase().replace(/[\s，。！？、,.!?;；:“”'‘’（）()《》【】\[\]-]/gu, '')
}

function compactBrainAnswer(value) {
  const source = clean(value)
  const compact = source.replace(/^(?:答案是|谜底是|这是因为|那是因为|因为|原来是|原来|其实是|其实)[：:，,\s]*/u, '')
  if (charLength(compact) >= 2 && charLength(compact) <= 14) return compact
  const firstClause = compact.split(/[，,。.!！？?；;]/u).map((part) => part.trim()).find(Boolean) || ''
  if (charLength(firstClause) >= 2 && charLength(firstClause) <= 14) return firstClause
  if (charLength(source) >= 2 && charLength(source) <= 14) return source
  return ''
}

function extractContextSentence(contextValue, answerValue) {
  const context = clean(contextValue)
  const answer = clean(answerValue)
  const index = context.indexOf(answer)
  if (index < 0) return ''
  const marks = ['。', '！', '？', '；']
  let start = 0
  for (const mark of marks) {
    const found = context.lastIndexOf(mark, index - 1)
    if (found >= start) start = found + 1
  }
  let end = context.length
  for (const mark of marks) {
    const found = context.indexOf(mark, index + answer.length)
    if (found >= 0 && found + 1 < end) end = found + 1
  }
  return clean(context.slice(start, end))
}

const visibleAiMarker = /人工智能|(^|[^a-z])a[\s._-]*i([^a-z]|$)/iu
const unsafeMarker = /内裤|裸体|强奸|性爱|性交|色情|妓女|乳房|阴茎|阴道|同性恋|艾滋|自杀|跳楼|尸体|吸毒|赌博|贪官|种族|黑人|白人|穆斯林|回教|残疾人|聋子|瞎子|哑巴/iu
const poorRiddleMarker = /楼主|加我|联系我|点击下载|网址|http|www\.|qq|QQ群|广告|代购|客服电话|股票|点券|魔兽|网游|外挂|攻略/iu

function loadBrainTeasers() {
  assert(fs.existsSync(brainPagesDir), `缺少脑筋急转弯源数据目录：${brainPagesDir}`)
  const files = fs.readdirSync(brainPagesDir)
    .filter((name) => /^\d+\.json$/u.test(name))
    .sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10))
  const sourceHash = crypto.createHash('sha256')
  const rows = []
  for (const file of files) {
    const bytes = fs.readFileSync(path.join(brainPagesDir, file))
    sourceHash.update(file).update('\0').update(bytes).update('\0')
    const page = JSON.parse(bytes.toString('utf8'))
    for (const item of page.rows || []) rows.push({ ...item.row, rowIndex: item.row_idx })
  }
  SOURCES.brain.sourcePages = { count: files.length, sha256: sourceHash.digest('hex') }
  const seen = new Set()
  const candidates = []
  for (const row of rows) {
    const question = clean(row.input)
    const sourceAnswer = clean(row.output)
    const answer = compactBrainAnswer(sourceAnswer)
    const key = normalizedQuestion(question)
    const joined = `${question} ${sourceAnswer}`
    if (!key || seen.has(key)) continue
    if (charLength(question) < 7 || charLength(question) > 46) continue
    if (charLength(sourceAnswer) < 6 || charLength(sourceAnswer) > 52 || !answer) continue
    if (visibleAiMarker.test(joined) || unsafeMarker.test(joined) || poorRiddleMarker.test(joined)) continue
    if (!/(因为|所以|原来|其实|这是|那是|他是|她是|它是|他们|没有|不能|可以|用|把|正在|只有|本来|就是|不是)/u.test(sourceAnswer)) continue
    if ((joined.match(/[?？]/gu) || []).length > 3) continue
    seen.add(key)
    candidates.push({
      id: `brain:${row.rowIndex}`,
      question,
      answer,
      explain: sourceAnswer,
      category: '脑筋急转弯',
      source: SOURCES.brain.name,
      sourceId: String(row.rowIndex),
      sourceUrl: SOURCES.brain.url,
      sourceLicense: SOURCES.brain.license
    })
  }
  assert(candidates.length >= TARGETS['脑筋急转弯'], `带原始解释性答案的脑筋急转弯不足：${candidates.length}`)
  return candidates.slice(0, TARGETS['脑筋急转弯'])
}

function loadCmrcRecords() {
  const records = []
  for (const source of cmrcFiles) {
    assert(fs.existsSync(source.path), `缺少 CMRC 2018 源数据：${source.path}`)
    assert(sha256(source.path) === SOURCES.cmrc.files[source.split].sha256, `CMRC 2018 ${source.split} 文件 SHA-256 不匹配`)
    const document = JSON.parse(fs.readFileSync(source.path, 'utf8'))
    for (const article of document.data || []) {
      for (const paragraph of article.paragraphs || []) {
        for (const qa of paragraph.qas || []) {
          const question = clean(qa.question)
          const answer = clean(qa.answers?.[0]?.text)
          const explain = extractContextSentence(paragraph.context, answer)
          records.push({
            question,
            answer,
            explain,
            sourceId: String(qa.id),
            sourceTitle: clean(article.title),
            sourceSplit: source.split
          })
        }
      }
    }
  }
  return records
}

function usableCmrc(record) {
  const joined = `${record.question} ${record.answer} ${record.explain}`
  return charLength(record.question) >= 5 && charLength(record.question) <= 42 &&
    charLength(record.answer) >= 1 && charLength(record.answer) <= 14 &&
    charLength(record.explain) >= 12 && charLength(record.explain) <= 116 &&
    record.explain.includes(record.answer) &&
    !visibleAiMarker.test(joined) && !unsafeMarker.test(joined)
}

function cmrcItem(record, category) {
  return {
    id: `cmrc2018:${record.sourceId}`,
    question: record.question,
    answer: record.answer,
    explain: record.explain,
    category,
    source: `${SOURCES.cmrc.name} · ${record.sourceTitle}`,
    sourceId: record.sourceId,
    sourceUrl: SOURCES.cmrc.url,
    sourceLicense: SOURCES.cmrc.license,
    sourceSplit: record.sourceSplit,
    sourceTitle: record.sourceTitle
  }
}

function loadKnowledgeQuestions(records) {
  const mechanismPattern = /为什么|为何|因何|何故|何以|如何|怎么|怎样|原因|由来|原理|条件|作用|目的|影响|意义|过程|方式|方法|依据|特点|功能/u
  const falseWhyPattern = /称为什么|称之为什么|称.{0,18}为什么|为什么.{0,18}(称为|叫作|叫做)|叫什么|改为什么|作为什么|誉为什么/u
  const seen = new Set()
  const candidates = []
  for (const record of records) {
    const key = normalizedQuestion(record.question)
    if (!key || seen.has(key) || !usableCmrc(record)) continue
    if (!mechanismPattern.test(record.question) || falseWhyPattern.test(record.question)) continue
    let score = 0
    if (/为什么|为何|因何|何故|何以/u.test(record.question)) score += 9
    if (/如何|怎么|怎样/u.test(record.question)) score += 7
    if (/原因|由来|原理|条件|作用|目的|影响|意义|过程|方式|方法|依据|特点|功能/u.test(record.question)) score += 5
    if (/^(为什么|为何|因何|何故|何以|如何|怎么|怎样)/u.test(record.question)) score += 4
    if (charLength(record.question) <= 30) score += 3
    if (charLength(record.answer) <= 34) score += 2
    if (charLength(record.explain) <= 86) score += 2
    seen.add(key)
    candidates.push({ record, score })
  }
  candidates.sort((a, b) => b.score - a.score || a.record.sourceId.localeCompare(b.record.sourceId, 'zh-CN'))
  assert(candidates.length >= TARGETS['十万个为什么'], `可用 CMRC 2018 原始解释题不足：${candidates.length}`)
  return candidates.slice(0, TARGETS['十万个为什么']).map(({ record }) => cmrcItem(record, '十万个为什么'))
}

function loadEncyclopediaQuestions(records, reservedQuestions) {
  const seen = new Set(reservedQuestions)
  const candidates = []
  for (const record of records) {
    const key = normalizedQuestion(record.question)
    if (!key || seen.has(key) || !usableCmrc(record)) continue
    let score = 0
    if (/[？?]$/u.test(record.question)) score += 2
    if (/^(什么|哪|谁|何时|哪里|几|多少)/u.test(record.question)) score += 6
    if (/是指|名称|全称|位于|属于|发生于|建立于|组成|包括/u.test(record.question)) score += 4
    if (charLength(record.question) <= 26) score += 3
    if (charLength(record.answer) <= 20) score += 3
    if (charLength(record.explain) <= 82) score += 2
    seen.add(key)
    candidates.push({ record, score })
  }
  candidates.sort((a, b) => b.score - a.score || a.record.sourceId.localeCompare(b.record.sourceId, 'zh-CN'))
  assert(candidates.length >= TARGETS['百科知识'], `可用 CMRC 2018 百科题不足：${candidates.length}`)
  return candidates.slice(0, TARGETS['百科知识']).map(({ record }) => cmrcItem(record, '百科知识'))
}

const cmrcRecords = loadCmrcRecords()
const brainTeasers = loadBrainTeasers()
const whyQuestions = loadKnowledgeQuestions(cmrcRecords)
const reserved = whyQuestions.map((item) => normalizedQuestion(item.question))
const encyclopedia = loadEncyclopediaQuestions(cmrcRecords, reserved)
const selected = [...brainTeasers, ...whyQuestions, ...encyclopedia]
const counts = Object.fromEntries(Object.keys(TARGETS).map((category) => [
  category,
  selected.filter((item) => item.category === category).length
]))

assert(selected.length === 2000, `题库总数应为 2000，实际 ${selected.length}`)
assert(new Set(selected.map((item) => normalizedQuestion(item.question))).size === selected.length, '跨来源题目去重失败')
assert(selected.every((item) => item.answer && item.explain && item.sourceId && item.sourceUrl), '存在缺少答案、解析或来源的记录')

fs.writeFileSync(outputPath, `${JSON.stringify(selected, null, 2)}\n`, 'utf8')
fs.writeFileSync(manifestPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  selectionPolicy: '只使用源数据集现成的问题、答案和原文上下文；仅清理 HTML 与空白。脑筋急转弯的答案栏可截取原解释中的短语以适配窄屏，解析保留完整源答案；不生成知识内容。',
  targets: TARGETS,
  counts,
  total: selected.length,
  sources: SOURCES
}, null, 2)}\n`, 'utf8')

console.log(`真实知识题库已生成：${Object.entries(counts).map(([name, count]) => `${name} ${count}`).join('，')}，合计 ${selected.length} 条。`)
