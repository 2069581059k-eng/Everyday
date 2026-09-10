// tools/dump-knowledge-daily.mjs
// 打印"知识大全"当日题单前若干项的类别/模式/文本长度，用于与截图比对
import { RIDDLES } from '../src/common/data/knowledge.js'
import { dayInfo } from '../src/common/utils/date.js'
import { isQaMode, knowledgeDetail, dailyRiddles, knowledgeAnswer } from '../src/common/utils/knowledge.js'

const today = dayInfo(new Date())
const list = dailyRiddles(RIDDLES, today.dayNumber)
console.log(`dayNumber=${today.dayNumber} 当日题单 ${list.length} 条`)
for (let i = 0; i < Math.min(6, list.length); i++) {
  const r = list[i]
  const detail = knowledgeDetail(r)
  console.log('---')
  console.log(`#${i + 1} 类别=${r.category} 模式=${isQaMode(r) ? '答题' : '阅读'}`)
  console.log(`  题/标题(${r.question.length}字): ${String(r.question).slice(0, 40)}`)
  console.log(`  explain(${String(r.explain).length}字): ${String(r.explain).slice(0, 40)}`)
  console.log(`  knowledgeDetail(${String(detail).length}字): ${String(detail).slice(0, 40)}`)
  console.log(`  knowledgeAnswer: ${String(knowledgeAnswer(r)).slice(0, 30)}`)
}
