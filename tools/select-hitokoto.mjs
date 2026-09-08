import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const sourceDir = path.join(root, 'data', 'hitokoto-source')
const outputPath = path.join(root, 'data', 'hitokoto-selected.json')
const quotas = { e: 900, f: 920, k: 180 }
const categoryNames = { e: '原创', f: '网络', k: '哲学' }
const positiveWords = [
  '代码', '程序', '技术', '学习', '努力', '成长', '坚持', '时间', '未来', '世界',
  '生活', '人生', '梦想', '勇气', '希望', '自己', '行动', '知识', '思考', '选择',
  '创造', '简单', '温柔', '幸福', '孤独', '现实', '真理', '自由', '失败', '成功',
  '工作', '问题', '答案', '改变', '热爱', '朋友', '今天', '明天', '道路', '光'
]
const rejectedWords = [
  '裤子都脱', '做爱', '啪啪啪', '乳房', '胸部', '强奸', '傻逼', '妈的', '操你',
  '杀了你', '去死', '萝莉', '后宫', '本子', '调教', '黄段子', 'AV女优'
]
const aiMarker = /人工智能|(^|[^a-z])a[\s._-]*i([^a-z]|$)/iu

function textLength(value) {
  return Array.from(value).length
}

function valid(item) {
  const text = String(item.hitokoto || '').trim()
  const visibleSource = `${item.from || ''} ${item.from_who || ''}`
  if (textLength(text) < 7 || textLength(text) > 28) return false
  if ((text.match(/[\u3400-\u9fff]/gu) || []).length < 4) return false
  if (!item.uuid || !item.from) return false
  if (/[\r\n<>\[\]{}]|https?:\/\/|www\.|@\w/iu.test(text)) return false
  if (/[!！?？~～]{2,}/u.test(text)) return false
  if (rejectedWords.some((word) => text.includes(word))) return false
  if (aiMarker.test(text) || aiMarker.test(visibleSource)) return false
  return true
}

function score(item) {
  const text = item.hitokoto
  let value = 0
  for (const word of positiveWords) if (text.includes(word)) value += 5
  if (item.from_who) value += 3
  if (item.from && item.from !== '网络' && item.from !== '原创') value += 2
  if (textLength(text) >= 10 && textLength(text) <= 24) value += 3
  if (/[。！？]$/u.test(text)) value += 1
  if (/[A-Za-z]{8,}/u.test(text)) value -= 5
  if (/[「」『』【】]/u.test(text)) value -= 2
  return value
}

const candidatesByType = new Map()
const sourceByUuid = new Map()
for (const type of Object.keys(quotas)) {
  const sourcePath = path.join(sourceDir, `${type}.json`)
  if (!fs.existsSync(sourcePath)) throw new Error(`缺少一言官方源文件：${sourcePath}`)
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
  const candidates = source
    .filter(valid)
    .sort((a, b) => score(b) - score(a) || String(a.uuid).localeCompare(String(b.uuid)))
  candidatesByType.set(type, candidates)
  for (const item of candidates) sourceByUuid.set(item.uuid, item)
}

const selected = []
const seen = new Set()
const counts = Object.fromEntries(Object.keys(quotas).map((type) => [type, 0]))

function add(item, type) {
  const text = item.hitokoto.trim()
  const normalized = text.replace(/[\s，。！？；、：“”‘’"']/gu, '')
  if (seen.has(normalized) || counts[type] >= quotas[type]) return false
  seen.add(normalized)
  selected.push({
    uuid: item.uuid,
    text,
    type,
    category: categoryNames[type],
    from: item.from,
    fromWho: item.from_who || null
  })
  counts[type] += 1
  return true
}

// 扩充时优先保留上一版本已发布的真实语录，再补入新的官方记录。
if (fs.existsSync(outputPath)) {
  const previous = JSON.parse(fs.readFileSync(outputPath, 'utf8'))
    .sort((a, b) => String(a.uuid).localeCompare(String(b.uuid)))
  for (const oldItem of previous) {
    const item = sourceByUuid.get(oldItem.uuid)
    if (item && item.type in quotas) add(item, item.type)
  }
}

for (const [type, quota] of Object.entries(quotas)) {
  const candidates = candidatesByType.get(type)
  for (const item of candidates) {
    add(item, type)
    if (counts[type] === quota) break
  }
  if (counts[type] !== quota) throw new Error(`${type} 分类仅选出 ${counts[type]} 条，未达到 ${quota} 条`)
}

let seed = 20260907
function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 4294967296
}
for (let index = selected.length - 1; index > 0; index -= 1) {
  const target = Math.floor(random() * (index + 1))
  const current = selected[index]
  selected[index] = selected[target]
  selected[target] = current
}

fs.writeFileSync(outputPath, JSON.stringify(selected, null, 2) + '\n', 'utf8')
console.log(`已从一言官方语句库筛选 ${selected.length} 条真实语录。`)
for (const [type, quota] of Object.entries(quotas)) console.log(`${categoryNames[type]}\t${quota}`)
