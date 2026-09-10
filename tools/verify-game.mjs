import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const expectedQuoteCount = 2000
const pagePath = path.join(root, 'src', 'pages', 'index', 'index.ux')
const knowledgePagePath = path.join(root, 'src', 'pages', 'knowledge', 'knowledge.ux')
const calendarPagePath = path.join(root, 'src', 'pages', 'calendar', 'calendar.ux')
const manifestPath = path.join(root, 'src', 'manifest.json')
const packagePath = path.join(root, 'package.json')
const capturePath = path.join(root, 'tools', 'capture-vvd.mjs')
const iconPath = path.join(root, 'src', 'common', 'icon.png')
const selectedPath = path.join(root, 'data', 'hitokoto-selected.json')
const knowledgePath = path.join(root, 'data', 'knowledge-selected.json')
const knowledgeSourcesPath = path.join(root, 'data', 'knowledge-sources.json')
const page = fs.readFileSync(pagePath, 'utf8').replace(/\r\n/g, '\n')
const knowledgePage = fs.existsSync(knowledgePagePath) ? fs.readFileSync(knowledgePagePath, 'utf8').replace(/\r\n/g, '\n') : ''
const calendarPage = fs.existsSync(calendarPagePath) ? fs.readFileSync(calendarPagePath, 'utf8').replace(/\r\n/g, '\n') : ''
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
const captureScript = fs.readFileSync(capturePath, 'utf8')

function check(condition, message) {
  if (!condition) throw new Error(message)
  console.log('PASS  ' + message)
}

