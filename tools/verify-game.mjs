import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const expectedQuoteCount = 2000
const pagePath = path.join(root, 'src', 'pages', 'index', 'index.ux')
const knowledgePagePath = path.join(root, 'src', 'pages', 'knowledge', 'knowledge.ux')
const calendarPagePath = path.join(root, 'src', 'pages', 'calendar', 'calendar.ux')
const favoritesPagePath = path.join(root, 'src', 'pages', 'favorites', 'favorites.ux')
const zodiacTestPagePath = path.join(root, 'src', 'pages', 'zodiac-test', 'zodiac-test.ux')
const zodiacResultPagePath = path.join(root, 'src', 'pages', 'zodiac-result', 'zodiac-result.ux')
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
const favoritesPage = fs.existsSync(favoritesPagePath) ? fs.readFileSync(favoritesPagePath, 'utf8').replace(/\r\n/g, '\n') : ''
const zodiacTestPage = fs.existsSync(zodiacTestPagePath) ? fs.readFileSync(zodiacTestPagePath, 'utf8').replace(/\r\n/g, '\n') : ''
const zodiacResultPage = fs.existsSync(zodiacResultPagePath) ? fs.readFileSync(zodiacResultPagePath, 'utf8').replace(/\r\n/g, '\n') : ''
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
const moonUtilsPath = path.join(root, 'src', 'common', 'utils', 'moon.js')
const holidayUtilsPath = path.join(root, 'src', 'common', 'utils', 'holiday.js')
const zodiacUtilsPath = path.join(root, 'src', 'common', 'utils', 'zodiac.js')
const knowledgeUtilsPath = path.join(root, 'src', 'common', 'utils', 'knowledge.js')
const favoritesUtilsPath = path.join(root, 'src', 'common', 'utils', 'favorites.js')
const fortuneTemplatesPath = path.join(root, 'src', 'common', 'data', 'fortune_templates.js')
const zodiacScoringPath = path.join(root, 'src', 'common', 'scripts', 'zodiac-scoring.js')
const dateUtils = fs.existsSync(dateUtilsPath) ? fs.readFileSync(dateUtilsPath, 'utf8').replace(/\r\n/g, '\n') : ''
const moonUtils = fs.existsSync(moonUtilsPath) ? fs.readFileSync(moonUtilsPath, 'utf8').replace(/\r\n/g, '\n') : ''
const holidayUtils = fs.existsSync(holidayUtilsPath) ? fs.readFileSync(holidayUtilsPath, 'utf8').replace(/\r\n/g, '\n') : ''
const zodiacScoring = fs.existsSync(zodiacScoringPath) ? fs.readFileSync(zodiacScoringPath, 'utf8').replace(/\r\n/g, '\n') : ''
const favoritesUtils = fs.existsSync(favoritesUtilsPath) ? fs.readFileSync(favoritesUtilsPath, 'utf8').replace(/\r\n/g, '\n') : ''
const fortuneTemplates = fs.existsSync(fortuneTemplatesPath) ? fs.readFileSync(fortuneTemplatesPath, 'utf8').replace(/\r\n/g, '\n') : ''
const randomUtils = fs.existsSync(randomUtilsPath) ? fs.readFileSync(randomUtilsPath, 'utf8').replace(/\r\n/g, '\n') : ''
const zodiacUtils = fs.existsSync(zodiacUtilsPath) ? fs.readFileSync(zodiacUtilsPath, 'utf8').replace(/\r\n/g, '\n') : ''
const knowledgeUtils = fs.existsSync(knowledgeUtilsPath) ? fs.readFileSync(knowledgeUtilsPath, 'utf8').replace(/\r\n/g, '\n') : ''
// 知识逻辑已抽为共享模块：直接取其函数体与 mulberry32，注入 RIDDLES 运行逻辑测试
const knowledgeFnSrc = knowledgeUtils.match(/function (isQaMode|knowledgeDetail|knowledgeAnswer|pickDaily|dailyRiddles|shouldResetQuizProgress|mulberry32)\([\s\S]*?\n\}/gu) || []
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

