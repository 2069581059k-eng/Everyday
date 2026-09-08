import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const expectedQuoteCount = 2000
const pagePath = path.join(root, 'src', 'pages', 'index', 'index.ux')
const manifestPath = path.join(root, 'src', 'manifest.json')
const packagePath = path.join(root, 'package.json')
const capturePath = path.join(root, 'tools', 'capture-vvd.mjs')
const iconPath = path.join(root, 'src', 'common', 'icon.png')
const selectedPath = path.join(root, 'data', 'hitokoto-selected.json')
const knowledgePath = path.join(root, 'data', 'knowledge-selected.json')
const knowledgeSourcesPath = path.join(root, 'data', 'knowledge-sources.json')
const page = fs.readFileSync(pagePath, 'utf8')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
const captureScript = fs.readFileSync(capturePath, 'utf8')

function check(condition, message) {
  if (!condition) throw new Error(message)
  console.log('PASS  ' + message)
}

const quoteBlock = page.match(/const QUOTES = (\[[\s\S]*?\])\n\nfunction pad/u)
const quotes = quoteBlock ? Function('return (' + quoteBlock[1] + ')')() : []
const riddleBlock = page.match(/const RIDDLES = (\[[\s\S]*?\])\n\nconst QUOTES/u)
const riddles = riddleBlock ? Function('return (' + riddleBlock[1] + ')')() : []
const sourceKnowledge = fs.existsSync(knowledgePath) ? JSON.parse(fs.readFileSync(knowledgePath, 'utf8')) : []
const knowledgeSources = fs.existsSync(knowledgeSourcesPath) ? JSON.parse(fs.readFileSync(knowledgeSourcesPath, 'utf8')) : {}
const helperBlock = page.match(/(function mulberry32\(seed\) \{[\s\S]*?\n\}\n\nconst today =)/u)
const helperSrc = helperBlock ? helperBlock[1].replace(/\n\nconst today =[^\n]*$/, '') : ''
const quizHelpers = helperSrc
  ? Function('RIDDLES', helperSrc + '\nreturn { dailyRiddles, isCompleteReward, shouldResetQuizProgress };')(riddles)
  : null

const quoteCount = quotes.length
const uniqueTexts = new Set(quotes.map((item) => item.text))
const categories = new Set(quotes.map((item) => item.note))
const selected = fs.existsSync(selectedPath) ? JSON.parse(fs.readFileSync(selectedPath, 'utf8')) : []
const selectedByUuid = new Map(selected.map((item) => [item.uuid, item]))
const uniqueUuids = new Set(quotes.map((item) => item.uuid))
const uniqueRiddleQuestions = new Set(riddles.map((item) => item.question))
const sourceKnowledgeByQuestion = new Map(sourceKnowledge.map((item) => [item.question, item]))
const visibleAiMarker = /人工智能|(^|[^a-z])a[\s._-]*i([^a-z]|$)/iu

// ---- 语录（每日一言）验收：保持原有约束不变 ----
check(manifest.package === 'com.dailyquote.band10pro', '使用中性独立包名')
check(packageJson.version === manifest.versionName, 'package.json 与 manifest.json 版本号一致')
check(!manifest.package.includes('konghongwei'), '包名未包含禁用名称')
check(manifest.config.designWidth === 336, '设计宽度为 Band 10 Pro 的 336')
check(manifest.features.some((item) => item.name === 'system.storage'), '声明本地存储能力')
check(fs.existsSync(iconPath) && fs.statSync(iconPath).size > 1000, '独立应用图标存在')
check(quoteCount === expectedQuoteCount, `内置恰好 ${expectedQuoteCount} 条真实离线每日一言`)
check(uniqueTexts.size === quoteCount, '语录全文无重复')
check(uniqueUuids.size === quoteCount, `${expectedQuoteCount} 条语录的官方 UUID 均唯一`)
check(selected.length === quoteCount, '运行时语录与可审计源数据数量一致')
check(quotes.every((item) => selectedByUuid.get(item.uuid)?.text === item.text), '每条运行时语录都能按 UUID 追溯到源数据')
check([...categories].sort().join(',') === '原创,哲学,网络', '仅使用原创、网络、哲学三类真实语料')
check(quotes.every((item) => Array.from(item.text).length <= 28), '全部语录适合米环短屏阅读')
check(quotes.every((item) => !('key' in item) && !('decoy' in item)), '语录不再携带旧版关键词小测数据')
check(quotes.every((item) => !visibleAiMarker.test(`${item.text} ${item.source}`)), '用户可见语录及来源不含 AI 字样')