const quotesModulePath = path.join(root, 'src', 'common', 'data', 'quotes.js')
const knowledgeModulePath = path.join(root, 'src', 'common', 'data', 'knowledge.js')
const quoteBlock = fs.readFileSync(quotesModulePath, 'utf8').match(/const QUOTES = (\[[\s\S]*?\n\])/u)
const riddleBlock = fs.readFileSync(knowledgeModulePath, 'utf8').match(/const RIDDLES = (\[[\s\S]*?\n\])/u)
const quotes = quoteBlock ? Function('return (' + quoteBlock[1] + ')')() : []
const riddles = riddleBlock ? Function('return (' + riddleBlock[1] + ')')() : []
const sourceKnowledge = fs.existsSync(knowledgePath) ? JSON.parse(fs.readFileSync(knowledgePath, 'utf8')) : []
const knowledgeSources = fs.existsSync(knowledgeSourcesPath) ? JSON.parse(fs.readFileSync(knowledgeSourcesPath, 'utf8')) : {}
const randomUtilsPath = path.join(root, 'src', 'common', 'utils', 'random.js')
const dateUtilsPath = path.join(root, 'src', 'common', 'utils', 'date.js')
const zodiacUtilsPath = path.join(root, 'src', 'common', 'utils', 'zodiac.js')
const knowledgeUtilsPath = path.join(root, 'src', 'common', 'utils', 'knowledge.js')
const dateUtils = fs.existsSync(dateUtilsPath) ? fs.readFileSync(dateUtilsPath, 'utf8').replace(/\r\n/g, '\n') : ''
const randomUtils = fs.existsSync(randomUtilsPath) ? fs.readFileSync(randomUtilsPath, 'utf8').replace(/\r\n/g, '\n') : ''
const zodiacUtils = fs.existsSync(zodiacUtilsPath) ? fs.readFileSync(zodiacUtilsPath, 'utf8').replace(/\r\n/g, '\n') : ''
const knowledgeUtils = fs.existsSync(knowledgeUtilsPath) ? fs.readFileSync(knowledgeUtilsPath, 'utf8').replace(/\r\n/g, '\n') : ''
// 知识逻辑已抽为共享模块：直接取其函数体与 mulberry32，注入 RIDDLES 运行逻辑测试
const knowledgeFnSrc = knowledgeUtils.match(/function (isQaMode|knowledgeDetail|knowledgeAnswer|dailyRiddles|shouldResetQuizProgress|mulberry32)\([\s\S]*?\n\}/gu) || []
const quizHelpers = knowledgeFnSrc.length
  ? Function('RIDDLES', knowledgeFnSrc.join('\n') + '\nreturn { dailyRiddles, shouldResetQuizProgress, knowledgeDetail, knowledgeAnswer, isQaMode };')(riddles)
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
check(riddles.length === knowledgeSources.total && riddles.length <= 5000, `知识库与合并清单一致且不超过 5000 条（实际 ${riddles.length}）`)
check(sourceKnowledge.length === riddles.length, '运行时知识题与可审计源数据数量一致')
check(uniqueRiddleQuestions.size === riddles.length, '三类知识题跨来源无重复')
check(riddles.every((item) => item.question && item.answer && item.explain), '每道题均有问题、答案与解析')
check(riddles.every((item) => item.source), '每道运行时题目均显示来源')
check(riddles.every((item) => {
  const source = sourceKnowledgeByQuestion.get(item.question)
  return source && source.answer === item.answer && source.explain === item.explain && source.source === item.source
}), '每道运行时题目均与可审计导入清单一致')
check(riddles.every((item) => Array.from(quizHelpers.knowledgeAnswer(item)).length <= 14), '答案栏短屏可读')
check(riddles.every((item) => quizHelpers.knowledgeDetail(item).includes(item.explain) && (item.displayMode !== 'qa' || quizHelpers.knowledgeDetail(item).includes(item.answer))), '分页详情完整保留原答案与解析及故事正文')
const knowledgeCounts = Object.fromEntries(['脑筋急转弯', '十万个为什么', '百科全书', '冷笑话', '鬼故事'].map((category) => [
  category,
  riddles.filter((item) => item.category === category).length
]))
check(JSON.stringify(knowledgeCounts) === JSON.stringify({ '脑筋急转弯': 312, '十万个为什么': 290, '百科全书': 923, '冷笑话': 293, '鬼故事': 205 }), '五类数量逐一匹配最终包')
check(sourceKnowledge.every((item) => item.sourceId && ((item.sourceUrl && item.sourceLicense) || (item.provenance?.archiveSha256 && item.provenance?.verification === 'source-not-provided'))), '保留公开来源或用户压缩包溯源，不伪造缺失出处')
check(knowledgeSources.archive?.sha256 && knowledgeSources.total === 2023, '清单仅引用最终包及其哈希')
const importedKnowledge = JSON.parse(fs.readFileSync(path.join(root, 'data', 'final-input.json'), 'utf8'))
check(sourceKnowledge.length === importedKnowledge.length && sourceKnowledge.every(r => {
  const raw = importedKnowledge.find(x => x.id === r.provenance.inputId)
  return raw && r.id === `final:${raw.id}` && r.category === raw.category && r.displayMode === raw.display_mode &&
    r.question === (raw.display_mode === 'qa' ? raw.question : raw.title) &&
    r.answer === (raw.display_mode === 'qa' ? raw.answer : raw.title) &&
    r.explain === (raw.display_mode === 'qa' ? raw.explanation || raw.answer : raw.content)
}), '2023 条全部与最终包逐字段匹配，无旧库独有条目')
check(riddles.every((item) => !visibleAiMarker.test(`${item.question} ${item.answer} ${item.explain} ${item.source}`)), '知识题用户可见内容不含 AI 字样')
check(page.includes('value="知识大全"'), '主页入口按钮文案为知识大全')
check(knowledgePage.includes('<text class="quiz-kicker">{{quizCategory}}</text>'), '知识面板顶部标签改为当前分类名（如 百科全书/脑筋急转弯）')

// ---- 每日固定 50 道不重复（新机制，真实逻辑，位于共享知识模块） ----
check(!!quizHelpers, '页面包含按日期选題的辅助函数')
check(knowledgeUtils.includes('function dailyRiddles(') && knowledgePage.includes('dailyRiddles(RIDDLES, today.dayNumber)'), '按本地日期固定生成每日题目列表')
check(dateUtils.includes('Date.UTC') && page.includes('quoteIndex(today.dayNumber)'), '日期工具基于 UTC 稳定计算，每日内容按本地日期稳定选择')
if (quizHelpers) {
  const sampleDays = [1, 2, 31, 100, 365, 1000, 20260207, 20261231]
  let allOk = true
  for (const day of sampleDays) {
    const list = quizHelpers.dailyRiddles(riddles, day)
    const qs = new Set(list.map((r) => r.question))
    const counts = Object.fromEntries(['脑筋急转弯', '十万个为什么', '百科全书', '冷笑话', '鬼故事'].map((category) => [
      category,
      list.filter((item) => item.category === category).length
    ]))
    if (list.length !== 50 || qs.size !== list.length || Object.values(counts).some(n => n !== 10)) allOk = false
  }
  check(allOk, '每天固定 50 条，五类各 10 条')
  const a = quizHelpers.dailyRiddles(riddles, 1).map((r) => r.question).join('|')
  const b = quizHelpers.dailyRiddles(riddles, 2).map((r) => r.question).join('|')
  check(a !== b, '跨天题目选择不同（按日期区分）')
  const same1 = quizHelpers.dailyRiddles(riddles, 7).map((r) => r.question).join('|')
  const same2 = quizHelpers.dailyRiddles(riddles, 7).map((r) => r.question).join('|')
  check(same1 === same2, '同一天多次进入选择稳定一致')
}