// ---- 语录（DAILY NOTE）验收：保持原有约束不变 ----
check(manifest.package === 'com.dailyquote.band10pro', '使用中性独立包名')
check(packageJson.version === manifest.versionName, 'package.json 与 manifest.json 版本号一致')
check(!manifest.package.includes('konghongwei'), '包名未包含禁用名称')
check(manifest.config.designWidth === 336, '设计宽度为 Band 10 Pro 的 336')
check(manifest.features.some((item) => item.name === 'system.storage'), '声明本地存储能力')
check(fs.existsSync(iconPath) && fs.statSync(iconPath).size > 1000, '独立应用图标存在')
check(quoteCount === expectedQuoteCount, `内置恰好 ${expectedQuoteCount} 条真实离线DAILY NOTE`)
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
check(riddles.every((item) => Array.from(quizHelpers.knowledgeAnswer(item)).length <= 20), '答案栏短屏可读（答案在分页文本区多行显示，v2 题库最长 19 字）')
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
check(page.includes('知识大全') && page.includes('openKnowledgePage'), '主页提供知识大全入口')
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
check(knowledgePage.includes('quiz-explain" onclick="nextDetail"') && knowledgePage.includes('nextDetail()'), '答案区显示原始解析且支持分页浏览（1.8.17 起点击正文翻页，不再拼接来源）')
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
check(knowledgePage.includes('<text class="read-kicker">{{quizCategory}}</text>') && knowledgePage.includes('<text class="read-title">{{riddleQuestion}}</text>') && knowledgePage.includes('class="read-text" onclick="nextDetail"'), '阅读模式左上显示分类标签，正文含子标题与大号正文（点击翻页）')
check(knowledgePage.includes('riddleExplain = chunks[this.detailIndex]') && knowledgePage.includes("this.answerLabel = this.isQaItem ? '答案' : riddle.category"), '正文不重复“正文·分类”标签，不拼接来源')

// ---- 其它原有功能保持不变 ----
check(page.includes('state.lastDay === today.dayNumber - 1'), '实现连续签到计算')
check(page.includes('toggleFavorite()') && page.includes('favorites'), '实现本地收藏')
check(page.includes('今日日历') && page.includes('dayText') && page.includes('monthShortText') && page.includes('weekdayText'), '首页今日日历卡片显示真实日期信息（月/日/星期）')
check(page.includes('ZODIACS') && page.includes('previousZodiac()') && page.includes('nextZodiac()'), '支持十二星座切换与本地保存')
check(page.includes('moonPhase(today.dayNumber)'), '显示按日期计算的近似月相')
check(fortuneTemplates.includes("'上上签'") && fortuneTemplates.includes("'上签'") && fortuneTemplates.includes("'中签'") && fortuneTemplates.includes("'下签'") && fortuneTemplates.includes("'下下签'"), '抽签包含五个签级')
check(page.includes('Math.random() * FORTUNES.length') && page.includes('drawFortune()'), '抽一签为随机抽取，不再按日期固定自动派签')
check(!page.includes('fortuneForDay(today.dayNumber)'), '已移除按日期固定的自动签级')
check(!page.includes('星象与签运为趣味参考'), '界面不再显示提示性免责声明')
check(page.includes('<text class="brand">Daily Spark</text>'), '品牌已更名 Daily Spark')
check(holidayUtils.includes('HOLIDAYS_2026') && calendarPage.includes('monthHolidayText(y, m)') && calendarPage.includes('#3f7d46') && calendarPage.includes('#c0392b'), '月历内置 2026 法定节假日与周末配色')
check(page.includes('background-color: #f2eee5') && !page.includes('glow-one'), '主题已改为无光效的暖色纸质日历风格')
check(page.includes('onswipe="handleSwipe"') && page.includes("event.direction !== 'right'"), '支持右滑手势（1.8.17 起首页右滑为二次确认退出）')
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
for (const text of [page, knowledgePage, calendarPage, favoritesPage]) {
  check(!/\bright:\s*\d/u.test(text), '布局统一使用 left/top 定位，未使用 right（规避模拟器支持问题）')
}
check(knowledgePage.includes('detail-page') && knowledgePage.includes('detailTotal') && knowledgePage.includes('detailLabel'), '答案/解析过长时可分页（点击正文翻下一段 + 总段数 + 动态页码）')
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
check(page.includes("import { pad, dayInfo } from '../../common/utils/date.js'") && page.includes("import { WEEKDAYS, moonPhase } from '../../common/utils/moon.js'"), '主页面从 common/utils 导入日期与月相工具')
check(knowledgeUtils.includes('function mulberry32(') && knowledgePage.includes('common/utils/knowledge.js'), '随机与知识逻辑经共享模块供题库复用')
check(page.includes("common/utils/zodiac.js") && page.includes('zodiacForDate'), '主页面从 common/utils 导入星座工具')
check(manifestPages.includes('pages/knowledge') && manifestPages.includes('pages/calendar'), 'manifest 注册知识大全与日历独立页')
check(knowledgePage.includes('goHome') && knowledgePage.includes("uri: 'pages/index'"), '知识页提供返回主页跳转')
check(calendarPage.includes('goHome') && calendarPage.includes("uri: 'pages/index'"), '日历页提供返回主页跳转')
check(page.includes('openKnowledgePage') && page.includes("uri: 'pages/knowledge'"), '首页知识大全入口跳转独立知识页')
check(page.includes('openCalendarPage') && page.includes("uri: 'pages/calendar'"), '首页今日日历入口跳转独立日历页')

