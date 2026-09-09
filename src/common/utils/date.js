// common/utils/date.js —— 日期、节假日、月相等纯函数

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

const MOON_PHASES = ['新月', '眉月', '上弦月', '盈凸月', '满月', '亏凸月', '下弦月', '残月']

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

function pad(value) {
  return value < 10 ? '0' + value : String(value)
}

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

function dayInfo(now) {
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const date = now.getDate()
  const firstDay = Math.floor(Date.UTC(year, 0, 1) / 86400000)
  const dayNumber = Math.floor(Date.UTC(year, month - 1, date) / 86400000)
  return {
    year,
    month,
    date,
    weekday: now.getDay(),
    dayOfYear: dayNumber - firstDay + 1,
    dayNumber,
    label: pad(month) + '月' + pad(date) + '日',
    key: year + '-' + pad(month) + '-' + pad(date)
  }
}

function moonPhase(dayNumber) {
  const cycle = 29.53058867
  const knownNewMoon = 2451550.1
  const age = ((dayNumber - knownNewMoon) % cycle + cycle) % cycle
  return MOON_PHASES[Math.floor((age + cycle / 16) / (cycle / 8)) % 8]
}

export { pad, WEEKDAYS, MOON_PHASES, HOLIDAYS_2026, isLegalHoliday, monthHolidayText, dayInfo, moonPhase }
