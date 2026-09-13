// common/utils/countdown.js —— 倒数日/纪念日数据层（纯函数，kvdb 读写由各页面负责）
// 条目结构：{ id, name, month, day, yearly }；yearly=true 每年重复（生日/纪念），false 取最近一次发生
// 内置法定节日倒数直接由 holiday.js 的 HOLIDAYS_2026 起始日推导（与日历页同源的 2026 限定）

import { HOLIDAYS_2026 } from './holiday.js'

const COUNTDOWN_KEY = 'countdown_events_v1'
const PRESET_NAMES = ['生日', '纪念日', '考试', '旅行', '见面', '目标', '约定', '节日']
const MAX_CUSTOM = 5

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

function clampDay(year, month, day) {
  const max = daysInMonth(year, month)
  return day > max ? max : day
}

// ref: { year, month, date }（dayInfo 返回结构）
function nextDate(item, ref) {
  let year = ref.year
  let day = clampDay(year, item.month, item.day)
  if (item.month < ref.month || (item.month === ref.month && day < ref.date)) {
    year += 1
    day = clampDay(year, item.month, item.day)
  }
  return { year, month: item.month, day }
}

function dayDiff(ref, target) {
  return Math.round((Date.UTC(target.year, target.month - 1, target.day) - Date.UTC(ref.year, ref.month - 1, ref.date)) / 86400000)
}

// 自定义条目 → 附带下一次发生日期与剩余天数，按天数升序
function withCountdown(items, ref) {
  return items.map((item) => {
    const next = nextDate(item, ref)
    return { id: item.id, name: item.name, month: item.month, day: item.day, yearly: item.yearly,
      nYear: next.year, nMonth: next.month, nDay: next.day, days: dayDiff(ref, next) }
  }).sort((a, b) => a.days - b.days)
}

// 内置法定节日（起始日倒数，已过去的假期不再显示）；与日历节假日同源，仅限 2026
function builtinFestivals(ref) {
  const out = []
  for (const h of HOLIDAYS_2026) {
    const target = { year: 2026, month: h[0], day: h[1] }
    const days = dayDiff(ref, target)
    if (days >= 0) out.push({ id: 'builtin-' + h[3], name: h[3], month: h[0], day: h[1], yearly: false, builtin: true, days })
  }
  return out.sort((a, b) => a.days - b.days)
}

// 日历页标记用：所有条目的下一次发生日期列表 [{year, month, day}]
function countdownMarks(items, ref) {
  return items.map((item) => nextDate(item, ref))
}

function daysText(days) {
  return days === 0 ? '就是今天' : '还有 ' + days + ' 天'
}

export { COUNTDOWN_KEY, PRESET_NAMES, MAX_CUSTOM, clampDay, nextDate, dayDiff, withCountdown, builtinFestivals, countdownMarks, daysText }
