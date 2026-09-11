# 版本记录

## 1.8.15（正式版 · 当前共同基准 · 真机验证通过）

- **正式版**：用户真机验证通过（含 1.8.14 收藏/新首页与 1.8.15 筛选/今日签持久化）；源码经 PR #6 合入 main（`b6f5ead`），Release：https://github.com/2069581059k-eng/Everyday/releases/tag/v1.8.15（tag 指向实现提交 `54aa335`；BIN/RPK 各 1,069,951 B，SHA-256 `A53BC716…`；8 附件齐全）。**后续开发基准**（原基准 1.8.13，1.8.14/1.8.15 均已转正）。

- **收藏室类型筛选**：全部/一言/抽签/知识 四档固定槽位筛选按钮（双份 show 切换激活态，规避 Vela 动态 class 限制）；筛选后分页重置、空类型显示「该类型还没有收藏」提示；筛选状态下删除按 id 映射回全量列表（不误删）。
- **签运持久化**：今日签（签级+提示）跨重启保留（重启后首页哈希级一致）；「换一句」不再清空今日签（签运独立于语录）；同日重抽覆盖最新；历史记录最近 16 条；星象遮罩页新增「今日签」与「近签」（最近 3 次签级）两行展示。
- **qualityScore 高分优先选题**：脑筋急转弯每日 10 题中保证 ≥6 条来自 v2 优化重写条目（`pickDaily` 优先池 + 补足逻辑，原版条目仍会出现）；quizSchema 180→181（升级后重置当日进度）。
- **修复（验收发现的行为退化）**：签运持久化后 `fortuneDrawn` 恒为 true，爱心收藏的语录被错误标记为「抽签」类型、「每日一言」类型无法产生；修复为收藏与签运解耦（爱心收藏恒为「每日一言」快照，旧「抽签」条目收藏室仍兼容展示）。
- **可读性**：近签行 12px #93877a → 14px #71665b；筛选空提示 #93877a → #71665b。
- 版本 1.8.15 / 10815；RPK 1,069,951 B（较 1.8.14 +1,202 B），SHA-256 `A53BC716…`；verify-game.mjs 新增 13 条 1.8.15 断言。
- 模拟器全链路验收 ALL-PASS（含筛选四态/签运持久化哈希级验证/筛选态删除/30 题与退出测试回归，0 错误日志）。详见 `docs/HANDOFF.md`。

## 1.8.14（正式版 · 真机验证通过）

- 源码经 PR #5 合入 main（`dc35e91`）；Release：https://github.com/2069581059k-eng/Everyday/releases/tag/v1.8.14（tag 指向实现提交 `236791a`；BIN/RPK 各 1,068,749 B，SHA-256 `144E2F15…`；8 附件齐全；2026-09-10 用户真机验证通过后转正）。

- **题库 v2 整合**：脑筋急转弯 312 条整体替换为优化后题库（107 条低分题重写，qualityScore 4-5，`qualityScore`/`optimized` 元数据随条目保留；2 条转义污染经反转义与旧内容一致），其余四类共 1,711 条不动，知识库总数仍 2,023；替换审计报告 `data/brain-teaser-v2-report.json`（kept 205 / replaced 107）。
- **收藏室（新独立页 `pages/favorites`）**：爱心交互（空心 ♡ / 实心 ♥）+ 快照式持久存储（新增数据层 `common/utils/favorites.js`，首页/知识页/收藏室三页共享存储键 `daily_quote_favorites_v2`）；支持列表分页（4 条/页）、详情长文分页、按类型区分（每日一言/抽签/知识分类）、取消收藏、空态提示「还没有收藏内容」；旧版语录收藏（v1 下标数组）自动迁移为 v2 快照条目。
- **修复 P1（模拟器验收发现）**：旧版收藏迁移只复制不清源——用户在收藏室删除旧收藏后，下次进入首页迁移重跑导致"删不掉的收藏"；修复为迁移完成后立即回写 v1 存档清除 `favorites` 数组（`legacyMigrated` 标志），迁移只发生一次。
- **首页改版**：每日一言主卡片放大为视觉重点；「换一句」（仅切换语录）与「抽签」（仅触发签运）拆为两个独立按钮；下部改为四入口卡片（今日日历/趣味星象/知识大全/收藏室）；知识页新增爱心收藏当前题目（快照含题干/答案/解析）。
- **「宜」模板扩充**：行动模板 12 → 64 条，独立数据模块 `common/data/fortune_templates.js`（覆盖学习/摸鱼/喝水/早睡/收纳/散步/复盘/发呆/省钱/清理桌面/联系朋友/看书/运动/写计划/整理文件等日常场景）；签级（五档）与配色模板同步从 `zodiac.js` 迁出，数据与工具分离。
- **「灵光」全量移除**：UI 文案、状态变量、存储字段、统计逻辑全部清理（非仅隐藏）；品牌名保留 Daily Spark。
- 版本 1.8.14 / 10814（package.json、package-lock.json、src/manifest.json 同步）；RPK 1,068,749 B（对比 1.8.13 +9,025 B），SHA-256 `144E2F15…`；`tools/verify-game.mjs` 新增 15+ 条 1.8.14 防回退断言。
- 模拟器全链路验收 ALL-PASS（36 项、0 错误日志）：迁移修复验证（清理后经首页往返收藏不复活）、爱心收藏像素级验证（实心 ♥ 红像素 +242）、收藏持久化哈希级一致（重启前后收藏室逐字节相同）、删除链路（2→1→空态像素级验证）、换一句/抽签独立生效、日历翻月、星象 30 题与结果页 4 页分页、退出测试 P1 回归。详见 `docs/HANDOFF.md`。

