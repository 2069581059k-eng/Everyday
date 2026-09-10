// common/utils/date.js —— 日期核心纯函数（星期/月相已拆至 moon.js，节假日已拆至 holiday.js）

function pad(value) {
  return value < 10 ? '0' + value : String(value)
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

export { pad, dayInfo }