// ---- 真实知识题库 ----
check(riddles.length === 2000, `运行包内置恰好 2000 道真实离线知识题（实际 ${riddles.length}）`)
check(sourceKnowledge.length === riddles.length, '运行时知识题与可审计源数据数量一致')
check(uniqueRiddleQuestions.size === riddles.length, '三类知识题跨来源无重复')
check(riddles.every((item) => item.question && item.answer && item.explain), '每道题均有问题、答案与解析')
check(riddles.every((item) => item.source), '每道运行时题目均显示来源')
check(riddles.every((item) => {
  const source = sourceKnowledgeByQuestion.get(item.question)
  return source && source.answer === item.answer && source.explain === item.explain && source.source === item.source
}), '每道运行时题目均与可审计导入清单一致')
check(riddles.every((item) => Array.from(item.answer).length <= 14), '全部答案适合米环单行答案栏阅读')
const knowledgeCounts = Object.fromEntries(['脑筋急转弯', '十万个为什么', '百科知识'].map((category) => [
  category,
  riddles.filter((item) => item.category === category).length
]))
check(knowledgeCounts['脑筋急转弯'] === 400, '脑筋急转弯为 400 条真实数据')
check(knowledgeCounts['十万个为什么'] === 600, '十万个为什么为 600 条真实数据')
check(knowledgeCounts['百科知识'] === 1000, '百科知识为 1000 条真实数据')
check(sourceKnowledge.every((item) => item.sourceId && item.sourceUrl && item.sourceLicense), '可审计题库逐条保留来源 ID、固定地址和许可证')
check(knowledgeSources.total === 2000 && knowledgeSources.sources?.cmrc && knowledgeSources.sources?.brain?.sourcePages?.sha256, '数据源清单记录数量、版本、哈希和许可证')
check(riddles.every((item) => !visibleAiMarker.test(`${item.question} ${item.answer} ${item.explain} ${item.source}`)), '知识题用户可见内容不含 AI 字样')
check(page.includes('value="知识大全"'), '主页入口按钮文案为知识大全')
check(page.includes('<text class="quiz-kicker">知识大全</text>'), '题库详情标题已统一为知识大全')

// ---- 每日固定 20 道不重复（新机制，真实逻辑） ----
check(!!quizHelpers, '页面包含按日期选題的辅助函数')
check(page.includes('dailyRiddles(') && page.includes('const dailyRiddleList = dailyRiddles('), '按本地日期固定生成每日题目列表')
check(page.includes('Date.UTC') && page.includes('quoteIndex(today.dayNumber)'), '按本地日期稳定选择每日内容')
if (quizHelpers) {
  const sampleDays = [1, 2, 31, 100, 365, 1000, 20260207, 20261231]
  let allOk = true
  for (const day of sampleDays) {
    const list = quizHelpers.dailyRiddles(day)
    const qs = new Set(list.map((r) => r.question))
    const counts = Object.fromEntries(['脑筋急转弯', '十万个为什么', '百科知识'].map((category) => [
      category,
      list.filter((item) => item.category === category).length
    ]))
    if (list.length !== 20 || qs.size !== list.length || counts['脑筋急转弯'] !== 7 || counts['十万个为什么'] !== 6 || counts['百科知识'] !== 7) allOk = false
  }
  check(allOk, '每天固定 20 道且按 7/6/7 覆盖脑筋急转弯、为什么和百科')
  const a = quizHelpers.dailyRiddles(1).map((r) => r.question).join('|')
  const b = quizHelpers.dailyRiddles(2).map((r) => r.question).join('|')
  check(a !== b, '跨天题目选择不同（按日期区分）')
  const same1 = quizHelpers.dailyRiddles(7).map((r) => r.question).join('|')
  const same2 = quizHelpers.dailyRiddles(7).map((r) => r.question).join('|')
  check(same1 === same2, '同一天多次进入选择稳定一致')
}

