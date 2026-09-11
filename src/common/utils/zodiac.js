// common/utils/zodiac.js —— 星座相关纯函数（不含娱乐向量，向量见 common/data/zodiac_profiles.js）
// 1.8.14：宜行动/签运模板已迁出至 common/data/fortune_templates.js（数据与工具分离）

const ZODIACS = [
  { name: '白羊座', range: '03.21—04.19' },
  { name: '金牛座', range: '04.20—05.20' },
  { name: '双子座', range: '05.21—06.21' },
  { name: '巨蟹座', range: '06.22—07.22' },
  { name: '狮子座', range: '07.23—08.22' },
  { name: '处女座', range: '08.23—09.22' },
  { name: '天秤座', range: '09.23—10.23' },
  { name: '天蝎座', range: '10.24—11.22' },
  { name: '射手座', range: '11.23—12.21' },
  { name: '摩羯座', range: '12.22—01.19' },
  { name: '水瓶座', range: '01.20—02.18' },
  { name: '双鱼座', range: '02.19—03.20' }
]

// 返回星座索引（0=白羊 … 11=双鱼），仅供显示/娱乐
function zodiacForDate(month, date) {
  const value = month * 100 + date
  if (value >= 321 && value <= 419) return 0
  if (value >= 420 && value <= 520) return 1
  if (value >= 521 && value <= 621) return 2
  if (value >= 622 && value <= 722) return 3
  if (value >= 723 && value <= 822) return 4
  if (value >= 823 && value <= 922) return 5
  if (value >= 923 && value <= 1023) return 6
  if (value >= 1024 && value <= 1122) return 7
  if (value >= 1123 && value <= 1221) return 8
  if (value >= 120 && value <= 218) return 10
  if (value >= 219 && value <= 320) return 11
  return 9
}

export { ZODIACS, zodiacForDate }