// ---- 1.8.12 架构清理：首页不再内置知识/月历实现，仅保留路由入口（防回退） ----
check(!page.includes('quiz-mask') && !page.includes('quiz-panel') && !page.includes('quizVisible') && !page.includes('startQuiz'), '首页已移除知识大全模板与答题逻辑（迁移到知识页）')
check(!page.includes('riddleQuestion') && !page.includes('riddleExplain') && !page.includes('dailyRiddleList') && !page.includes('RIDDLES'), '首页已移除题目状态与题库导入')
check(!page.includes('month-mask') && !page.includes('calCell') && !page.includes('calToday') && !page.includes('calColor') && !page.includes('renderCalendar'), '首页已移除月历模板与 42 格状态/逻辑（迁移到日历页）')
check(!page.includes('isLegalHoliday') && !page.includes('monthHolidayText'), '首页不再导入节假日工具（改由日历页负责）')
check(!page.includes('openCalendar(') && !page.includes('previousMonth') && !page.includes('currentMonth'), '首页不再保留月历内部方法，仅留路由入口')
check(page.includes('drawFortune') && page.includes('toggleFavorite') && page.includes('zodiac-mask') && page.includes('startZodiacTest'), '首页保留DAILY NOTE、抽签、收藏与趣味星象')
check(!zodiacResult.includes('zodiacProfiles') && !zodiacResult.includes('zodiacQuestions') && !zodiacResult.includes('zodiacTemplates'), '结果页不再导入题库/模板数据（仅从本地存储读取已算好的 analysis）')

// ---- 1.8.13 P2 清理：工具模块按消费者拆分，消除内联死代码（防回退） ----
check(!zodiacScoring.includes('getZodiacByDate'), '计分脚本不再包含未被任何页面使用的 getZodiacByDate')
check(fs.existsSync(moonUtilsPath) && fs.existsSync(holidayUtilsPath), '月相与节假日工具已拆分至 common/utils')
check(!dateUtils.includes('HOLIDAYS_2026') && !dateUtils.includes('isLegalHoliday') && !dateUtils.includes('moonPhase') && !dateUtils.includes('WEEKDAYS'), 'date.js 仅保留日期核心（节假日/月相不再混入）')
check(calendarPage.includes("import { dayInfo } from '../../common/utils/date.js'") && calendarPage.includes("import { isLegalHoliday, monthHolidayText } from '../../common/utils/holiday.js'"), '日历页仅导入日期核心与节假日工具（不带月相死代码）')

