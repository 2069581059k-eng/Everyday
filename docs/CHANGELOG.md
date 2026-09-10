# 版本记录

## 1.8.13（本地构建 + 模拟器验收，未发布）

- **修复 P1**：星象答题页「退出测试」`router.back()` 在 `router.replace` 组成的页面栈中无上一页，直接离开应用（1.8.10 起复现）；改为 `router.replace({ uri: 'pages/index' })` 返回主页，与知识/日历/结果页的返回模式一致。
- **P2 死代码清理**（内联死代码，不改 UI 与用户行为）：
  - `common/scripts/zodiac-scoring.js` 删除未被任何页面使用、模块内部也未调用的 `getZodiacByDate`（答题页内联后不再携带该函数）。
  - `common/utils/date.js` 按消费者拆分：`pad`/`dayInfo` 留守；`WEEKDAYS`/`MOON_PHASES`/`moonPhase` 拆至新文件 `common/utils/moon.js`（仅首页使用）；`HOLIDAYS_2026`/`isLegalHoliday`/`monthHolidayText` 拆至新文件 `common/utils/holiday.js`（仅日历页使用）。日历页/知识页内联后不再携带月相与节假日死代码，首页不再携带节假日死代码。
- `tools/verify-game.mjs`：断言适配新模块结构（主页面改为校验 date.js + moon.js 双导入、节假日断言改读 holiday.js），新增 4 条 P2 清理防回退断言。
- 体积（对比 1.8.12）：RPK 1,060,781 → **1,059,724 B**；模拟器验收确认首页渲染与 1.8.11 **逐像素一致**（拆分重构零 UI 变化）。
- 模拟器验收（Trae Code 独立实例 Trae_AGI，端口 5578）：全链路通过——首页 → 星象遮罩 → 星象分析答题页 → 答一题 → **退出测试返回首页（画面与首页哈希完全一致、应用仍在前台）** → 日历页 → 返回 → 知识页 → 返回。
- RPK SHA-256 `4263B0B4…`；未创建 GitHub Release。

## 1.8.12（本地构建 + 模拟器验收，未发布）

- **纯架构清理，不改任何 UI 与用户行为**：
  - `pages/index/index.ux` 删除已迁移到独立页的旧实现：知识大全模板（`quiz-mask`/`quiz-panel`/`qa-mode`/`read-mode` 等）与答题逻辑（`startQuiz`/`renderQuiz`/`revealAnswer`/`renderDetail`/`nextDetail`/`prevQuestion`/`nextQuestion`/`closeQuiz`）、月历模板（`month-mask` 及 42 格）与月历逻辑（`openCalendar`/`closeCalendar`/`previousMonth`/`nextMonth`/`currentMonth`/`renderCalendar`），以及 `quizVisible`、`calCell/calToday/calColor×42`、`riddle*`/`detail*` 等状态；首页仅保留 `openKnowledgePage()`、`openCalendarPage()` 两个路由入口与每日一言/抽签/收藏/统计/趣味星象。
  - 同步移除随迁移失效的导入与死字段：`RIDDLES`、`mulberry32`、`isLegalHoliday`、`monthHolidayText`、`monthYearText`、`yearDayText`、`calendarHolidayText`。
  - `pages/zodiac-result/zodiac-result.ux` 删除未使用的 `zodiacProfiles`/`zodiacQuestions`/`zodiacTemplates` 导入（结果页仅从 `zodiac_profile_result_v1` 读取已算好的 `analysis`）。
- 体积（对比 1.8.11）：`pages/index/index.jsc` 830,684 → **261,750 B（−568,934 B / −68.5%）**；`pages/zodiac-result/zodiac-result.jsc` 111,931 → **9,459 B（−102,472 B / −91.5%）**；全部 jsc 合计 1,632,392 → **960,986 B（−655.7 KB）**；RPK 1,341,503 → **1,060,781 B**。
- `tools/verify-game.mjs`：更新过时断言（首页日期信息改按 `dayText`/`monthShortText`/`weekdayText` 校验），新增 7 条"迁移完整性"防回退断言。
- 模拟器全功能验收：93 项通过、2 项未通过（均为既有 P1「退出测试离开应用」，与 1.8.11 一致）；知识大全、月历、星座测试、星座结果页**进入与返回均正常**。
- RPK SHA-256 `017d01e4…`；未创建 GitHub Release。

## 1.8.11（当前共同基准）

- 发布源码/构建快照：`dd62eb7`（含 81bfe5f 修复）；tag `v1.8.11`；Release：https://github.com/2069581059k-eng/Everyday/releases/tag/v1.8.11
- 修复知识大全文字不显示：`knowledge.ux` 的 `riddleExplain` / `riddleAnswer` 未在 `private` 声明，导致**阅读类正文与答题答案渲染为空**。
- 新增 `tools/check-private-data.mjs`（页面 `this.X` 赋值必须在 `private` 声明）并接入 `npm test` 防回归。
- 新增全功能模拟器验收链路：`capture-full.mjs`（含屏幕唤醒重试/亮度校验）+ `analyze-full.mjs`（像素级断言），配套 `inspect-png` / `band-report` / `color-census` / `dump-knowledge-daily`。
- 模拟器全功能验收：94 项通过、2 项未通过（均属"退出测试直接离开应用"，P1 未修）；详见 `docs/VERIFY-1.8.10-1.8.11.md`。
- RPK/BIN 1,341,503 B，SHA-256 `57916230c31cbbefdbb6e26859a882a4145413c05f5b3dc141b079e0464e4dc7`。
- **后续开发以 1.8.11 为基准**（原基准 1.8.10）；真机未验，模拟器验证通过。

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