// ---- 不显示答案选项、点击查看答案才显示（知识页） ----
check(!knowledgePage.includes('choiceOneText') && !knowledgePage.includes('chooseOne') && !knowledgePage.includes('finishQuiz'), '已移除旧版答案选项与答对奖励逻辑')
check(knowledgePage.includes('revealAnswer') && knowledgePage.includes('answerVisible'), '提供“查看答案”按钮，点击后才显示答案')
check(/quiz-reveal-btn" show="\{\{!answerVisible\}\}"/u.test(knowledgePage), '未查看答案时显示“查看答案”按钮，查看后隐藏')
check(/quiz-answer-box" show="\{\{answerVisible\}\}"/u.test(knowledgePage), '查看答案后才显示答案与解析区')
check(knowledgePage.includes('detail-next') && knowledgePage.includes('quiz-explain'), '答案区显示原始解析且支持分页浏览（不再拼接来源）')
check(!knowledgePage.includes("+ ' 来源：' + record.source"), '正文与解析不再拼接“来源”尾巴')

// ---- 上一题/下一题、序号进度、末题边界 ----
check(knowledgePage.includes('prevQuestion') && knowledgePage.includes('nextQuestion'), '支持上一题与下一题')
check(knowledgePage.includes('quizPos') && knowledgePage.includes('quizTotal'), '显示序号进度（第 X / 50 题）')
check(knowledgePage.includes('已是最后一题') && knowledgePage.includes('已是第一题'), '首题与末题边界提示明确')

// ---- 分类阅读模式：仅 脑筋急转弯/十万个为什么 保留查看答案，其余直接显示正文 ----
check(knowledgeUtils.includes('function isQaMode('), '提供按分类判定答题/阅读模式的辅助函数')
check(/return record\.displayMode === 'qa' \|\| record\.category === '脑筋急转弯' \|\| record\.category === '十万个为什么'/u.test(knowledgeUtils), '仅 脑筋急转弯 与 十万个为什么 属于答题模式')
check(!knowledgePage.includes('今日 20 题已读完'), '已移除“看完即奖励”的答题完成设定')
check(!knowledgePage.includes('isCompleteReward('), '已移除答题完成判定逻辑')
check(knowledgePage.includes('this.answerVisible = !this.isQaItem'), '阅读类条目进入即自动显示正文，答题类每次进入都收起（不再记忆展开状态）')
check(knowledgePage.includes("this.answerLabel = this.isQaItem ? '答案' : riddle.category"), '仅答题类在答案框标注“答案”，正文框不再显示“正文·分类”')
check(knowledgePage.includes('<text class="quiz-kicker">{{quizCategory}}</text>') && /<div class="qa-mode" show="\{\{isQaItem\}\}">[\s\S]*?<div class="read-mode" show="\{\{!isQaItem\}\}">/u.test(knowledgePage), '答题模式顶部标签显示当前分类，阅读模式独立布局')
check(knowledgePage.includes('<text class="read-kicker">{{quizCategory}}</text>') && knowledgePage.includes('<text class="read-title">{{riddleQuestion}}</text>') && knowledgePage.includes('<text class="read-text">{{riddleExplain}}</text>'), '阅读模式左上显示分类标签，正文含子标题与大号正文')
check(knowledgePage.includes('riddleExplain = chunks[this.detailIndex]') && knowledgePage.includes("this.answerLabel = this.isQaItem ? '答案' : riddle.category"), '正文不重复“正文·分类”标签，不拼接来源')

// ---- 其它原有功能保持不变 ----
check(page.includes('state.lastDay === today.dayNumber - 1'), '实现连续签到计算')
check(page.includes('toggleFavorite()') && page.includes('favorites'), '实现本地收藏')
check(page.includes('今日日历') && page.includes('yearDayText'), '主页面包含真实日期日历信息')
check(page.includes('ZODIACS') && page.includes('previousZodiac()') && page.includes('nextZodiac()'), '支持十二星座切换与本地保存')
check(page.includes('moonPhase(today.dayNumber)'), '显示按日期计算的近似月相')
check(zodiacUtils.includes("'上上签'") && zodiacUtils.includes("'上签'") && zodiacUtils.includes("'中签'") && zodiacUtils.includes("'下签'") && zodiacUtils.includes("'下下签'"), '抽签包含五个签级')
check(page.includes('Math.random() * FORTUNES.length') && page.includes('drawFortune()'), '抽一签为随机抽取，不再按日期固定自动派签')
check(!page.includes('fortuneForDay(today.dayNumber)'), '已移除按日期固定的自动签级')
check(!page.includes('星象与签运为趣味参考'), '界面不再显示提示性免责声明')
check(page.includes('<text class="brand">Daily Spark</text>'), '品牌已更名 Daily Spark')
check(dateUtils.includes('HOLIDAYS_2026') && calendarPage.includes('monthHolidayText(y, m)') && calendarPage.includes('#3f7d46') && calendarPage.includes('#c0392b'), '月历内置 2026 法定节假日与周末配色')
check(page.includes('background-color: #f2eee5') && !page.includes('glow-one'), '主题已改为无光效的暖色纸质日历风格')
check(page.includes('onswipe="handleSwipe"') && page.includes("event.direction === 'right'"), '支持右滑退出')
check(page.includes('.page { position: relative; width: 336px; height: 480px;'), '页面完整适配 336×480')
check(page.includes('brightness.setKeepScreenOn'), '保留常亮（保持屏幕常亮）实现')
check(page.includes('stateReady: false') && page.includes('drawFortune()') && page.includes('if (!this.stateReady) return'), '存档读取完成前禁止抽签与相关操作')
check(page.includes('const finishLoad = function') && page.includes('if (!this.stateReady) return'), '存档成功、失败或不可用时均结束加载，未完成时禁止保存')

// ---- 1.7.0 布局重构验收：减密度、固定父容器、无重叠、统一 left/top（知识页 / 日历页） ----
check(knowledgePage.includes('quiz-panel') && /quiz-panel \{[^}]*width: 312px; height: 456px/u.test(knowledgePage), '知识面板使用固定尺寸父容器（312×456 居中）')
check(knowledgePage.includes('quiz-question-box') && knowledgePage.includes('quiz-answer-box'), '题目与答案各自拥有明确大小的固定父容器，互不重叠')
check(knowledgePage.includes('quiz-actionbar') && /quiz-actionbar \{[^}]*top: 400px/u.test(knowledgePage), '题目导航使用固定操作栏（底部固定），不随内容浮动')
check(page.includes('openCalendarPage') && page.includes('openZodiac'), '首页提供日历页与星座详情入口')
check(page.includes('zodiac-mask') && page.includes('closeZodiac'), '星座使用独立详情遮罩页展示名称/日期区间/月相/贴士')
check(!page.includes('class="exit-button"') && !page.includes('.exit-button'), '已移除右上角全局退出按钮，仅保留右滑退出')
const weekCells = (calendarPage.match(/class="month-week-cell"/g) || []).length
check(weekCells === 7, `月历星期行使用 7 个独立等宽文本（实际 ${weekCells}）`)
const dayCells = (calendarPage.match(/class="month-cell"/g) || []).length
check(dayCells === 42, `月历使用 42 格（6 行×7 列，实际 ${dayCells}）`)
for (const text of [page, knowledgePage, calendarPage]) {
  check(!/\bright:\s*\d/u.test(text), '布局统一使用 left/top 定位，未使用 right（规避模拟器支持问题）')
}
check(knowledgePage.includes('detail-next') && knowledgePage.includes('detailTotal') && knowledgePage.includes('detailLabel'), '答案/解析过长时可分页（下一段按钮 + 总段数 + 动态文案）')
check(!knowledgePage.includes('quiz-reward') && !knowledgePage.includes('rewardText'), '已移除奖励提示，题目与答案区不再被奖励文字挤占')
const captureOrder = [
  '03-zodiac.png', '04-zodiac-next.png', '05-calendar.png',
  '06-riddle.png', '07-riddle-answer.png'
].map((name) => captureScript.indexOf(`'${name}'`))
check(captureOrder.every((position) => position >= 0) && captureOrder.every((position, index) => index === 0 || position > captureOrder[index - 1]), '模拟器验收依次覆盖星座、切换星座、月历、题目和答案')
check(captureScript.includes('/data/app/${packageName}/manifest-watch.json') && captureScript.includes('模拟器版本不一致'), '模拟器截图前核验实际安装版本')

// ---- 1.8.3 架构拆分：多页面路由 + 星座星象分析 ----
const manifestPages = Object.keys(manifest.router?.pages || {})
check(manifestPages.includes('pages/zodiac-test') && manifestPages.includes('pages/zodiac-result'), `manifest 注册星象分析答题与结果页（实际 ${manifestPages.join(', ')}）`)
check(manifestPages.includes('pages/index'), 'manifest 保留首页入口')
const zodiacTestPath = path.join(root, 'src', 'pages', 'zodiac-test', 'zodiac-test.ux')
const zodiacResultPath = path.join(root, 'src', 'pages', 'zodiac-result', 'zodiac-result.ux')
const zodiacTest = fs.readFileSync(zodiacTestPath, 'utf8')
const zodiacResult = fs.readFileSync(zodiacResultPath, 'utf8')
check(zodiacTest.includes('zodiac_questions.js') && zodiacTest.includes('scoreAnswers') && zodiacTest.includes('rankZodiacs') && zodiacTest.includes('buildAnalysis'), '答题页读取离线题库并完成计分/匹配/分析')
check(zodiacTest.includes('router.replace') && zodiacResult.includes('router.replace'), '答题页答完跳结果页，结果页可返回/重测')
check(zodiacResult.includes('primaryName') && zodiacResult.includes('slotBodyA') && zodiacResult.includes('blocks'), '结果页展示主气质、组合、维度、场景、建议等完整内容')
check(zodiacResult.includes('nextPage') && zodiacResult.includes('fillPage') && zodiacResult.includes('pageIndex'), '结果页内容分页展示（翻页可看全）')
check(zodiacResult.includes('position: absolute') && !/^\.zr-page \{ flex-direction/mu.test(zodiacResult), '结果页使用绝对定位布局，避免 flex 挤压')

// ---- 所有页面数据必须声明在 private 内（顶层属性不会被当作模板数据源 → 绑定全空） ----
for (const [label, text] of [['首页', page], ['知识页', knowledgePage], ['日历页', calendarPage], ['答题页', zodiacTest], ['结果页', zodiacResult]]) {
  const decl = text.match(/export default \{([\s\S]{0,600})/u)
  check(!!decl && /private:\s*\{/u.test(decl[1]), `${label}页面数据声明在 private 中（否则模板绑定全部为空）`)
}
check(zodiacTest.includes('storage.set') && zodiacResult.includes('storage.get'), '测试结果经本地存储传递')
check(fs.existsSync(path.join(root, 'src', 'common', 'scripts', 'zodiac-scoring.js')), '公共计分脚本位于 common/scripts')
for (const dataFile of ['zodiac_questions.js', 'zodiac_profiles.js', 'zodiac_templates.js']) {
  check(fs.existsSync(path.join(root, 'src', 'common', 'data', dataFile)), `离线数据 ${dataFile} 位于 common/data`)
}
check(page.includes('value="星象分析 ›"') && page.includes('startZodiacTest()') && page.includes("uri: 'pages/zodiac-test'"), '趣味星象内提供星象分析入口并跳转答题页')

check(fs.existsSync(path.join(root, 'src', 'common', 'utils', 'date.js')), '日期工具位于 common/utils/date.js')
check(fs.existsSync(path.join(root, 'src', 'common', 'utils', 'random.js')), '随机工具位于 common/utils/random.js')
check(fs.existsSync(path.join(root, 'src', 'common', 'utils', 'knowledge.js')), '知识逻辑工具位于 common/utils/knowledge.js')
check(page.includes("import { pad, WEEKDAYS, dayInfo, moonPhase") && page.includes("common/utils/date.js"), '主页面从 common/utils 导入日期工具')
check(knowledgeUtils.includes('function mulberry32(') && knowledgePage.includes('common/utils/knowledge.js'), '随机与知识逻辑经共享模块供题库复用')
check(page.includes("common/utils/zodiac.js") && page.includes('zodiacForDate'), '主页面从 common/utils 导入星座工具')
check(manifestPages.includes('pages/knowledge') && manifestPages.includes('pages/calendar'), 'manifest 注册知识大全与日历独立页')
check(knowledgePage.includes('goHome') && knowledgePage.includes("uri: 'pages/index'"), '知识页提供返回主页跳转')
check(calendarPage.includes('goHome') && calendarPage.includes("uri: 'pages/index'"), '日历页提供返回主页跳转')
check(page.includes('openKnowledgePage') && page.includes("uri: 'pages/knowledge'"), '首页知识大全入口跳转独立知识页')
check(page.includes('openCalendarPage') && page.includes("uri: 'pages/calendar'"), '首页今日日历入口跳转独立日历页')

console.log(`\n每日一言静态与逻辑验收通过：${quoteCount} 条可追溯真实语录，${riddles.length} 道可追溯真实知识题。`)  
