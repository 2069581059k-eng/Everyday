// common/utils/holiday.js —— 2026 法定节假日纯函数（仅日历页使用）

// 2026 中国法定节假日（官方安排）：[月, 开始日, 结束日, 名称]
const HOLIDAYS_2026 = [
  [1, 1, 3, '元旦'],
  [2, 15, 23, '春节'],
  [4, 4, 6, '清明'],
  [5, 1, 5, '劳动节'],
  [6, 19, 21, '端午'],
  [9, 25, 27, '中秋'],
  [10, 1, 7, '国庆']
]

function isLegalHoliday(year, month, day) {
  if (year !== 2026) return ''
  for (const h of HOLIDAYS_2026) {
    if (month === h[0] && day >= h[1] && day <= h[2]) return h[3]
  }
  return ''
}

function monthHolidayText(year, month) {
  const names = []
  for (const h of HOLIDAYS_2026) {
    if (year !== 2026) continue
    if (h[0] === month) names.push(h[3] + ' ' + h[1] + '-' + h[2] + '日')
  }
  return names.length ? '假期 ' + names.join('、') : ''
}

export { HOLIDAYS_2026, isLegalHoliday, monthHolidayText }
