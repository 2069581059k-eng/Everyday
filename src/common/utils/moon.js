// common/utils/moon.js —— 星期与月相纯函数（仅首页使用）

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

const MOON_PHASES = ['新月', '眉月', '上弦月', '盈凸月', '满月', '亏凸月', '下弦月', '残月']

function moonPhase(dayNumber) {
  const cycle = 29.53058867
  const knownNewMoon = 2451550.1
  const age = ((dayNumber - knownNewMoon) % cycle + cycle) % cycle
  return MOON_PHASES[Math.floor((age + cycle / 16) / (cycle / 8)) % 8]
}

export { WEEKDAYS, MOON_PHASES, moonPhase }
