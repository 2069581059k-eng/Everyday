// common/utils/knowledge.js —— 知识题纯逻辑（每日50题、答题/阅读判定）
// 纯函数不依赖页面状态，可由 index / knowledge 页面与验收脚本共用。

function isQaMode(record) {
  return record.displayMode === 'qa' || record.category === '脑筋急转弯' || record.category === '十万个为什么'
}

function knowledgeDetail(record) {
  let text = record.explain
  if (isQaMode(record) && !text.includes(record.answer)) text = record.answer + '。' + text
  return text
}

function knowledgeAnswer(record) {
  if (!isQaMode(record)) return ''
  return Array.from(record.answer).length <= 14 ? record.answer : '完整答案见下方详解'
}

function dailyRiddles(riddles, dayNumber) {
  const rand = mulberry32((dayNumber * 2654435761) >>> 0)
  function shuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      const temp = items[i]; items[i] = items[j]; items[j] = temp
    }
    return items
  }
  const plan = [
    { category: '脑筋急转弯', count: 10 },
    { category: '十万个为什么', count: 10 },
    { category: '百科全书', count: 10 },
    { category: '冷笑话', count: 10 },
    { category: '鬼故事', count: 10 }
  ]
  const daily = []
  for (let i = 0; i < plan.length; i++) {
    const group = riddles.filter(function (item) { return item.category === plan[i].category })
    const picked = shuffle(group).slice(0, plan[i].count)
    for (let j = 0; j < picked.length; j++) daily.push(picked[j])
  }
  return shuffle(daily)
}

function shouldResetQuizProgress(savedDay, todayDay) {
  return savedDay !== todayDay
}

function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export { isQaMode, knowledgeDetail, knowledgeAnswer, dailyRiddles, shouldResetQuizProgress }
