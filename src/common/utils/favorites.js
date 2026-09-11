// common/utils/favorites.js —— 收藏室统一数据层（首页/知识页写入，收藏室页面读取）
// 存储键：daily_quote_favorites_v2，结构 { items: [...] }
// 条目结构（快照式存储，收藏室页面无需再导入题库）：
//   { id, type, text, sub, detail, savedDay }
//   id: 'q'+语录下标 / 'k'+题干（同内容去重）；type: 每日一言 | 抽签 | 题目分类
//   text: 主文案；sub: 来源/签级/分类；detail: 详情（知识类为 答案+解析，其余为空）

const FAVORITES_KEY = 'daily_quote_favorites_v2'

function makeQuoteFavorite(quoteIndex, quote, fortuneLevel, fortuneTip) {
  const isFortune = !!fortuneLevel
  return {
    id: 'q' + quoteIndex,
    type: isFortune ? '抽签' : '每日一言',
    text: quote.text,
    sub: isFortune ? fortuneLevel + ' · ' + fortuneTip : (quote.source || 'Daily Spark'),
    detail: isFortune ? '签运 · ' + fortuneLevel + '\n' + fortuneTip : '',
    savedDay: 0
  }
}

function makeKnowledgeFavorite(riddle) {
  return {
    id: 'k' + riddle.question,
    type: riddle.category,
    text: riddle.question,
    sub: riddle.category + ' · 已收录',
    detail: '答案：' + riddle.answer + '\n解析：' + riddle.explain,
    savedDay: 0
  }
}

// 新收藏插入队首（收藏室最新在前）；已存在则移除。返回 { list, added }
function toggleFavorite(list, item) {
  const position = list.findIndex((x) => x.id === item.id)
  if (position >= 0) {
    list.splice(position, 1)
    return { list, added: false }
  }
  list.unshift(item)
  return { list, added: true }
}

function hasFavorite(list, id) {
  return list.some((x) => x.id === id)
}

// 旧版收藏（daily_quote_state_v1.favorites 的语录下标数组）迁移为 v2 快照条目
function migrateOldFavorites(oldIndexes, quotes) {
  const items = []
  for (let i = oldIndexes.length - 1; i >= 0; i--) {
    const index = oldIndexes[i]
    const quote = quotes[index]
    if (!quote) continue
    items.push({ id: 'q' + index, type: '每日一言', text: quote.text, sub: quote.source || 'Daily Spark', detail: '', savedDay: 0 })
  }
  return items
}

export { FAVORITES_KEY, makeQuoteFavorite, makeKnowledgeFavorite, toggleFavorite, hasFavorite, migrateOldFavorites }