// ---- 不显示答案选项、点击查看答案才显示 ----
check(!page.includes('choiceOneText') && !page.includes('chooseOne') && !page.includes('finishQuiz'), '已移除旧版答案选项与答对奖励逻辑')
check(page.includes('revealAnswer') && page.includes('answerVisible'), '提供“查看答案”按钮，点击后才显示答案')
check(/quiz-reveal-btn" show="\{\{!answerVisible\}\}"/u.test(page), '未查看答案时显示“查看答案”按钮，查看后隐藏')
check(/quiz-answer-box" show="\{\{answerVisible\}\}"/u.test(page), '查看答案后才显示答案与解析区')
check(page.includes("r.explain + ' 来源：' + r.source") && page.includes('detail-next') && page.includes('quiz-explain'), '答案区显示原始解析、来源且支持分页浏览')

// ---- 上一题/下一题、序号进度、末题边界 ----
check(page.includes('prevQuestion') && page.includes('nextQuestion'), '支持上一题与下一题')
check(page.includes('quizPos') && page.includes('quizTotal'), '显示序号进度（第 X / 20 题）')
check(page.includes('已是最后一题') && page.includes('已是第一题'), '首题与末题边界提示明确')

// ---- 首次看完 20 题奖励 1 灵光（取代答对奖励） ----
check(page.includes('isCompleteReward('), '存在“看完即奖励”的判定逻辑')
check(page.includes('获得 1 点灵光') && page.includes('今日 20 题已读完'), '奖励文案明确：看完 20 题获得 1 点灵光')
check(page.includes('state.quizViewed'), '本地持久化已查看进度')
check(page.includes('shouldResetQuizProgress('), '实现日期变化重置进度')
if (quizHelpers) {
  const rewardOk =
    quizHelpers.isCompleteReward(20, 20, -1, 5) === true &&
    quizHelpers.isCompleteReward(19, 20, -1, 5) === false &&
    quizHelpers.isCompleteReward(20, 20, 5, 5) === false &&
    quizHelpers.isCompleteReward(20, 20, 4, 5) === true
  check(rewardOk, '奖励逻辑真实：看完20题且当日未领才奖励，当日不重复，跨天可再领')
  const resetOk =
    quizHelpers.shouldResetQuizProgress(5, 6) === true &&
    quizHelpers.shouldResetQuizProgress(5, 5) === false
  check(resetOk, '进度重置逻辑真实：日期变化才重置')
}

// ---- 其它原有功能保持不变 ----
check(page.includes('state.lastDay === today.dayNumber - 1'), '实现连续签到计算')
check(page.includes('toggleFavorite()') && page.includes('favorites'), '实现本地收藏')
check(page.includes('今日日历') && page.includes('yearDayText'), '主页面包含真实日期日历信息')
check(page.includes('ZODIACS') && page.includes('previousZodiac()') && page.includes('nextZodiac()'), '支持十二星座切换与本地保存')
check(page.includes('moonPhase(today.dayNumber)'), '显示按日期计算的近似月相')
check(page.includes("'上上签'") && page.includes("'上签'") && page.includes("'中签'") && page.includes("'下签'") && page.includes("'下下签'"), '每日一签包含五个签级')
check(page.includes('fortuneForDay(today.dayNumber)'), '每日签级按日期固定且换语录不会改变')
check(!page.includes('星象与签运为趣味参考'), '界面不再显示提示性免责声明')
check(page.includes('background-color: #f2eee5') && !page.includes('glow-one'), '主题已改为无光效的暖色纸质日历风格')
check(page.includes('onswipe="handleSwipe"') && page.includes("event.direction === 'right'"), '支持右滑退出')
check(page.includes('.page { position: relative; width: 336px; height: 480px;'), '页面完整适配 336×480')
check(page.includes('brightness.setKeepScreenOn'), '保留常亮（保持屏幕常亮）实现')
check(page.includes('stateReady: false') && page.includes('disabled="{{!stateReady}}"'), '存档读取完成前禁止翻签')
check(page.includes('const finishLoad = function') && page.includes('if (!this.stateReady) return'), '存档成功、失败或不可用时均结束加载，未完成时禁止保存')

// ---- 1.7.0 布局重构验收：减密度、固定父容器、无重叠、统一 left/top ----
check(page.includes('quiz-panel') && /quiz-panel \{[^}]*width: 312px; height: 456px/u.test(page), '知识面板使用固定尺寸父容器（312×456 居中）')
check(page.includes('quiz-question-box') && page.includes('quiz-answer-box'), '题目与答案各自拥有明确大小的固定父容器，互不重叠')
check(page.includes('quiz-actionbar') && /quiz-actionbar \{[^}]*top: 400px/u.test(page), '题目导航使用固定操作栏（底部固定），不随内容浮动')
check(page.includes('openCalendar') && page.includes('openZodiac'), '日历与星座均提供独立详情入口，避免小卡塞大量文字')
check(page.includes('zodiac-mask') && page.includes('closeZodiac'), '星座使用独立详情遮罩页展示名称/日期区间/月相/贴士')
check(page.includes('exit-button') && page.includes('onclick="exitGame"') && /exit-button \{[^}]*z-index: 10/u.test(page), '退出按钮常驻可见且置顶可点击')
const weekCells = (page.match(/class="month-week-cell"/g) || []).length
check(weekCells === 7, `月历星期行使用 7 个独立等宽文本（实际 ${weekCells}）`)
const dayCells = (page.match(/class="month-cell"/g) || []).length
check(dayCells === 42, `月历使用 42 格（6 行×7 列，实际 ${dayCells}）`)
check(!/\bright:\s*\d/u.test(page), '布局统一使用 left/top 定位，未使用 right（规避模拟器支持问题）')
check(page.includes('detail-next') && page.includes('detailTotal') && page.includes('detailLabel'), '答案/解析过长时可分页（下一段按钮 + 总段数 + 动态文案）')
check(page.includes('quiz-reward') && page.includes('rewardText'), '奖励提示使用固定位置文本，不挤占题目/答案区')
const captureOrder = [
  '03-zodiac.png', '04-zodiac-next.png', '05-calendar.png',
  '06-riddle.png', '07-riddle-answer.png'
].map((name) => captureScript.indexOf(`'${name}'`))
check(captureOrder.every((position) => position >= 0) && captureOrder.every((position, index) => index === 0 || position > captureOrder[index - 1]), '模拟器验收依次覆盖星座、切换星座、月历、题目和答案')
check(captureScript.includes('/data/app/${packageName}/manifest-watch.json') && captureScript.includes('模拟器版本不一致'), '模拟器截图前核验实际安装版本')

console.log(`\n每日一言静态与逻辑验收通过：${quoteCount} 条可追溯真实语录，${riddles.length} 道可追溯真实知识题。`)