// ---- 1.8.14 题库 v2 / 收藏室 / 首页改版 / 宜模板扩充 / 灵光清理 ----
// 题库 v2：脑筋急转弯 312 条中 107 条为优化重写（qualityScore/optimized 元数据随条目保留）
const brainTeasers = riddles.filter((item) => item.category === '脑筋急转弯')
check(brainTeasers.length === 312, '脑筋急转弯保持 312 条（v2 优化版整体替换）')
check(brainTeasers.filter((item) => item.optimized === true).length === 107, 'v2 题库 107 条优化重写条目已入库')
check(brainTeasers.every((item) => item.qualityScore === undefined || (item.qualityScore >= 3 && item.qualityScore <= 5)), '优化条目质量评分在 3-5 区间')
check(sourceKnowledge.filter((item) => item.category === '脑筋急转弯' && item.optimized === true).length === 107, '可审计清单与运行时优化条目一致')
// 换一句 / 抽签 职能拆分
check(page.includes('value="换一句"') && page.includes('changeQuote()'), '「换一句」独立按钮：仅切换DAILY NOTE')
check(page.includes('value="抽签"') && page.includes('drawFortune()'), '「抽签」独立按钮：仅触发签运')
check(!page.includes('value="抽一签"'), '旧的「抽一签」混合按钮已移除')
// 爱心收藏（1.8.18：文字 ♡/♥ 升级为设计稿图片图标）
check(page.includes('/common/assets/ic-heart-off.png') && page.includes('/common/assets/ic-heart-on.png'), '首页爱心图标：未收藏/已收藏图片双状态切换')
check(knowledgePage.includes('/common/assets/ic-heart-off.png') && knowledgePage.includes('/common/assets/ic-heart-on.png') && knowledgePage.includes('toggleFavorite()'), '知识页提供爱心收藏当前题目（图片图标）')
check(favoritesUtils.includes('FAVORITES_KEY') && favoritesUtils.includes('makeKnowledgeFavorite') && page.includes('FAVORITES_KEY') && knowledgePage.includes('FAVORITES_KEY') && favoritesPage.includes('FAVORITES_KEY'), '收藏统一走 common/utils/favorites.js 数据层（三页共享存储键）')
check(page.includes('migrateOldFavorites'), '旧版语录收藏自动迁移到收藏室 v2')
check(page.includes('legacyMigrated') && page.includes('迁移完成后回写 v1 存档'), '旧版收藏迁移完成后回写清除 v1 下标数组（避免删除后在下次启动复活）')
// 收藏室独立页
check(manifestPages.includes('pages/favorites'), 'manifest 注册收藏室独立页')
check(favoritesPage.includes('还没有收藏内容'), '收藏室提供空状态提示')
check(favoritesPage.includes('removeFavorite') && favoritesPage.includes('backToList') && favoritesPage.includes('openDetail'), '收藏室支持查看详情、取消收藏与返回列表')
check(favoritesPage.includes('fav-pager') && favoritesPage.includes('prevPage') && favoritesPage.includes('nextPage'), '收藏室列表分页浏览')
check(favoritesPage.includes('nextDetailChunk'), '收藏室详情长文分页')
check(!favoritesPage.includes('RIDDLES') && !favoritesPage.includes('QUOTES'), '收藏室使用快照数据，不导入题库（独立于题库架构）')
// 灵光彻底移除
check(!page.includes('灵光') && !page.includes('starsText') && !page.includes('stars') && !page.includes('awardedDay'), '「灵光」UI、状态与存储字段已全部移除')
// 宜模板扩充（独立数据区）
check(fs.existsSync(fortuneTemplatesPath), '宜/签运模板独立位于 common/data/fortune_templates.js')
check(page.includes("import { ASTRO_ACTIONS, ASTRO_COLORS, FORTUNES } from '../../common/data/fortune_templates.js'"), '首页从数据区导入宜/签运模板')
const yiCount = (fortuneTemplates.match(/'[^']{2,8}',?$/gmu) || []).length
const astroActionsMatch = fortuneTemplates.match(/const ASTRO_ACTIONS = \[([\s\S]*?)\]/u)
check(astroActionsMatch && (astroActionsMatch[1].match(/'/g) || []).length >= 80, `宜行动模板明显扩充（≥40 条）`)
check(!zodiacUtils.includes('ASTRO_ACTIONS') && !zodiacUtils.includes('FORTUNES'), '宜/签运模板已从 zodiac.js 工具中迁出（数据与工具分离）')

// ---- 1.8.15 功能增强：收藏室类型筛选 / 签运持久化 / qualityScore 优先选题 ----
// 收藏室类型筛选（固定槽位 + show 切换，规避 Vela 循环项动态 class 限制）
check(favoritesPage.includes('setFilterAll') && favoritesPage.includes('setFilterQuote') && favoritesPage.includes('setFilterFortune') && favoritesPage.includes('setFilterKnowledge'), '收藏室提供 全部/一言/抽签/知识 四档类型筛选')
check(favoritesPage.includes('filterMode') && favoritesPage.includes('function applyFilter('), '筛选基于本地过滤列表实现（filterMode + applyFilter）')
check(favoritesPage.includes('该类型还没有收藏'), '筛选后无结果时提供空提示（可切回全部）')
check(favoritesPage.includes('favoritesItems[i].id === id'), '筛选状态下删除按 id 映射回全量列表（不误删条目）')
check(favoritesPage.includes('show="{{filterMode !== 0}}"') && favoritesPage.includes('show="{{filterMode === 0}}"'), '筛选按钮用固定槽位双份 show 切换激活态（不用动态 class）')
// 签运持久化（今日签跨重启保留 + 历史 + 遮罩页展示）
check(page.includes('state.fortune') && page.includes('fortuneHistory'), '签运与历史记录写入每日存档（state.fortune / fortuneHistory）')
check(!page.includes('this.fortuneDrawn = false'), '换一句不再清空今日签（签运独立于语录持久化）')
check(page.includes('state.fortuneHistory.length > 16'), '签运历史最多保留 16 条')
check(page.includes('item.day !== today.dayNumber'), '同日重抽仅保留最新一条历史')
check(page.includes('maskFortuneText') && page.includes('maskHistoryText') && page.includes('今日未抽签'), '星象遮罩展示今日签与近签历史（未抽时提示）')
// qualityScore 优先选题（脑筋急转弯每日 10 题中 ≥6 条 v2 优化条目）
check(knowledgeUtils.includes('function pickDaily(') && knowledgeUtils.includes('preferred: 6'), '脑筋急转弯每日 10 题优先含 6 条 v2 优化条目（pickDaily）')
check(knowledgePage.includes('quizSchema: 181'), '知识页 quizSchema 升至 181（选题算法变化后升级重置进度）')
if (quizHelpers) {
  const yiSampleDays = [3, 77, 400, 2027, 99999, 2147483000]
  let yiOk = true
  for (const day of yiSampleDays) {
    const list = quizHelpers.dailyRiddles(riddles, day)
    const brainTeasersToday = list.filter((item) => item.category === '脑筋急转弯')
    const optimizedCount = brainTeasersToday.filter((item) => item.optimized === true).length
    if (brainTeasersToday.length !== 10 || optimizedCount < 6) yiOk = false
  }
  check(yiOk, '多日采样：脑筋急转弯每日 10 题中优化条目稳定 ≥6（qualityScore 优先生效）')
}

// ---- 1.8.17 右滑交互重构 / 收藏室详情改版 / 知识页点击翻页 ----
// 右滑全局：所有页面挂 onswipe，返回上一级
check(page.includes('onswipe="handleSwipe"') && page.includes('exitHintVisible') && page.includes('再次右滑退出应用'), '首页右滑二次确认退出（首次提示，提示期内再次右滑才退出）')
check(page.includes('exitHintTimer') && page.includes('3000'), '首页退出提示 3 秒自动消失（模块级计时器不污染渲染数据）')
check(page.includes('if (this.zodiacVisible) { this.zodiacVisible = false; return }'), '星象遮罩打开时右滑直接关闭遮罩（返回上一级）')
check(knowledgePage.includes('onswipe="handleSwipe"') && calendarPage.includes('onswipe="handleSwipe"'), '知识页与日历页右滑返回主页')
check(zodiacTestPage.includes('onswipe="handleSwipe"') && zodiacResultPage.includes('onswipe="handleSwipe"'), '星象答题页与结果页右滑返回主页')
check(favoritesPage.includes('onswipe="handleSwipe"') && favoritesPage.includes('if (this.detailVisible) { this.backToList(); return }'), '收藏室右滑返回上一级（详情→列表，列表/空态→主页）')
// 知识页：移除「继续」按钮，点击正文翻页
check(!knowledgePage.includes('detail-next') && !knowledgePage.includes('read-next') && !knowledgePage.includes("'继续 '"), '知识页「继续」按钮已移除')
check(knowledgePage.includes('class="quiz-explain" onclick="nextDetail"') && knowledgePage.includes('class="read-text" onclick="nextDetail"'), '知识页正文点击翻页（答题区与阅读区一致）')
check(knowledgePage.includes('class="detail-page"') && knowledgePage.includes('class="read-page"'), '知识页保留纯文本页码指示')
// 收藏室详情改版：正文扩容 + 双布局 + 阅读类去「答案：」前缀
check(favoritesPage.includes('CHUNK_CHARS = 120'), '收藏室详情正文分页粒度扩至 120 字（长文单屏容量翻5倍）')
check(favoritesPage.includes('fav-detail-center') && favoritesPage.includes('fav-center-text') && favoritesPage.includes('detailHasBody'), '收藏室详情双布局：无正文类型（DAILY NOTE）走居中大字卡片')
check(favoritesPage.includes('fav-detail-doc') && favoritesPage.includes('fav-detail-box'), '有正文类型保持标题+分页正文框布局')
check(favoritesUtils.includes("const isQa = riddle.displayMode === 'qa'"), '阅读类收藏详情直接用正文（不再拼接「答案：」前缀）')

// ---- 1.8.18 全局 UI 改版：东方美学设计令牌 + 设计稿图片素材 + 统一页面头部 ----
const redesignedPages = [
  ['首页', page], ['知识页', knowledgePage], ['日历页', calendarPage],
  ['收藏室', favoritesPage], ['答题页', zodiacTestPage], ['结果页', zodiacResultPage]
]
for (const [label, text] of redesignedPages) {
  check(text.includes('#f2eee5') && text.includes('#fffdf8') && text.includes('#2b2723') && text.includes('#a83b2d') && text.includes('#ece3d6'), `${label}使用 1.8.18 设计令牌（纸底/卡片/主文字/品牌红/分割线）`)
}
for (const [label, text, backClass] of [['知识页', knowledgePage, 'kn-back'], ['日历页', calendarPage, 'month-back'], ['收藏室', favoritesPage, 'fav-back'], ['答题页', zodiacTestPage, 'zt-back'], ['结果页', zodiacResultPage, 'zr-back']]) {
  check(text.includes('header-line') && text.includes(`class="${backClass}"`), `${label}统一页面头部：回退箭头 + 顶部分割线`)
  check(text.includes(`class="${backClass}-hit"`), `${label}回退箭头带 64px 透明加宽命中层（规避左缘触摸死区）`)
}
check(page.includes('zodiac-back-hit'), '星象遮罩回退箭头带 64px 加宽命中层')
// 几何守卫：全屏面板必须下沉到头部之下（top≥56px），与回退箭头零重叠——面板覆盖头部会吞掉箭头触摸（1.8.18 收藏室事故回归）
check(favoritesPage.includes('.fav-panel { position: absolute; left: 12px; top: 56px;'), '收藏室全屏面板下沉至头部之下（top 56px，不与回退箭头重叠，避免面板吞掉头部触摸）')
// 设计稿素材入库且被引用（图标/插图全部为本地 PNG，无外链）
const assetRefs = new Set()
for (const text of [page, knowledgePage, calendarPage, favoritesPage, zodiacTestPage, zodiacResultPage]) {
  for (const match of text.matchAll(/\/common\/assets\/([\w.-]+\.png)/gu)) assetRefs.add(match[1])
}
check(assetRefs.size >= 8, `页面引用的设计稿素材覆盖导航/状态/插图（实际 ${assetRefs.size} 种）`)
for (const name of assetRefs) {
  check(fs.existsSync(path.join(root, 'src', 'common', 'assets', name)), `设计稿素材已入库：src/common/assets/${name}`)
}
check(page.includes('/common/assets/ic-nav-knowledge.png') && page.includes('/common/assets/ic-nav-calendar.png') && page.includes('/common/assets/ic-nav-zodiac.png') && page.includes('/common/assets/ic-nav-favorites.png'), '首页四宫格功能卡全部使用设计稿导航图标')
check(knowledgePage.includes('/common/assets/ill-mountain.png') && favoritesPage.includes('/common/assets/ill-bamboo.png') && page.includes('/common/assets/ill-sun.png'), '主题插图应用于知识页/收藏室空态/星象遮罩')
// 星象分析：12 星座设计稿插画（按星座名映射本地素材，透明底 96×96）
const zodiacAssetKeys = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']
for (const key of zodiacAssetKeys) {
  check(fs.existsSync(path.join(root, 'src', 'common', 'assets', `zodiac-${key}.png`)), `星座插画已入库：zodiac-${key}.png`)
}
check(zodiacResultPage.includes('zr-z-img') && (zodiacResultPage.match(/\/common\/assets\/zodiac-/gu) || []).length === 12, '结果页 top3 星座卡使用设计稿星座插画（12 枚按名映射）')

console.log(`\nDAILY NOTE静态与逻辑验收通过：${quoteCount} 条可追溯真实语录，${riddles.length} 道可追溯真实知识题。`)