## 1.8.13（首个正式版 · 历史基准）

- **首个正式版**：用户指定并经 PR #4 合入 main（`6fcf419`），Release 转正：https://github.com/2069581059k-eng/Everyday/releases/tag/v1.8.13
- 后续开发以 1.8.13 为基准（原基准 1.8.11）；BIN/RPK 各 1,059,724 B，SHA-256 `4263B0B4…`；tag 指向 `92772a4`（分支 `trae/exit-test-fix`）。

- **修复 P1**：星象答题页「退出测试」`router.back()` 在 `router.replace` 组成的页面栈中无上一页，直接离开应用（1.8.10 起复现）；改为 `router.replace({ uri: 'pages/index' })` 返回主页，与知识/日历/结果页的返回模式一致。
- **P2 死代码清理**（内联死代码，不改 UI 与用户行为）：
  - `common/scripts/zodiac-scoring.js` 删除未被任何页面使用、模块内部也未调用的 `getZodiacByDate`（答题页内联后不再携带该函数）。
  - `common/utils/date.js` 按消费者拆分：`pad`/`dayInfo` 留守；`WEEKDAYS`/`MOON_PHASES`/`moonPhase` 拆至新文件 `common/utils/moon.js`（仅首页使用）；`HOLIDAYS_2026`/`isLegalHoliday`/`monthHolidayText` 拆至新文件 `common/utils/holiday.js`（仅日历页使用）。日历页/知识页内联后不再携带月相与节假日死代码，首页不再携带节假日死代码。
- `tools/verify-game.mjs`：断言适配新模块结构（主页面改为校验 date.js + moon.js 双导入、节假日断言改读 holiday.js），新增 4 条 P2 清理防回退断言。
- 体积（对比 1.8.12）：RPK 1,060,781 → **1,059,724 B**；模拟器验收确认首页渲染与 1.8.11 **逐像素一致**（拆分重构零 UI 变化）。
- 模拟器验收（Trae Code 独立实例 Trae_AGI，端口 5578）：全链路通过——首页 → 星象遮罩 → 星象分析答题页 → 答一题 → **退出测试返回首页（画面与首页哈希完全一致、应用仍在前台）** → 日历页 → 返回 → 知识页 → 返回。

## 1.8.12（本地构建 + 模拟器验收，未发布）

- **纯架构清理，不改任何 UI 与用户行为**：
  - `pages/index/index.ux` 删除已迁移到独立页的旧实现：知识大全模板（`quiz-mask`/`quiz-panel`/`qa-mode`/`read-mode` 等）与答题逻辑（`startQuiz`/`renderQuiz`/`revealAnswer`/`renderDetail`/`nextDetail`/`prevQuestion`/`nextQuestion`/`closeQuiz`）、月历模板（`month-mask` 及 42 格）与月历逻辑（`openCalendar`/`closeCalendar`/`previousMonth`/`nextMonth`/`currentMonth`/`renderCalendar`），以及 `quizVisible`、`calCell/calToday/calColor×42`、`riddle*`/`detail*` 等状态；首页仅保留 `openKnowledgePage()`、`openCalendarPage()` 两个路由入口与每日一言/抽签/收藏/统计/趣味星象。
  - 同步移除随迁移失效的导入与死字段：`RIDDLES`、`mulberry32`、`isLegalHoliday`、`monthHolidayText`、`monthYearText`、`yearDayText`、`calendarHolidayText`。
  - `pages/zodiac-result/zodiac-result.ux` 删除未使用的 `zodiacProfiles`/`zodiacQuestions`/`zodiacTemplates` 导入（结果页仅从 `zodiac_profile_result_v1` 读取已算好的 `analysis`）。
- 体积（对比 1.8.11）：`pages/index/index.jsc` 830,684 → **261,750 B（−568,934 B / −68.5%）**；`pages/zodiac-result/zodiac-result.jsc` 111,931 → **9,459 B（−102,472 B / −91.5%）**；全部 jsc 合计 1,632,392 → **960,986 B（−655.7 KB）**；RPK 1,341,503 → **1,060,781 B**。
- `tools/verify-game.mjs`：更新过时断言（首页日期信息改按 `dayText`/`monthShortText`/`weekdayText` 校验），新增 7 条"迁移完整性"防回退断言。
- 模拟器全功能验收：93 项通过、2 项未通过（均为既有 P1「退出测试离开应用」，与 1.8.11 一致）；知识大全、月历、星座测试、星座结果页**进入与返回均正常**。
- RPK SHA-256 `017d01e4…`；未创建 GitHub Release。

## 1.8.11（历史基准）

- 发布源码/构建快照：`dd62eb7`（含 81bfe5f 修复）；tag `v1.8.11`；Release：https://github.com/2069581059k-eng/Everyday/releases/tag/v1.8.11
- 修复知识大全文字不显示：`knowledge.ux` 的 `riddleExplain` / `riddleAnswer` 未在 `private` 声明，导致**阅读类正文与答题答案渲染为空**。
- 新增 `tools/check-private-data.mjs`（页面 `this.X` 赋值必须在 `private` 声明）并接入 `npm test` 防回归。
- 新增全功能模拟器验收链路：`capture-full.mjs`（含屏幕唤醒重试/亮度校验）+ `analyze-full.mjs`（像素级断言），配套 `inspect-png` / `band-report` / `color-census` / `dump-knowledge-daily`。
- 模拟器全功能验收：94 项通过、2 项未通过（均属"退出测试直接离开应用"，P1 未修）；详见 `docs/VERIFY-1.8.10-1.8.11.md`。
- RPK/BIN 1,341,503 B，SHA-256 `57916230c31cbbefdbb6e26859a882a4145413c05f5b3dc141b079e0464e4dc7`。
- 曾为共同基准（1.8.13 起由 1.8.13 接任）；真机未验，模拟器验证通过。

## 1.8.10（历史基准）

- 发布源码：c82a8a3（v1.8.10）；2026-09-10 同步至 main，供 WorkBuddy、Trae Code 和 Codex 继续开发。
- 知识、日历、星象答题及结果页的数据移入 private，修复模板绑定为空。
- 星象答题选项改绝对定位，结果页采用固定槽位与分页。
- 新增页面 private 数据声明断言；本次同步通过 npm test，未重新执行设备验证。
- 补齐锁文件版本元数据；已有 Release 附件保持原样。

## 1.8.9

- 修复「星象分析不可用」：8 处 router uri 从文件路径格式改为 manifest 路由键名（此前跳转静默失败、无 fail 回调）。
- 文案统一：「形象分析」改「星象分析」。
- Release v1.8.9；模拟器四屏实测通过；真机未验。

## 1.8.8

- 修复启动黑屏：index.ux 缺失 quoteIndex 函数定义导致顶层 ReferenceError（1.8.4–1.8.7 受影响）。
- 新增 tools/check-undefined.mjs 未定义引用静态检查并接入 npm test。
- Release v1.8.8；模拟器通过；用户真机确认不黑屏。

## 1.8.6

- 新增构建期内联工具 tools/inline-modules.mjs：页面自定义 import 递归内联，规避 RPK 不含 common/*.js 的运行时解析失败。
- Release v1.8.6（预发布）；JSC 校验通过，未真机复核。

## 1.8.5

- 首页回退 1.8.3 稳定结构，知识/日历改为路由跳转独立页。
- 未发布安装包（tag v1.8.5 误指向文档提交 026bad2，非版本提交 9aa02a1）。

## 1.8.4

- 五页面架构拆分：知识大全、月历独立页，首页收敛纯首页；数据抽至 common/data、工具抽至 common/utils。
- Release v1.8.4（预发布）；npm test 108 断言全绿。

## 1.8.3

- 多页面骨架 + 趣味星象：30 题/10 维/534 模板离线计分与结果分析，manifest 注册独立页。
- Release v1.8.3（预发布）。

## 1.8.2

- 启动直达主页、Daily Spark 品牌、手动抽签、2026 月历法定节假日配色、答题答案每次进入收起。
- Release v1.8.2（预发布）。

## 已随 1.8.2 发布（历史迭代记录 · d08f23e）

- 每日题库上限提升至 50 条（五类各 10 条）。
- 答题类查看答案后只显示一段最完整答案+解析，不再重复短答案。
- 阅读类左上角显示分类 + 子标题，正文放大；移除来源尾巴与右上角退出按钮。

## 已随 1.8.2 发布（历史迭代记录 · a1e8722）

- 知识面板体验再精简：阅读类去掉顶部大标签与“正文·分类”标签、不重复标题，正文放大；答题类顶部仅显示当前分类小标签。
- 移除正文/解析尾部的“来源”显示与右上角全局退出按钮。

## 1.8.1

- 保留分类阅读与正文优先布局，移除阅读完成奖励。
- 发布前强制检查 JSC 字节码，避免源 JS 包被当作手环发行包。
- 兼容 Windows 新克隆的换行格式。
- 模拟器首页和阅读页通过；真机待用户复测。

## 1.8.0

- 运行内容完全替换为最终 2023 条包，五类各抽取 4 条。
- 旧知识内容不再混入当前题库。

## 1.7.1

- 历史合并版本：2297 条。当前版本不再使用该合并库。
