# 当前交接

## 2026-09-13 · Trae Code 1.8.23 倒数日/纪念日模块（分支 trae/v1.8.23-countdown）

- 任务：新增倒数日/纪念日功能——管理页增删（步进选择无需键盘）、内置法定节日倒数、日历页标记与入口、首页今日日历卡片副标题联动；加强全链路验收防线。
- 基线：origin/main @ `e3a2b6a`（含 1.8.22 正式发布记录，PR #13）；版本 1.8.23 / 10823。
- 改动文件：
  - `src/common/utils/countdown.js`（新增）：倒数日数据层纯函数——nextDate（每年重复取下一次，单次取最近一次）/dayDiff（UTC 稳定）/withCountdown（附剩余天数升序）/builtinFestivals（2026 法定节日起始日，已过去不显示）/clampDay（非法日期钳制）/daysText；kvdb 键 `countdown_events_v1`，上限 MAX_CUSTOM=5
  - `src/pages/countdown/countdown.ux`（新增）：管理页——最近节日卡 + 5 固定槽位 show 切换（规避 Vela 循环动态 class 限制）+ 添加面板（名称 8 预设/月/日/重复四组步进器）+ 删除按槽位下标映射 id 过滤；64px 回退命中层、面板下沉 top≥56、右滑返回；修复 `.cd-list` 显式定位尺寸（无高度塌缩裁剪整页空白）与保存/取消按钮下移避开重叠
  - `src/pages/calendar/calendar.ux`：日期格标记倒数日（countdownMarks，与节假日同色品牌红）+ 倒数日入口
  - `src/pages/index/index.ux`：今日日历卡片副标题显示最近倒数（复用布局只改文案挂点）
  - `tools/inline-modules.mjs`：seen 集合去重——同页同模块多条 import 链只内联一次（修复 HOLIDAYS_2026 顶层 const 重复声明构建失败）
  - `tools/capture-vvd.mjs`：clickUntilChange 第四参 strict（关键链路 3 次无变化直接抛错）+ assertShotMinSize 截图内容下限断言（≥20KB 防空白页漏过）；倒数日链路坐标适配
  - `tools/verify-game.mjs`：1.8.23 断言组；版本三件套 1.8.23 / 10823
- **验收记录（按模拟器验收门槛）**：
  - 验收时间：2026-09-11 23:30–23:55（GMT+8）
  - 模拟器：Trae_AGI（5578 / gRPC 8578，serial emulator-5578）
  - 源码快照：`Temp\build-1.8.23-trae-20260911`（verify-game 全绿 → inline → aiot build --enable-jsc → verify-rpk 通过；构建尾清理 .gitignore EBUSY 沿例忽略）
  - 安装包：`dist/com.dailyquote.band10pro.debug.1.8.23.rpk`，1,303,873 B，SHA-256 `0ECE95DE3128B0BEAC872D55FBC86D0581A532E2F159E184737B9AA9234A21C1`
  - 用例与结果：ALL-PASS（18 张截图，全部 ≥20KB 内容断言）——版本核验 1.8.23/10823 → 退出提示/首页/换一句/星象/日历 → 倒数日空态（内置中秋 12 天）→ 添加面板步进 → 保存 1/5「生日 9月13日·每年 今天」→ 删除回 0/5 → 知识/收藏/星象答题 30 题/结果页 top3 回归全过（知识页「下一题」末题无变化警告沿例非缺陷）
- 发布：PR #14 合入 main（merge commit `ba47390`），tag `v1.8.23` → 实现提交 `5b2aaa7`，Release 8 附件齐全（RPK/BIN 1,303,873 B `0ECE95DE…234A21C1`；源码包 2,566,690 B `CDED475A…D50BE8`）：https://github.com/2069581059k-eng/DAILY-NOTE/releases/tag/v1.8.23
- **真机未验**：倒数日新增/删除、日历倒数标记、首页副标题联动建议真机复核。

## 2026-09-11 · Trae Code 1.8.22 应用图标恢复 1.8.14 版（分支 trae/v1.8.22-icon-restore）

- 任务：用户确认应用图标保留 1.8.14 经典版（紫蓝魔法书+金色星光），撤销 1.8.21 的 imgs 星光轨道应用图标（该图不再占用槽位）；其余 imgs 素材映射（日历/星象/知识/收藏导航、爱心双态、状态图标、四插图）不变。
- 基线：origin/main @ `b948a20`（含 1.8.21 正式发布记录，PR #12）；版本 1.8.22 / 10822。
- 改动文件：`src/common/icon.png`（git 还原 v1.8.14 blob，620,772 B）；版本三件套 1.8.22 / 10822。
- **验收记录（按模拟器验收门槛）**：
  - 验收时间：2026-09-11 21:10–21:20（GMT+8）
  - 模拟器：Trae_AGI（5578 / gRPC 8578，serial emulator-5578）
  - 源码快照：`Temp\build-1.8.22-trae-20260911`（verify-game 全绿 → inline → aiot build --enable-jsc → verify-rpk 通过）
  - 安装包：`dist/com.dailyquote.band10pro.debug.1.8.22.rpk`，1,295,005 B，SHA-256 `E1D3C429BF88D6E8C2F65F01F34CE0910EFABD0B97431771F30149EE981DE632`；RPK 解包 icon.png 哈希与 src 一致
  - 用例与结果：ALL-PASS（14 张截图）——版本核验 1.8.22/10822 → 全场景回归全过（知识页「下一题」末题无变化警告沿例非缺陷）
- 发布：PR #13 合入 main（merge commit `3fd5150`），tag `v1.8.22` → 实现提交 `3826131`，Release 8 附件齐全（RPK/BIN 1,295,005 B `E1D3C429…1DE632`；源码包 2,557,758 B `E9440483…39A7E1`）：https://github.com/2069581059k-eng/DAILY-NOTE/releases/tag/v1.8.22
- **真机未验**：应用图标建议真机复核。

## 2026-09-11 · Trae Code 1.8.21 素材统一 imgs 目录（应用图标 + 日历导航图标补全）（分支 trae/v1.8.21-imgs-assets）

- 任务（用户明确要求「素材必须使用 imgs 目录下的」并复查模拟器）：imgs 新增两枚素材入库——c5272a00（星光轨道）→ `src/common/icon.png` 应用图标（336 画布/240 安全区/透明底，替代 1.8.20 还原的 1.8.14 旧图标）；176d8279（日历）→ `ic-nav-calendar.png` 48×48（此前沿用旧版）。
- 基线：origin/main @ `67f4671`（含 1.8.20 正式发布记录，PR #11）；版本 1.8.21 / 10821。
- 改动文件：`src/common/icon.png`、`src/common/assets/ic-nav-calendar.png`（process-assets-1.8.21.py，PIL --user 安装）；版本三件套 1.8.21 / 10821。
- **验收记录（按模拟器验收门槛）**：
  - 验收时间：2026-09-11 20:35–20:50（GMT+8）
  - 模拟器：Trae_AGI（5578 / gRPC 8578；⚠️ 期间两次被外部以默认端口 5554 启动——poweroff 对第二个实例无效，用 `adb -s emulator-5554 emu kill` 终止后 launch-emulator.mjs 规范重启回 5578/8578）
  - 源码快照：`Temp\build-1.8.21-trae-20260911`（verify-game 全绿 → inline → aiot build --enable-jsc → verify-rpk 通过）
  - 安装包：`dist/com.dailyquote.band10pro.debug.1.8.21.rpk`，705,269 B，SHA-256 `9B568E6AD175C8E493DCE1AAA22C4A7E5C5447EBF8578221979F5109D1B58E3D`；RPK 解包 icon.png / ic-nav-calendar.png 哈希与 src 一致
  - 用例与结果：ALL-PASS（14 张截图）——版本核验 1.8.21/10821 → 首页新日历图标/星光轨道/书本/爱心书签导航图标全可见 → 退出提示白纸卡片置顶 → 原 13 场景回归全过
- 发布：PR #12 合入 main（merge commit `0d72ec5`），tag `v1.8.21` → 实现提交 `d0cdd5c`，Release 8 附件齐全（RPK/BIN 705,269 B `9B568E6A…B58E3D`；源码包 1,967,441 B `21F11F1F…ECAC02`）：https://github.com/2069581059k-eng/DAILY-NOTE/releases/tag/v1.8.21
- **真机未验**：应用图标与日历导航图标建议真机复核。

## 2026-09-11 · Trae Code 1.8.20 应用图标还原 1.8.14 + 退出提示主题化置顶（分支 trae/v1.8.20-icon-exit-hint）

- 任务（用户反馈 1.8.19 三项）：①应用图标与预期不符（1.8.19 包内为设计板裁切碎片，构图被切断）——还原为 1.8.14 版图标（紫蓝魔法书+金色星光）；②右滑退出提示不要使用黑色——改羊皮纸主题卡片（#fffdf8 纸卡 + #ece3d6 描边 + #574e45 墨褐文字）；③提示位置移到屏幕最上方（top 140→12）。
- 基线：origin/main @ `f8c0cfe`（含 1.8.19 正式发布记录，PR #10）；版本 1.8.20 / 10820。
- 改动文件：`src/common/icon.png`（git 还原 v1.8.14 blob）；`src/pages/index/index.ux`（.exit-hint 样式与位置）；`tools/verify-game.mjs`（断言）；`tools/capture-vvd.mjs`（新增 swipeRight 手势场景 + 00-exit-hint 截图）；版本三件套 1.8.20 / 10820。
- **验收记录（按模拟器验收门槛）**：
  - 验收时间：2026-09-11 20:00–20:15（GMT+8）
  - 模拟器：Trae_AGI（5578 / gRPC 8578，serial emulator-5578；⚠️ 期间发现实例被外部以默认端口 5554 重启过，已 poweroff 并用 launch-emulator.mjs 规范重启回 5578/8578）
  - 源码快照：`Temp\build-1.8.20-trae-20260911`（verify-game 全绿 → inline → aiot build --enable-jsc → verify-rpk 通过）
  - 安装包：`dist/com.dailyquote.band10pro.debug.1.8.20.rpk`，1,294,291 B，SHA-256 `B58CA2FC565292740CB3C715CBBEFCF940BA672C205F2664E7C08D2C7D883916`（体积增长来自还原的 1.8.14 高清图标）
  - 用例与结果：ALL-PASS（14 张截图）——版本核验 1.8.20/10820 → 首页右滑退出提示（白纸卡片/屏幕最上方/3s 自动消失，截图 00-exit-hint）→ 原 13 场景回归全过（知识页「下一题」末题无变化警告沿例非缺陷）
- 发布：PR #11 合入 main（merge commit `57ce6d3`），tag `v1.8.20` → 实现提交 `ef4db17`，Release 8 附件齐全（RPK/BIN 1,294,291 B `B58CA2FC…D883916`；源码包 2,557,068 B `EB0A944D…D8100B`）：https://github.com/2069581059k-eng/DAILY-NOTE/releases/tag/v1.8.20
- **真机未验**：退出提示样式/位置与应用图标建议真机复核。

## 2026-09-11 · Trae Code 1.8.19 收藏室交互对齐 + 新素材替换 + 星象遮罩星座插画直显（分支 trae/v1.8.19-favorites-polish）

- 任务（用户六项需求 + 素材替换 + 追加需求）：①收藏室「继续」改知识页式点击正文翻页；②鬼故事等正文开头「答案」前缀移除；③收藏室「分类 · 已收录」重复副标题移除 + 详情正文区扩容（DAILY NOTE 不变）；④右滑退出提示移至屏幕中上方；⑤星象遮罩移除「今日签/近签」显示；⑥imgs 新素材 11 枚替换；⑦追加：星象遮罩插图直接显示当前星座素材。
- 基线：origin/main @ `98ac692`（含 1.8.18 正式发布记录，PR #9）；版本 1.8.19 / 10819。
- 改动文件：
  - `src/pages/favorites/favorites.ux`：移除 `fav-detail-next` 按钮 → `fav-detail-box` 绑定 `nextDetailChunk` 点击翻页 + `detailPageText` 纯文本页码；`cleanDetailBody` 三层清洗（剥「答案：」→ 剥首行重复标题 → 剥「解析：」，兼容旧存档不改数据）；` · 已收录$` 正则隐藏旧副标题；正文框 top 108/h 226（body h 186，分页粒度 120 字）
  - `src/common/utils/favorites.js`：`makeKnowledgeFavorite` 的 `sub` 改空串（新收藏不再写「分类 · 已收录」）
  - `src/pages/index/index.ux`：`.exit-hint` top 428→140；移除 `zodiac-fortune`/`zodiac-history` 与 `refreshMaskFortune`（签运持久化逻辑保留）；`.zodiac-ill` 改 `src="{{zodiacIll}}"`（110×110 方形槽防拉伸），`refreshAstro` 同步 `zodiacImg(zodiac.name)`
  - `src/common/utils/zodiac.js`：新增 `ZODIAC_IMG`（12 星座中文名→素材路径）+ `zodiacImg()`，导出共享；`zodiac-result.ux` 删除页内重复映射改 import（inline-modules 自动内联）
  - `src/common/assets/`（用户提供新图 11 枚入库，透明底裁切缩放）：ic-nav-zodiac/knowledge/favorites、ic-heart-on/off、ic-t-info/ok、ill-sun/mountain/bamboo/night
  - `tools/verify-game.mjs`：1.8.19 断言组；`tools/capture-vvd.mjs`：星象分析按钮坐标 (168,362)
- **验收记录（按模拟器验收门槛）**：
  - 验收时间：2026-09-11 19:20–19:50（GMT+8）
  - 模拟器：Trae_AGI（Vela Band 10 Pro，336×480，端口 5578 / gRPC 8578，adb serial **emulator-5578**；`VELA_SERIAL`/`WB_VELA_AVD` 注入沿 1.8.18 要求）
  - 源码快照：`Temp\build-1.8.19-trae-20260911`（verify-game 全绿 → inline → aiot build --enable-jsc → verify-rpk 通过；构建尾清理 .gitignore EBUSY 沿例忽略）
  - 安装包：`dist/com.dailyquote.band10pro.debug.1.8.19.rpk`，710,972 B，SHA-256 `433787D0C8CA809914276D81A6054FAE596698EA60F480FF84ED93AE6B8F4A17`；RPK 解包逐素材哈希与 src 比对全部一致（26/26）
  - 用例与结果：ALL-PASS（capture-vvd.mjs，证据 `qa-emulator/` 13 张截图）——安装版本核验 1.8.19/10819 → 首页（新导航图标/新爱心/退出提示中上方）→ 星象遮罩（白羊座插画直显）→ 切换（金牛座插画联动）→ 日历 → 知识页 → 收藏室（详情点击翻页、x/y 页码、无「答案」前缀与重复标题、正文框扩容）→ 星象答题 30 题 → 结果页 top3（共享映射渲染正确）
- 发布：PR #10 合入 main（merge commit `e88f1f9`），tag `v1.8.19` → 实现提交 `3f73efd`，Release 8 附件齐全（RPK/BIN 710,972 B `433787D0…8F4A17`；源码包 1,973,071 B `CC92F6AD…9BE7DE`）：https://github.com/2069581059k-eng/DAILY-NOTE/releases/tag/v1.8.19
- **真机未验**：收藏室点击翻页、退出提示新位置、星象遮罩星座插画直显建议真机复核。

## 2026-09-11 · Trae Code 1.8.18 全局视觉改版（东方纸韵）+ 左缘回退箭头命中修复（分支 trae/v1.8.18-ui-redesign）

- 任务：按用户五张设计稿全局改版（图标/UI/主题/组件）+ 星象分析星座形象采用用户提供素材（裁切 12 枚 96×96 透明底）；修复全链路验收发现的收藏详情页回退箭头点击无响应。
- 基线：origin/main @ `b25946f`（含 1.8.17 正式发布记录，PR #8）；版本 1.8.18 / 10818。
- 改动文件：
  - 六页统一改版（设计令牌：纸底 #f2eee5 / 卡片 #fffdf8 / 主文字 #2b2723 / 次要 #7b7268 / 提示 #9a9186 / 品牌红 #a83b2d / 分割线 #ece3d6）：`src/pages/index|knowledge|calendar|favorites|zodiac-test|zodiac-result/*.ux`
  - `src/common/assets/`（新入库 22 种素材）：导航图标 4、爱心双态 2、状态图标 2、主题插图 4（sun/mountain/bamboo/night）、星座插画 12（zodiac-*.png 按名映射至结果页 top3 卡）；`src/common/icon.png` 应用图标换新
  - 统一页面头部：回退箭头 + 顶部分割线；**回退箭头外层 64px 透明命中层**（`.xx-back-hit`），六处（含星象遮罩）
  - `src/pages/favorites/favorites.ux`：全屏面板下沉 top 12→56px（高 456→412，子元素上移 44px 视觉不变），与头部零重叠
  - `tools/verify-game.mjs`：新增 1.8.18 断言（令牌/素材/头部/命中层/面板几何守卫）；`tools/capture-vvd.mjs`：回退统一点 (48,30)、爱心 (289,95)、点击变化自动重试；`tools/diag-tap.mjs` ~ `diag7-tap.mjs`（排障证据链留存）
- **修复 P1（收藏详情页回退箭头点击无响应）**：7 轮递进诊断——层叠顺序调整无效 → 面板几何下沉无效 → 逐点扫查发现 x≥45 可点、x<40 全灭 → 根因：**屏幕左缘 x<40 触摸抖动死区**（模拟器确定性复现，真机边缘手势同风险），40px 箭头 left:10 有效区落入死区。修复 = 面板下沉（零重叠）+ 64px 透明命中层（点击区右移跨死区，视觉不变）；全部二级页同步修复防同类。
- **验收记录（按模拟器验收门槛）**：
  - 验收时间：2026-09-11 15:48–15:57（GMT+8）
  - 模拟器：Trae_AGI（Vela Band 10 Pro，336×480，端口 5578 / gRPC 8578，adb serial **emulator-5578**）
  - ⚠️ capture-vvd.mjs 需显式注入 `VELA_SERIAL=emulator-5578` 与 `WB_VELA_AVD=Trae_AGI`（脚本默认 emulator-5554 / WorkBuddy_Band10Pro 会命中 Temp 下 WorkBuddy 残留 ini 的失效 gRPC 8580 → connect deadline）
  - 源码快照：`Temp\build-1.8.18-trae-20260911`（verify-game 全绿 → inline → aiot build --enable-jsc build success 3973ms；node_modules 复用快照；构建尾清理 .gitignore EBUSY 报错沿例忽略，产物已生成）
  - 安装包：`dist/com.dailyquote.band10pro.debug.1.8.18.rpk`，1,059,874 B，SHA-256 `B3C0C91695C6E173A39D789653D6E6C764C1A5852B31BD5E8F8DF3C19CADA700`；verify-rpk 通过
  - 用例与结果：ALL-PASS（capture-vvd.mjs，证据 `qa-emulator/` 13 张截图 + runtime.log）——安装版本核验 1.8.18/10818 → 首页改版（令牌/四宫格图标/红爱心）→ 换一句 → 星象遮罩/星座切换 → 遮罩回退 → 日历（中秋 25-27 标注）→ 知识页（kvdb 进度持久化在 50/50 末题，「已是最后一题」边界正常，非缺陷）→ 收藏室（筛选栏/2 条/分页）→ DAILY NOTE 详情居中大字双布局 → 星象答题 30 题 → 结果页星座插画（白羊/金牛/摩羯 top3）渲染正确；**6 次回退箭头点击全部生效（0 重试警告）**
- 发布：PR #9 合入 main（merge commit `da83a94`），tag `v1.8.18` → 实现提交 `1921c40`，Release 8 附件齐全（RPK/BIN 1,059,874 B `B3C0C916…CADA700`；源码包 2,320,891 B `02A9F295…00E5`）：https://github.com/2069581059k-eng/DAILY-NOTE/releases/tag/v1.8.18
- **真机未验**：左缘手势与 64px 命中层建议真机复核（尤其收藏详情回退、星象遮罩回退）。

## 2026-09-11 · Trae Code 1.8.17 右滑重构 + 收藏室详情改版 + 知识页点击翻页（分支 trae/v1.8.17-ux）

- 任务（用户四项需求 + 交互重构）：①收藏室长文正文扩容、去重复「答案：」前缀；②每日一言（无正文）详情移除正文框、居中显示；③小米手环右滑不再直接退出——首页二次确认退出、其他页面右滑返回上一级；④知识大全移除「继续」按钮，点击正文翻页。
- 基线：origin/main @ `1dbbbfa`（含 1.8.16 DAILY NOTE 更名，PR #7）；本分支 rebase 其上，版本 1.8.17 / 10817。
- 改动文件：
  - `src/pages/index/index.ux`：`onswipe` + `exitHintVisible` 提示条（模块级 `exitHintTimer`，3s 自动消失）；遮罩打开时右滑关遮罩；**exitGame 延迟 150ms 退出（P1 修复）**
  - `src/pages/knowledge/knowledge.ux` / `calendar.ux` / `zodiac-test.ux` / `zodiac-result.ux`：`onswipe` 右滑返回上一级；知识页 `detail-next`/`read-next` 按钮移除，正文 `onclick="nextDetail"` 翻页 + 纯文本页码
  - `src/pages/favorites/favorites.ux`：`CHUNK_CHARS` 24→120；双布局 `fav-detail-center`（无正文，居中大字）+ `fav-detail-doc`（有正文，框+继续按钮）；`detailHasBody` 判定；右滑 详情→列表→主页
  - `src/common/utils/favorites.js`：`isQa` 判定——仅答题类拼「答案：/解析：」，阅读类直接用 `explain` 作正文
  - `tools/verify-game.mjs`：新增 16 条 1.8.17 断言；修正 4 条旧断言（`detail-next` 按钮→`detail-page` 页码、`event.direction ===`→`!==`、`read-text` 点击翻页等）
- **修复 P1（重要）**：onswipe 回调内同步 `$app.exit()`/`app.terminate()` 撕裂应用表面（重启后左侧持续黑条）。诊断过程：`am stop` 强停路径干净 → 仅应用自退出路径损坏 → `app.terminate()` 单用/`$app.exit()` 单用均复现 → 手势完成后延迟 150ms 退出 → 冷重启复测干净。模拟器手势注入：gRPC `sendMouse` 快速轻扫（起点 x≥56 避开系统边缘手势，6 步 × 8ms）。
- **验收记录（按模拟器验收门槛）**：
  - 验收时间：2026-09-11 10:25–10:50（GMT+8）
  - 模拟器：Trae_AGI（Vela Band 10 Pro，336×480，端口 5578 / gRPC 8578）
  - 源码快照：`Temp\build-1.8.17-trae-20260911`（npm test 全绿 → inline → aiot build --enable-jsc build success 4335ms；node_modules 复制自 1.8.16 快照）
  - 安装包：`dist/com.dailyquote.band10pro.debug.1.8.17.rpk`，1,070,832 B，SHA-256 `DB92D7EFCBBDB6AF305935D747366350E3AAA05E4EA4CC3247303E8FEC8BA41A`；verify-rpk 通过
  - 用例与结果：ALL-PASS（快照内 `qa-1817.mjs`，证据 `qa-1.8.17/` 30+ 张截图 + runtime.log）——退出二次确认（提示条 dark=5718 / 3s 消失 dark=1085 / 二次右滑退出）→ **退出修复（重启后首页哈希级一致、无黑条）** → 遮罩右滑关闭 → 知识页多页阅读条目（继续按钮像素=0、页码=18px、点击翻页生效、爱心 red=159）→ 首页爱心 red=289 → 收藏室一言详情（边框=0/按钮=0/**文字中心 x=165.3 vs 屏幕中心 168**）→ 知识详情（正文框 269px/继续按钮 4025px/翻页生效）→ 右滑 详情→列表→主页 → 日历/答题页/结果页右滑回主页（30 题全答完）
- **平台怪癖备忘（QA 已适配，后续验收注意）**：
  - `pm uninstall` **不清 kvdb 存储**（`/data/persist.db`）：知识页进度、收藏、首页语录状态跨重装持久——QA 需双向翻题与「确保点亮」式爱心断言；
  - 遮罩右滑关闭后**首击有数秒输入延迟**（画面已回主页但点击稍后才生效）——导航断言带重试；
  - gRPC 快速滑动**偶发不被识别**——关键滑动断言带重试；
  - 退出释放常亮后显示器休眠 + 引擎拆卸期首个 `am start` 可能被丢弃——重启断言带唤醒点击 + 轮询。
- **发布（2026-09-11）**：PR #8 合入 main（merge commit `f7da29a`）；tag `v1.8.17` 指向实现提交 `07866bb`（构建产物所用源码，`234cb7b` 仅文档）；Release：https://github.com/2069581059k-eng/DAILY-NOTE/releases/tag/v1.8.17（8 附件：BIN/RPK 各 1,070,832 B SHA-256 `DB92D7EF…8BA41A`、源码包 2,323,021 B SHA-256 `8DFFBCCA…5FB38`、NOTICES + 3 许可证 + sha256.txt；下载回验哈希一致）。**真机未验**（右滑手势与退出修复需真机复核）。

## 2026-09-11 · WorkBuddy(agent) 1.8.16 品牌文案统一（每日一言 → DAILY NOTE）

- 任务（用户要求）：把仓库内所有「每日一言」改为「**DAILY NOTE**」——用户选择「全部 31 处（含历史记录）」与「存档值直改（接受数据风险）」。
- 改动范围（32 处 / 10 文件 + 版本三处同步）：
  - 产品：`src/manifest.json` **应用名 → DAILY NOTE**；`src/common/utils/favorites.js` 与 `src/pages/favorites/favorites.ux` 的收藏类型值/筛选值 → `DAILY NOTE`；`src/pages/index/index.ux`、`src/app.ux` 的日志与注释。
  - 文档与工具：`README.md`、`docs/CHANGELOG.md`、`docs/HANDOFF.md`、`package.json` description、`tools/verify-game.mjs` 断言文案。
  - 校验：替换后全仓库残留「每日一言」= 0，`DAILY NOTE` = 32。
- ⚠️ **已知数据影响（用户已确认接受）**：收藏存档 `type` 由 `'每日一言'` 直改 `'DAILY NOTE'`，**升级前收藏的"一言"条目在 1.8.16「一言」筛选下不显示**（「全部」仍可见）。未加旧值回退；如需可在读取侧补兼容（1 行）。
- 未改动（明确说明）：收藏室筛选按钮文案仍为「一言」（原文非"每日一言"，且 336px 宽筛选栏容纳 10 字符英文有排版风险，未擅自改）。
- **验收工具适配**（1.8.14/1.8.15 改版后我上一轮验收出现 9 项误报，本轮修正）：`capture-full.mjs` 首页坐标（抽签 248,290 / 爱心 287,85 / 知识卡 88,425 / 日历卡 88,351 / 星象卡 248,351）；`analyze-full.mjs` 区域与阈值（功能卡 318–458、按钮 272–308、签章 30–94/228–254、签语 102–302/228–254、知识标题 >0.6%、收藏断言改为红像素 >5%）。
- **验收记录（按模拟器验收门槛）**：
  - 验收时间：2026-09-11 10:00–10:05（GMT+8）
  - 模拟器：WorkBuddy 独立实例 `WorkBuddy_Band10Pro`（Vela Band 10 Pro 336×480，serial `emulator-5580` / gRPC `8580`，数据目录 `D:\AGI\WorkBuddy\Simulator\vvd\WorkBuddy_Band10Pro.vvd`；同时运行 Trae 的 5578，互不干扰）
  - 源码快照：`D:\AGI\WorkBuddy\Temp\iso1816`（含独立依赖副本；`@aiot-toolkit/jsc` 1.0.9）
  - 安装包：`dist/com.dailyquote.band10pro.debug.1.8.16.rpk`，1,069,853 B，SHA-256 `d0975b2652a3c5864bcec0e527c8c9c66e5b7b9bf2ff05497d3a5ad14c081ef1`；`verify-rpk` 通过
  - 用例与结果：**95 项全部通过（0 未通过）**（首页 4 功能卡与换一句/抽签、抽签签章+签语红字、收藏 ♥ 点亮 19.9%、知识大全 4 阅读页正文 + 2 答题未展开 + 2 已展开答案、上一题、日历翻月、星象遮罩/换星座、星象答题 8 边框线与进度条、结果页 4 页与循环回第 1 页、结果页返回主页、再进答题页、**退出测试后应用仍在前台**（1.8.13 P1 修复回归通过）、重启后首页正常）；logcat 0 错误行
  - 证据路径：`qa-1.8.16/`（30 张截图 + logcat.txt / error-lines.txt / runtime.log）
- 版本约束：本次为 1.8.16（符合 ≥1.8.16/10816）；**未创建 Release，真机未验**。


## 2026-09-11 · WorkBuddy(agent) 验收脚本多工具隔离（PR #3 合入 main）

- 背景：同一台机器上 WorkBuddy / TraeCode / Codex 三套工具并行开发，需各自独立的模拟器实例与端口，互不占用。
- 改动范围：**仅验收工具**（不含产品代码/资源）——`tools/capture-full.mjs`、`tools/capture-zodiac.mjs`、`tools/capture-vvd.mjs`
  - 路径/实例/端口改为**环境变量优先**：`WB_VELA_SDK`、`WB_VELA_AVD_HOME`、`WB_VELA_AVD`（实例名）、`WB_VELA_REGISTRY`（实例注册目录）、`WB_EMU_PORT`、`WB_EMU_FORWARD`；默认值指向 WorkBuddy 自己的隔离目录 `D:\AGI\WorkBuddy\Simulator\{sdk,vvd}`。
  - 独立端口：`-port 5580`（adb serial `emulator-5580`）/ `-grpc 8580` / hostfwd `10081`；启动参数补齐 `-grpc`——缺该参数时模拟器**不写运行配置** `pid_*.ini`，工具链会报"未找到模拟器 gRPC 配置"。
  - 只连自己的实例：`deviceSerial()` 仅认 `emulator-<emuPort>` 并在绑定后断言串口；`readRunningConfig()` 按 `avd.dir` 精确匹配，避免误取 Codex(5574) / Trae(5578) 的运行配置。
- 兼容性：默认值均可用环境变量覆盖；其它工具按自己的实例名与端口传参即可复用同一脚本（主分支原先硬编码共享路径，若直接用默认值会因共享 AVD 数据已清理而启动失败）。
- 验收记录（WorkBuddy 隔离环境；模拟器验收门槛；非真机）：
  - 验收时间：2026-09-10 15:52–15:55（GMT+8）
  - 模拟器：WorkBuddy 独立实例 `WorkBuddy_Band10Pro`（Vela Band 10 Pro 336×480，serial `emulator-5580` / gRPC `8580`，数据目录 `D:\AGI\WorkBuddy\Simulator\vvd\WorkBuddy_Band10Pro.vvd`，与 Codex 5574 / Trae 5578 并存互不干扰）
  - 源码快照：`D:\AGI\WorkBuddy\Temp\iso1812`（快照 + 独立依赖副本，`@aiot-toolkit/jsc` 1.0.9，`win32_aiotjsc.exe` 参与构建）
  - 安装包：`com.dailyquote.band10pro.debug.1.8.12.rpk`，1,060,791 B，SHA-256 `95a1d27fa7fc6340bd81ca8774b3d54f2db9498cc4f4324bbb49eff28fbc3bcb`；`verify-rpk` 通过
  - 用例与结果：**93 通过 / 2 未通过**（2 项均为当时既有的 P1「退出测试离开应用」，与该改动前逐条一致 → **行为未变**）；首页/抽签/收藏/知识大全/月历/星象答题/结果页 4 页/返回主页/退出重进 全部通过；logcat 0 错误行
  - 证据路径：`qa-1.8.12-iso/`（30 张截图 + logcat/error-lines/runtime.log）
- 备注：本次仅改验收工具，未改产品代码与资源，故**不产生新版本号**；产品线当前基准为 1.8.15，后续发布须 ≥1.8.16/10816。

## 2026-09-10 · 基准切换：1.8.15 设为共同开发基准（1.8.14/1.8.15 均转正）

- 用户真机验证 1.8.14 与 1.8.15 均通过（1.8.14 收藏/新首页；1.8.15 收藏筛选、今日签持久化）。
- v1.8.14 Release 转正（isPrerelease 已去除，标题「Everyday v1.8.14 正式版」）；PR #6 合入 main（merge commit `b6f5ead`）。
- **v1.8.15 正式版发布**：https://github.com/2069581059k-eng/Everyday/releases/tag/v1.8.15（tag 指向实现提交 `54aa335`；BIN/RPK 各 1,069,951 B，SHA-256 `A53BC716B83786C8AFD672165A38709C35E1E86A0AD0A8AC5A6A5A46BF7E3738`；源码包 2,319,226 B，SHA-256 `a8437e39…`；8 附件齐全）。**1.8.15 成为后续开发共同基准**（原基准 1.8.13）。
- README.md / AGENTS.md / docs/CHANGELOG.md / docs/HANDOFF.md 四处基准说明统一更新为 1.8.15。
- 版本约束：后续发布 ≥1.8.16/10816，禁止同号覆盖。
- 环境备忘：git 代理（127.0.0.1）间歇不可达而 gh API 正常时，可用 `git -c http.proxy= -c https.proxy= <cmd>` 单次绕过（不修改任何 git 配置）；gh release create 的 `--target` 必须使用 `git rev-parse` 核验过的完整 SHA（凭记忆拼接哈希会 422）。

## 2026-09-10 · Trae Code 1.8.15 功能增强：收藏筛选 + 签运持久化 + qualityScore 优先选题（分支 trae/v1.8.15-enhancements）

- 任务（用户选定方向 B）：①收藏室类型筛选；②抽签历史持久化；③v2 题库 qualityScore 高分优先选题。
- 改动文件：
  - 修改：`src/pages/favorites/favorites.ux`（四档筛选栏 + slot 布局下移 + 筛选空提示 + 按 id 删除映射）、`src/pages/index/index.ux`（签运持久化 state.fortune/fortuneHistory、换一句不清签、遮罩页今日签/近签两行、爱心收藏与签运解耦）、`src/common/utils/knowledge.js`（pickDaily 优先选题）、`src/pages/knowledge/knowledge.ux`（quizSchema 181）、`src/manifest.json` / `package.json` / `package-lock.json`（1.8.15/10815）、`tools/verify-game.mjs`（13 条新断言，quizHelpers 注入正则含 pickDaily）
- **修复（验收发现的行为退化）**：签运持久化使 `fortuneDrawn` 恒为 true → 爱心收藏恒被标记「抽签」类型、「DAILY NOTE」类型无法产生；修复为 `makeQuoteFavorite(currentIndex, quote, '', '')` 解耦（旧「抽签」条目收藏室筛选仍兼容）。
- **验收记录（按模拟器验收门槛）**：
  - 验收时间：2026-09-10 22:35–22:42（GMT+8）
  - 模拟器：Trae_AGI（Vela Band 10 Pro，336×480，端口 5578 / gRPC 8578），验收前冷重启（规避 AOD 坏帧）
  - 源码快照：`Temp\build-1.8.15-trae-20260910`（npm test 全绿 → inline → aiot build --enable-jsc；node_modules 复制自 1.8.14b 快照，首次复制有文件缺失经 robocopy /E 增量补齐）
  - 安装包：`dist/com.dailyquote.band10pro.debug.1.8.15.rpk`，1,069,951 B，SHA-256 `A53BC716B83786C8AFD672165A38709C35E1E86A0AD0A8AC5A6A5A46BF7E3738`；verify-rpk 通过
  - 用例与结果：ALL-PASS（`tools/capture-1815.mjs`，证据 `qa-1.8.15/`）——前置清理 → 抽签 → **重启后首页哈希级一致（今日语录+今日签章完整恢复）** → 换一句保留今日签 → 遮罩页签运行（今日签 dark=399 / 近签 dark=208，像素级）→ 爱心收藏（一言+知识）→ **筛选四态（全部 2 条 → 一言 1 条 → 抽签 0 条+空提示 → 知识 1 条 → 全部恢复哈希级一致）** → 筛选态删除（按 id 映射：一言已删、知识条目完好）→ 清空回空态 → 日历翻月 → 星象 30 题 → 结果页 4 页 → 退出测试 P1 回归（今日签保留）；logcat 0 错误行
  - 环境备忘（新增教训）：①**AOD 坏帧假阳性变体**：模拟器长期运行后 gRPC 截图返回「暖色纯屏」帧（colors=32/warm=155281），warm 判定无法识别——shotAwake 已加 colors≥200 防护；②**Vela 渲染怪癖**：父容器（zodiac-mask show）隐藏期间修改子元素 show 状态，父容器显示后子 show 不重算——子元素显隐改用空内容替代 show；③小号中文（12-14px）抗锯齿后核心暗像素稀少，浅灰 #93877a 小字判定需宽阈值（190/180/170）或产品侧加深颜色（本次选择后者，可读性更好）；④并行编辑竞争吞改动本会话再现多次（index.ux private/refreshMaskFortune、verify 断言块、capture 脚本函数），**同文件多处修改必须串行编辑并 grep 核验**。
- 待办：已全部完成——①真机验证通过（用户确认）；②PR #6 合入 main（`b6f5ead`）；③v1.8.15 正式版已发布并设为新基准（见顶部基准切换条目）。

## 2026-09-10 · Trae Code 1.8.14 题库v2 + 收藏室 + 首页改版 + 宜模板扩充（分支 trae/v1.8.14-revamp）

- 任务（用户要求）：①脑筋急转弯题库替换为优化后 v2（312 题 JSON）；②收藏改爱心交互 + 新增收藏室；③首页布局重做（换一句/抽签拆分为独立按钮，突出DAILY NOTE）；④「宜」模板明显扩充；⑤「灵光」功能与代码全量移除；⑥保持多页面架构，index 不回退为巨石页面。
- 改动文件：
  - 新增：`src/pages/favorites/favorites.ux`（收藏室独立页：列表分页/详情长文分页/取消收藏/空态）、`src/common/utils/favorites.js`（三页共享收藏数据层）、`src/common/data/fortune_templates.js`（宜行动 64 条 + 五档签级 + 配色）、`data/brain-teaser-v2-report.json`（v2 替换审计报告）
  - 修改：`src/pages/index/index.ux`（首页改版 + 旧收藏迁移修复）、`src/pages/knowledge/knowledge.ux`（爱心收藏当前题目）、`src/common/utils/zodiac.js`（宜/签运模板迁出）、`src/manifest.json`（版本 1.8.14/10814 + 注册 pages/favorites）、`src/common/data/knowledge.js` 与 `data/final-input.json`/`data/knowledge-selected.json`（题库 v2 重新生成）、`tools/generate-quotes.mjs`（v2 元数据透传）、`tools/verify-game.mjs`（15+ 条新断言）
- **P1 修复（模拟器验收发现）**：旧版收藏迁移源数组不清除 → 用户删除旧收藏后每次进首页重新迁移"复活"。修复：迁移完成后立即回写 v1 存档（`legacyMigrated` 模块标志 + `saveState()` 覆盖清除 `favorites` 数组），迁移只发生一次；防回退断言已入 verify-game.mjs。
- **验收记录（按模拟器验收门槛）**：
  - 验收时间：2026-09-10 21:05–21:30（GMT+8）
  - 模拟器：Trae_AGI（Vela Band 10 Pro，336×480，端口 5578 / gRPC 8578），冷重启后验收（规避 AOD 灰屏假阳性）；安装版本经 `manifest-watch.json` 核对为 1.8.14 / 10814
  - 源码快照：Workspace → `Temp\build-1.8.14-trae-20260910b`（独立无 .git 构建副本，npm test 全绿 → inline-modules 内联 → aiot build --enable-jsc）
  - 安装包：`dist/com.dailyquote.band10pro.debug.1.8.14.rpk`，1,068,749 B，SHA-256 `144E2F1532B63EFFE2765E3FFF5E43D1994FC9E4F303969B88559709754B212F`；verify-rpk 校验通过
  - 用例与结果：36 项 ALL-PASS（验收脚本 `tools/capture-1814.mjs`，证据 `qa-1.8.14/` 38 张截图 + runtime.log + logcat.txt）——前置清理（UI 驱动删除历史遗留收藏至空态）→ 首页新布局 → 换一句/抽签独立生效（抽签签章红像素 +500）→ 收藏室空态（像素级）→ **迁移修复验证（清理后经首页往返收藏不复活，空态哈希一致 `4616f9d3`）** → 首页爱心点亮（实心 ♥ 红像素 +242）→ 知识页 v2 题库（阅读类自动展开/答题类查看答案自适应）+ 爱心收藏 → 收藏室列表 2 条按类型区分（知识大全 + DAILY NOTE）→ 详情/返回列表（哈希一致）/删除（2→1）→ **持久化（am stop/start 重启后收藏室哈希级一致 `881085e6`，详情哈希亦一致）** → 删除最后一条回空态（像素级）→ 日历翻月 → 星象遮罩（宜文案渲染）+ 换星座 → 星座测试 30 题 → 结果页 4 页分页 → 退出测试 P1 回归（返回首页、应用仍在前台）；logcat onError/pagehook/invalid pagename 0 行
  - 环境备忘：①Vela `pm install` 升级保留应用存储、`pm uninstall` 亦不清 storage 且无 `pm clear`——验收"全新状态"需 UI 驱动清理（capture-1814.mjs 前置清理阶段）或专用实例；②验收脚本按钮坐标须按嵌套绝对定位精确计算（首页爱心在 quote-card(14,62) 内，绝对中心 (287,85)，初版坐标误击品牌区导致收藏未添加——已修正并全绿）；③npm test 前对同一文件的并行编辑竞争会丢修改（历史教训再现，第三次），编辑后必须核验落盘。
- Release：https://github.com/2069581059k-eng/Everyday/releases/tag/v1.8.14（发布时为预发布，**2026-09-10 用户真机验证通过后转正**）
  - PR #5 经 merge commit `dc35e91` 合入 main；tag `v1.8.14` 指向实现提交 `236791a`
  - BIN / RPK：各 1,068,749 B，SHA-256 `144E2F1532B63EFFE2765E3FFF5E43D1994FC9E4F303969B88559709754B212F`
  - 源码包：`DailyQuote_Band10Pro_v1.8.14_Source_AGPL.zip`（2,316,392 B，SHA-256 `0834a0c1…`）
  - 另附 sha256 校验文件、THIRD_PARTY_NOTICES、AGPL/Apache/CC-BY-SA 许可证（8 附件齐全，在线核验通过）
- 待办：已全部完成——真机验证通过、Release 已转正；后续版本 ≥1.8.16/10816，禁止同号覆盖（1.8.15 已发布为新基准）。

## 2026-09-10 · Trae Code 基准切换：1.8.13 设为首个正式版与后续开发基准

- 用户在 GitHub 将 Release v1.8.13 转正为正式版（"Everyday v1.8.13正式版"，isPrerelease 已去除），并通过 PR #4 将 `trae/exit-test-fix` 合入 main（`6fcf419`）。**1.8.13 成为首个正式版与后续开发基准**（原基准 1.8.11）。
- 本次为纯文档变更（无运行代码改动，按门槛仅检查文档差异）：README.md / AGENTS.md / docs/CHANGELOG.md / docs/HANDOFF.md 四处基准说明统一更新为 1.8.13；README 清理 1.8.11 时代过时段落。
- tag `v1.8.13` → `92772a4`；实现线：`92772a4`（修复+清理）→ `15d1827`（Release 记录）→ `6fcf419`（PR #4 合并）。
- 版本约束：后续发布必须 ≥1.8.14/10814，禁止同号覆盖。
- 其他工具注意：WorkBuddy 的 `agent-knux-cleanup` 已同步 main（`64b493e`）并新增验收工具多工具隔离改进（`0a4532a`，未进 main）；真机验证仍待用户实测反馈。

## 2026-09-10 · Trae Code 1.8.13 退出测试 P1 修复 + P2 死代码清理

- 分支 `trae/exit-test-fix`（基于 origin/main `ebac2bb` = 1.8.12）；环境 `D:\AGI\TraeCode`（Workspace/Simulator/Cache/Temp 全隔离，实例 Trae_AGI @ 5578/8578）。
- **P1 修复**：`zodiac-test.ux` 的 `quitTest()` 由 `router.back()` 改为 `router.replace({ uri: 'pages/index' })`——replace 组成的页面栈无上一页，back 直接离开应用（1.8.10 起复现）；与 knowledge/calendar/zodiac-result 三页返回模式一致。
- **P2 清理**（上条 HANDOFF 遗留项②）：
  - `zodiac-scoring.js` 删除未被任何页面使用、模块内部也未调用的 `getZodiacByDate`。
  - `date.js` 按消费者拆分：`pad`/`dayInfo` 留守；`WEEKDAYS`/`MOON_PHASES`/`moonPhase` → 新文件 `common/utils/moon.js`（仅首页用）；`HOLIDAYS_2026`/`isLegalHoliday`/`monthHolidayText` → 新文件 `common/utils/holiday.js`（仅日历页用）。日历/知识页内联后不再携带月相与节假日死代码，首页不再携带节假日死代码。
  - `verify-game.mjs`：断言适配新结构 + 4 条防回退断言（getZodiacByDate 不得回归、date.js 不得混入节假日/月相、moon.js/holiday.js 存在、日历页导入 holiday.js）。
- 版本 1.8.13 / 10813（package.json、package-lock.json、src/manifest.json 同步）。
- **验收记录（按模拟器验收门槛）**：
  - 验收时间：2026-09-10 17:06–17:08（GMT+8）
  - 模拟器：Trae_AGI（Vela Band 10 Pro，336×480，端口 5578 / gRPC 8578）；安装版本经 `manifest-watch.json` 核对为 1.8.13 / 10813
  - 源码快照：Workspace → `Temp\build-1.8.13-trae-20260910`（独立无 .git 构建副本，含 node_modules junction）
  - 安装包：`dist/com.dailyquote.band10pro.debug.1.8.13.rpk`，1,059,724 B，SHA-256 `4263B0B470D3B34F2CEF47E7B102596BD2EFAC048963E7F8938D1B1804A4D74C`；verify-rpk 校验通过
  - 用例与结果：全链路通过——首页（暖纸 137,504 像素）→ 趣味星象遮罩（月相文案渲染）→ 星象分析答题页 → 答一题（第 1→2 题）→ **退出测试 → 返回首页（哈希与初始首页完全一致 `441972738e8a97b4`，应用仍在前台——P1 修复生效）** → 日历页 → 返回 → 知识页 → 返回（三次回首页哈希均一致）；首页哈希与 1.8.11 迁移验收完全一致 → 拆分重构零渲染变化
  - 证据路径：`Temp\build-1.8.13-trae-20260910\qa-1.8.13\`（9 张截图 + runtime.log）
- Release：https://github.com/2069581059k-eng/Everyday/releases/tag/v1.8.13（**预发布**，2026-09-10 17:33 由用户指示发布）
  - BIN / RPK：各 1,059,724 B，SHA-256 `4263B0B470D3B34F2CEF47E7B102596BD2EFAC048963E7F8938D1B1804A4D74C`
  - 源码包：`DailyQuote_Band10Pro_v1.8.13_Source_AGPL.zip`（2,730,509 B，SHA-256 `14f9babd…`）
  - 另附 sha256 校验文件、THIRD_PARTY_NOTICES、AGPL/Apache/CC-BY-SA 许可证（8 附件齐全，在线核验通过）
  - tag `v1.8.13` 指向实现提交 `92772a4`；真机未验，待用户实测反馈
- 环境备忘：①模拟器今日两次在运行中被外部 shutdown（非本工具操作，重启后正常，成因未明，其他工具如有模拟器看护请自查）；②暖色判定范围修正——遮罩背景 `#fffdf8` 的 b=248 超出旧上限 245，实为有效暖色（r-b≥5 已可排除灰屏）；③npm test 曾因对 verify-game.mjs 的并行编辑竞争丢失一处修改（历史教训重演），已串行重应用并全绿。

## 2026-09-10 · WorkBuddy(agent) 1.8.12 纯架构清理（首页迁移收尾 + 结果页瘦身）

- 分支 agent-knux-cleanup；实现提交见本条下方的"验收记录"对应源码快照（未提前提交，按门槛先生成快照构建并验收）。
- 任务（用户要求）：把 1.8.4 起"复制而非迁移"的旧实现真正删掉，**不改任何 UI 与用户行为**。
  - `index.ux` 删除：知识大全模板（`quiz-mask`/`quiz-panel`/`qa-mode`/`read-mode` 等）与 `startQuiz/renderQuiz/revealAnswer/renderDetail/nextDetail/prevQuestion/nextQuestion/closeQuiz`；月历模板（`month-mask` + 42 格）与 `openCalendar/closeCalendar/previousMonth/nextMonth/currentMonth/renderCalendar`；状态 `quizVisible`、`calCell/calToday/calColor ×42`、`riddle*/detail*/answerVisible/prev*/next*`；失效导入 `RIDDLES`、`mulberry32`、`isLegalHoliday`、`monthHolidayText` 与死字段 `monthYearText`/`yearDayText`/`calendarHolidayText`。首页仅保留 `openKnowledgePage()`、`openCalendarPage()` 入口 + DAILY NOTE/抽签/收藏/统计/趣味星象。
  - `zodiac-result.ux` 删除未使用的 `zodiacProfiles`/`zodiacQuestions`/`zodiacTemplates` 导入。
- 体积（对比基准 1.8.11）：`pages/index/index.jsc` 830,684 → **261,750 B（−68.5%）**；`pages/zodiac-result/zodiac-result.jsc` 111,931 → **9,459 B（−91.5%）**；jsc 合计 1,632,392 → **960,986 B（−655.7 KB）**；RPK 1,341,503 → **1,060,781 B**。`knowledge/calendar/zodiac-test` 三个 jsc 未变（其内联数据仍被需要）。
- `tools/verify-game.mjs`：原断言"主页面包含真实日期日历信息"依据的 `yearDayText` 属死字段，已按新架构改为校验首页日历卡片 `dayText`/`monthShortText`/`weekdayText`；另加 7 条迁移完整性防回退断言（首页不得再出现 quiz/month/calCell 等旧实现、结果页不得再导入题库模板数据）。
- 版本：1.8.12 / 10812（`package.json`、`package-lock.json`、`src/manifest.json` 同步）。**未发布 Release**（1.8.11 仍是已发布基准，本版为清理构建，是否发布待用户指示）。
- **验收记录（按模拟器验收门槛）**：
  - 验收时间：2026-09-10 14:44–14:48（GMT+8）
  - 模拟器：Vela Band 10 Pro（AVD `Vela_Band10Pro_UI`，336×480，串口动态识别）；安装版本经 `manifest-watch.json` 核对为 1.8.12 / 10812
  - 源码快照：工作区快照（含本次未提交改动）复制到独立无 `.git` 目录 `Documents/huarongdao/dq_b1812`；`src+tools+package*.json` 快照哈希 `ef6a0357b8fa5677aff8cabe2d702fa0cb1f29c115c2ce414921c8d6ccd7aacb`
  - 安装包：`dist/com.dailyquote.band10pro.debug.1.8.12.rpk`，1,060,781 B，SHA-256 `017d01e4327fefe4237baf4fa8a1b803090a7d91afeb7797bf13398156a50069`；`tools/verify-rpk.mjs` 校验通过
  - 用例与结果：93 项通过 / 2 项未通过（2 项均为既有 P1「退出测试直接离开应用」，1.8.11 同表现，非本次引入）。覆盖：首页/抽签/收藏 → 知识大全（4 阅读页正文 4/4、答题展开答案 2/2、上一题）→ 返回主页 → 今日日历（翻月）→ 返回主页 → 星象遮罩/换星座 → 星象答题（8 条选项边框线、进度条 8→138px）→ 结果页 4 页分页与循环 → **结果页返回主页** → 再次进入遮罩/答题页 → 退出测试 → 重启后首页正常；错误日志 `onError`/`invalid pagename` 0 行
  - 证据路径：`qa-1.8.12/`（30 张截图 + `logcat.txt`、`error-lines.txt`、`runtime.log`）
- 已知问题（未修，非本次引入）：①「退出测试」`router.back()` 直接离开应用（P1，建议 `router.replace({uri:'pages/index'})`）；②`calendar.ux` 仍导入未使用的 `WEEKDAYS`/`moonPhase`，`zodiac-test.ux` 内联的 `getZodiacByDate` 未使用——同类死代码，可下轮清理。

## 2026-09-10 · WorkBuddy(agent) 发布 1.8.11 并切换为后续更新基准

- 分支 agent-knux-cleanup；构建快照提交 `dd62eb7`（含修复 81bfe5f）；tag `v1.8.11`；main 已普通 push 前进到本分支（无 force）。
- **基准切换：后续开发以 1.8.11 为基准**（原 1.8.10）。所有工具（WorkBuddy / Trae Code / Codex）请先 `git fetch` 并在 `dd62eb7` 或其后的提交上继续。
- Release：https://github.com/2069581059k-eng/Everyday/releases/tag/v1.8.11
  - BIN / RPK：1,341,503 B，SHA-256 `57916230c31cbbefdbb6e26859a882a4145413c05f5b3dc141b079e0464e4dc7`
  - 源码包：`DailyQuote_Band10Pro_v1.8.11_Source_AGPL.zip`（3,026,041 B，SHA-256 `b88251bb…`）
  - 另附 sha256 校验文件、THIRD_PARTY_NOTICES、AGPL/Apache/CC-BY-SA 许可证
- 验证范围：**Vela Band10 Pro 模拟器全功能验收通过**（94/96；2 项为已知 P1「退出测试 router.back() 离开应用」与模拟器尾部截图偏暗）；**真机未验**，故按流程标注验证范围（未标预发布，是否预发布由用户决定）。
- 已知问题（P1，未修）：星象答题页「退出测试」直接离开应用；建议改 `router.replace({ uri: 'pages/index' })`，修复后需重新构建 + 模拟器验收（属运行代码变更）。
- 本轮提交：`81bfe5f`(修复) · `dd62eb7`(验收工具，构建快照) · `28af984`(验收报告+工具加固) · `754fbf1`(验收记录) · 合并 main 门槛文档及本发布记录。
- 证据：`qa-1.8.11/`（30 张 + logcat/error-lines/runtime.log）、`qa-1.8.10/`（27 张）；报告 `docs/VERIFY-1.8.10-1.8.11.md`。

## 2026-09-10 · WorkBuddy(agent) 1.8.11 知识大全文字修复 + 1.8.10 模拟器全功能验收

- 分支 agent-knux-cleanup；实现提交 81bfe5f（修复）、dd62eb7（验收工具）；基线 f290df0（已含 main a78520a）。本轮按用户要求「用 1.8.10 在模拟器完成全部功能验收」执行。
- **缺陷 1（P0，已修于 1.8.11）**：知识大全**阅读类正文完全空白**（正文区仅 1 种颜色，深色文字 0.00%）、**答题类点开「查看答案」后正文仍空白**（仅剩红色"答案"标签）。
  根因：`knowledge.ux` 给 `this.riddleExplain` / `this.riddleAnswer` 赋值，但**未在 `private: {}` 声明**（Vela 只把 private 声明的属性当模板数据源）——与 1.8.10 同类根因的遗漏项。
  修复：private 补两字段；新增 `tools/check-private-data.mjs`（扫描各页 `this.X =` 是否已声明）并接入 `npm test`。版本 1.8.11 / 10811（三处版本文件同步）。
- **缺陷 2（P1，未修）**：星象答题页「退出测试」用 `router.back()`，因页面栈由 `router.replace` 逐级替换而无上一页，**直接离开应用**（1.8.10、1.8.11 均复现）。建议改 `router.replace({ uri: 'pages/index' })`。
- 验收结论（Vela Band10 Pro 模拟器 336×480；截图 `qa-1.8.10/` 27 张、`qa-1.8.11/` 30 张）：
  - **1.8.10（官方包）**：81 通过 / 9 未通过 → 6 项为该文字缺陷、2 项为模拟器尾部截图偏暗、1 项为退出测试。
  - **1.8.11（修复包）**：94 通过 / 2 未通过 → 仅「退出测试」相关。首页/抽签/收藏/知识题干与翻题/日历/星象遮罩/四选项纵向堆叠（8 条边框线）/进度条推进/结果页 4 页分页与循环/再测一次 全部通过；错误日志 `onError`、`invalid pagename` 0 行。
  - 详细报告：`docs/VERIFY-1.8.10-1.8.11.md`。
- **验收记录（按 main 新增的「模拟器验收门槛」逐项）**：
  - 验收时间：2026-09-10 14:10–14:20（GMT+8）
  - 模拟器：Vela Band10 Pro（AVD `Vela_Band10Pro_UI`，336×480），adb 安装后以 `/data/app/com.dailyquote.band10pro/manifest-watch.json` 核对版本
  - 实际安装版本：1.8.11 / 10811（对照轮 1.8.10 / 10810）
  - 源码快照：`git archive HEAD`（含 81bfe5f 修复 + dd62eb7 工具）导出至独立无 .git 目录 `Documents/huarongdao/dq_b1811`；验收后仅再改动 test 工具与文档，未改运行源码/资源/依赖/构建配置
  - 安装包：`dist/com.dailyquote.band10pro.debug.1.8.11.rpk`，1,341,503 B，SHA-256 `57916230c31cbbefdbb6e26859a882a4145413c05f5b3dc141b079e0464e4dc7`
  - 用例与结果：`docs/VERIFY-1.8.10-1.8.11.md` 第四节（首页/抽签/收藏/知识/日历/星象/结果/重测/退出逐项断言）
  - 证据路径：`qa-1.8.11/`（30 张截图 + `logcat.txt`、`error-lines.txt`、`runtime.log`）、`qa-1.8.10/`（27 张）
- 构建：`git archive` 独立副本 → `tools/inline-modules.mjs` → `aiot build --enable-jsc` → `tools/verify-rpk.mjs` 通过。1.8.11 RPK 1,341,503 B，SHA-256 `57916230c31cbbefdbb6e26859a882a4145413c05f5b3dc141b079e0464e4dc7`。
- 新增工具：`tools/capture-full.mjs`（全链路截图 + 屏幕唤醒重试 + 亮度校验）、`tools/analyze-full.mjs`（文字/红色按钮区分、模式自适应分类、边框线、进度条、分页循环）、`tools/check-private-data.mjs`、`tools/inspect-png.mjs`、`tools/band-report.mjs`、`tools/color-census.mjs`、`tools/dump-knowledge-daily.mjs`。
- 模拟器环境坑（已固化进脚本）：①屏幕会进低功耗态，截图呈黑底白字（亮度 45）或变暗（142–145），`KEYCODE_WAKEUP` 常无效，需点显示区外底部边框唤醒；②**`pm clear` 对 Vela 应用存储无效**，知识进度跨安装残留（本次实测页面从题单第 14 条开始），验收断言应做成"模式无关"；③`@aiot-toolkit/emulator` 的 gRPC 偶发在库回调内崩溃，需进程级兜底；④期望版本以 RPK 文件名解析，versionCode = major+minor(2位)+patch(2位)（1.8.11→10811）。
- 未创建 Release（按 AGENTS.md 需用户指示）；真机未验，真机结论待用户实测。

## 2026-09-10 · Codex 增加提交前模拟器验收门槛

- 用户要求：每次新增功能或代码变动必须先通过模拟器验收；调用失败或验证不通过则不能提交到 GitHub。
- 已写入 AGENTS.md、协作流程和 PR 模板，对 WorkBuddy、Trae Code、Codex 的所有代码分支统一生效。
- 修正旧流程“先提交再导出构建”的冲突：改为待提交源码快照 → 构建 → 模拟器交互验收 → 对齐快照 → 提交/推送。
- 本次仅更新非运行文档，检查差异与格式；没有应用代码变更，未执行模拟器验收。此规则属于仓库操作要求，尚无 GitHub 服务端自动拦截机制。

## 2026-09-10 · WorkBuddy(agent) 同步共同基准 + 并行线审查（无代码改动）

- 分支 agent-knux-cleanup；基线合并提交 f290df0（merge main a78520a），1.8.10 实现提交仍为 c82a8a3。本次仅文档同步与审查，未改任何源码。
- 状态核对：本地工作区干净；远端 agent-knux-cleanup=245df27、main=a78520a、agent/zodiac-fix=179f8b8、PR #1（head=245df27，未合并，待用户/工具处置）。
- 审查 agent/zodiac-fix（Kimi/Trae，基于 bd357b6=1.8.8，本地版本 1.8.9/10809，未合并）：
  - 两线独立确认相同根因（交叉验证成立）：①页面数据必须在 private；②router URI 错误格式静默失败且无 fail 回调；③Vela flex 默认横向。
  - 其 v5 崩溃教训：Vela 模板 for 循环项使用动态 class（`class="{{$item.cls}}"`）→ 整个 app 启动即崩溃。已复查本线 src/pages：无 for、无动态 class，1.8.10 不受影响。
  - 其独有增量（未进基准，保留备用）：页面目录去连字符 zodiactest/zodiacresult（针对真机连字符路由静默失败）、zodiac 数据多行化（最长 117 字符）、verify-game 更严断言（URI 格式/flex 方向/分页）。
- 风险与待决议：
  - 1.8.10 仅模拟器实测，真机未验；若真机复现路由失败，优先评估其去连字符方案。
  - 两线 URI 格式不同（本线 pages/xxx=manifest 键名 vs 其 /pages/xxx=前导斜杠），需真机仲裁后统一。
  - 版本号：v1.8.9 标签已被本线 900c4e4 占用，其分支本地同样声明 1.8.9/10809；下次发布必须 ≥1.8.11/10811，禁止同号覆盖。
  - tag v1.8.5 误指向文档提交 026bad2（应为 9aa02a1），1.8.5 无 Release；按规则不覆盖已有 tag，仅记录。
- 环境注意（本 checkout）：refs/remotes/origin/* 的更新不落盘（fetch 显示成功但 git branch -r 随即看不到），远端分析以 ls-remote 为准，或显式 `git fetch origin +refs/heads/X:refs/heads/tmp-X` 取到本地分支再比对；push、本地分支与提交均正常。

## 2026-09-10 · Codex 同步 1.8.10 共同基准

- 用户指定后续以 1.8.10 为基准，当前开发工具为 WorkBuddy 和 Trae Code，Codex 参与同步与后续维护。
- 原 main：026bad2（1.8.1）；选定基准：v1.8.10 / c82a8a3f00d7883ad1c74dcae2dc8974174ccefa。该提交是原 main 的后代，使用 fast-forward 整合，保留全部历史。
- 发现原因：1.8.10 Release 和标签已存在，但 main 未同步。采用发布标签的源码，未混入桌面 agent/zodiac-fix 分支上另行开发的 1.8.9 改动。
- 保留 1.8.10 页面 private 数据绑定、星象选项绝对定位、结果分页等实现；补齐 package-lock.json 遗留的 1.8.1 版本元数据。
- 本次在独立 checkout 运行 npm.cmd test 通过（静态/逻辑验收及五页未定义调用检查）。未重新构建或做模拟器、真机验收；Release 中的模拟器验证是发布者已有记录。
- 已有发布：https://github.com/2069581059k-eng/Everyday/releases/tag/v1.8.10 。本次不覆盖其标签或附件。
- 后续先 fetch 最新 main，在包含 c82a8a3 的基准上继续；协作工具、分支和执行人须在每次交接中明确。

## 2026-09-10 · WorkBuddy(agent) 1.8.10 星象分析布局与绑定修复

- 分支 agent-knux-cleanup；提交 c82a8a3。
- **关键根因（AIoT/Vela 硬规则）**：页面数据必须声明在 `export default` 的 `private: {}` 内。knowledge / calendar / zodiac-test / zodiac-result 四页把数据写在顶层 → 框架不识别为模板数据源 → **所有 `{{}}` 绑定为空**（文字全空）。index 页原本用 private 所以正常。
  - 定位手法：模拟器截图里按钮静态文案（返回主页/再测一次）能渲染、绑定文案（pageLabel）为空 → 判定为数据源未注册。
- 另外两处修复：
  - 答题页 4 个选项原用 flex+margin → 被压缩成一行重叠；改**绝对定位**（top 190/244/298/352，高 48），并压缩高度避免溢出 480。
  - 结果页原内容超长被截断且不渲染；重写为**全绝对定位 + 固定 3 槽位 + 分页翻页**。
- 新增 `tools/analyze-layout.mjs`：无依赖 PNG 像素分析，用「按钮边框线数量」判定选项是否纵向堆叠（4 选项=8 条线）。
- 新增 `tools/capture-zodiac.mjs`：星象链路专用模拟器验收（首页→遮罩→答题→结果→翻页）。
- verify-game.mjs 新增断言：5 个页面数据必须声明在 private 中。
- 模拟器实测 1.8.10：选项边框线 y=190/237、244/291、298/345、352/399（纵向堆叠✓）；答题页标题/进度/场景/题干齐全；结果页 4 页内容各异（60086/57580/56138/55905 字节）。
- Release：https://github.com/2069581059k-eng/Everyday/releases/tag/v1.8.10；BIN 1,341,491 B，SHA-256 2daa2305…
- **Vela 开发要点（务必遵守）**：①页面数据放 private；②布局一律绝对定位，不要用 flex+margin 堆叠；③router uri 用 manifest 键名（pages/xxx），不是文件路径；④改完必须模拟器实测（tools/capture-zodiac.mjs + analyze-layout.mjs）。

## 2026-09-10 · WorkBuddy(agent) 1.8.9 星象分析可用 + 文案修正

- 分支 agent-knux-cleanup；提交 900c4e4。
- 根因：1.8.3 起的 `router.replace` 全部用了 `pages/<dir>/<file>`（文件名路径），但 Vela 引擎要求 **manifest router.pages 键名**（如 `pages/zodiac-test`）。引擎对错误 uri 静默返回 `invalid pagename`，跳转不生效——这就是 1.8.3「点击形象分析没反应」、1.8.8「星象分析不可用」的根因。
- 修复：8 处 router uri 改回 manifest 键名（index/knowledge/calendar/zodiac-test/result）；顺手把首页按钮 + 测试页标题 + 结果页空态中的「形象分析」全部改为「星象分析」。
- 模拟器实测：首页 35.8KB → 星象遮罩 22.4KB → 答题页 32.7KB → 结果页 19.5KB 四屏字节数全不同，runtime.log 显示 doReplace 成功无 invalid 报错。
- Release：https://github.com/2069581059k-eng/Everyday/releases/tag/v1.8.9；BIN 1,340,727 B，SHA-256 4236f73d…

## 2026-09-10 · WorkBuddy(agent) 1.8.8 黑屏真因修复

- 分支 agent-knux-cleanup；提交 bd357b6。
- 根因（**完全不是 import 机制问题**）：f35af98 数据抽取时误删了 index.ux 中的 `quoteIndex` 函数，但顶层仍调用 `const todayIndex = quoteIndex(today.dayNumber)` → 模块求值即 ReferenceError → 整个页面脚本失败 → 1.8.4/1.8.5/1.8.6 真机/模拟器全部黑屏。
- **之前 108 条验收断言只查「调用存在」不查「定义存在」，让该 bug 逃过所有验收**。
- 修复：补回 `quoteIndex` 函数；新增 `tools/check-undefined.mjs` 静态检查并接入 `npm test`，防止同类问题。
- 模拟器实测 1.8.8：首页/星象/日历全部正常渲染，黑屏消除。
- Release：https://github.com/2069581059k-eng/Everyday/releases/tag/v1.8.8；BIN 1,340,736 B，SHA-256 b9f245f2…
- 教训：内联工具不是修复手段（治不了这个 bug），但保持页面自包含仍是有价值的安全网；**真正缺的是「未定义引用」检查**。

## 2026-09-09 · WorkBuddy(agent) 1.8.6 黑屏根因修复（错误方向）

- 分支 agent-knux-cleanup；实现 5711365（内联工具+根因记录）。
- 根因：1.8.4/1.8.5 页面改用 `import common/*.js` 自定义模块；Vela 真机/模拟器运行时无法解析（RPK 只含页面 .jsc，不含 common/*.js），启动 onInit TypeError 黑屏。对照：1.8.3（数据内嵌、无 import）真机正常。
- 修复：tools/inline-modules.mjs 在打包前递归把页面自定义 import 替换为模块源码（default 导出转 const），产出完全自包含页面。common/data|utils 保留为数据源。
- 发布流程：git archive 副本 → npm run test（源仓库）→ node tools/inline-modules.mjs → aiot build --enable-jsc → verify-rpk → package:release。
- Release：https://github.com/2069581059k-eng/Everyday/releases/tag/v1.8.6（预发布）；BIN 1,340,247 B，SHA-256 c05699a8…。
- 验证：5 页 jsc 自包含、构建+JSC 校验通过；尚未真机复核。

## 2026-09-09 · WorkBuddy(agent) 1.8.4 五页面架构拆分

- 分支 agent-knux-cleanup；实现 a5ca672（页面拆分）→ cb8e206（版本 1.8.4/10804）。
- 落地（按用户目录树）：
  - pages/knowledge/knowledge.ux：知识大全独立页（答题/阅读、进度独立存储 daily_quote_knowledge_v1）
  - pages/calendar/calendar.ux：月历独立页（节假日/周末配色）
  - index.ux 收敛纯首页：抽签/收藏/趣味星象遮罩保留，知识大全/今日日历跳转独立页，均带返回主页
  - common/data：quotes.js / knowledge.js / zodiac_* 全离线；common/utils：date.js/random.js/zodiac.js/knowledge.js
  - verify-game.mjs 多页面断言（index/knowledge/calendar 分开校验），108 断言全绿；JSC 五页面构建通过
- Release：https://github.com/2069581059k-eng/Everyday/releases/tag/v1.8.4（预发布）；BIN 1,081,651 B，SHA-256 7b60a111…，附件齐全。
- 验证：npm test 全绿、verify-rpk 通过；未模拟器/真机实测。
- 遗留：capture-vvd.mjs 的模拟器截图顺序仍按旧首页遮罩（03-zodiac→…→07-riddle-answer）编写，独立页后需在模拟器验证时更新点击路径。

## 2026-09-09 · WorkBuddy(agent) 1.8.3 多页面骨架 + 形象分析

- 分支 agent-knux-cleanup；实现 fbcea99（骨架+形象分析）→ 51f8213（版本 1.8.3/10803）。
- 能力验证：AIoT 工具链支持 manifest 多页面路由与跨页面 import（曾用最小副本实测 build success）。
- 落地：
  - manifest 注册 pages/zodiac-test、pages/zodiac-result，启用 system.router；星象遮罩新增「形象分析」入口。
  - 答题页逐题一屏、进度条，答完离线计分；结果页展示主/次/三星座、核心分析、组合、维度、场景、总结、建议、免责声明，可返回/再测。
  - common/scripts/zodiac-scoring.js + common/data/{zodiac_questions,zodiac_profiles,zodiac_templates}.js 离线承载 30题/12星座/534模板（源自用户 ZIP：日常一页_星座气质测试_30题_534模板_v1.zip，校验文件 30/120/10/12/534）。
- Release：https://github.com/2069581059k-eng/Everyday/releases/tag/v1.8.3（预发布）；BIN 1,073,751 B，SHA-256 25944d71…，附件齐全。
- 验证：npm test 全绿、verify-rpk 通过；未模拟器/真机实测。
- 遗留：知识大全/月历/收藏等仍在 index 页内以遮罩实现；后续可按目录树继续拆分 knowledge、knowledge-detail、zodiac、signbook 等独立页。

## 2026-09-09 · WorkBuddy(agent) 1.8.2

- 分支 agent-knux-cleanup；实现 5e605c4（体验重构）→ 7e5bf56（版本 1.8.2/10802）。
- 需求落地：启动直达主页（去封面翻签）、品牌 Daily Spark 顶部居中、主页「抽一签」手动随机抽句+签级（不再按日期自动）、月历 2026 法定节假日+周末配色、答题类每次进入答案收起。
- Release：https://github.com/2069581059k-eng/Everyday/releases/tag/v1.8.2（预发布）；BIN 1,023,699 B，SHA-256 6f17b1b1…
- 验证：npm test 全绿、verify-rpk 通过；未模拟器/真机实测。

## 2026-09-09 · WorkBuddy(agent) Release 发布

- 已按用户要求把构建产物发布到 GitHub Releases：tag `v1.8.1`（提交 06bb13f，分支 agent-knux-cleanup）。
- Release：https://github.com/2069581059k-eng/Everyday/releases/tag/v1.8.1（预发布）
- 附件（全部 uploaded）：BIN/RPK（各 1,023,408 B，SHA-256 b750dd19…）、sha256、源码 zip、THIRD_PARTY_NOTICES、AGPL/Apache/CC-BY-SA 许可证。
- 说明：JSC 构建与校验通过，静态/逻辑测试通过；未模拟器/真机实测（预发布标注）。后续每次构建完请同样发布到 Releases。

## 2026-09-09 · WorkBuddy(agent) 更新

- 实现提交：4fe3771（阅读类显示分类标签与子标题）、d08f23e（每日 50 条、答题答案去重），分支 agent-knux-cleanup。
- 本轮最新：按要求把每日题库上限由 20 提升到 50（五类各 10 条）；答题类（脑筋急转弯/十万个为什么）查看答案后不再单独显示短答案行，只保留一段最完整的答案+解析；阅读类左上角显示分类（read-kicker）+ 子标题（read-title）+ 大号正文（read-text）。
- 验证：npm test 全绿。
- 构建：JSC 构建成功（新包 1,023,412 字节，SHA-256 c3415e0d…），verify-rpk 通过；规避方式为在独立无 .git 副本中构建并调高本机临时删除保护阈值（CODEBUDDY_SAFE_DELETE_BULK_THRESHOLD），不关闭 JSC。
- 遗留：未模拟器/真机验证；分支未合并 main。

## 2026-09-09 · WorkBuddy(agent)

- 基线：026bad2（main；含 Codex 1.8.1 提交 4cdce2e）。
- 实现提交：a1e8722，分支 agent-knux-cleanup（未合并 main，等待 PR 或用户指示）。
- 任务：按用户反馈继续精简知识面板——标题占比仍大、正文过小。
- 改动（src/pages/index/index.ux、tools/verify-game.mjs）：
  - 答题类（脑筋急转弯/十万个为什么）顶部仅保留当前分类小标签（{{quizCategory}}）。
  - 阅读类（百科/冷笑话/鬼故事）不再显示顶部大标签与“正文·分类”标签，不重复标题，正文 22px 大字号铺满；长文分页步长加大为 84 字/页。
  - 移除正文与解析尾部拼接的“来源”文字（数据溯源字段保留）。
  - 移除右上角全局退出按钮，仅保留右滑退出。
- 验证：npm test 全绿（2000 语录/2023 题静态+逻辑）。JSC 构建与模拟器/真机未执行——本环境构建收尾清理被安全保护拦截，不关闭 JSC 的前提下需在可用环境导出不含 .git 副本构建，并用 tools/verify-rpk.mjs 验收。
- 遗留：请 Codex/用户确认是否合并 main，并完成 JSC 构建与设备验证后再发布。

## 2026-09-09 · Codex

- 基线：21261c3（1.8.0 最终 2023 条内容）。
- 实现提交：4cdce2e（1.8.1）；后续协作规则单独提交。
- 合入另一工具已有的分类阅读模式、正文优先布局和移除完成奖励改动，未重写用户内容。
- 修复：发行打包增加 JSC 检查；无字节码的 1.8.0 故障 BIN 被检查器拒绝；版本更新为 1.8.1。生成与校验脚本兼容 CRLF，新克隆已通过 npm test。
- 关键文件：src/pages/index/index.ux、tools/verify-game.mjs、tools/verify-rpk.mjs、tools/package-release.mjs、三个版本文件、.gitattributes。
- 验证：JSC 构建与包检查通过；模拟器实际版本 1.8.1，首页和阅读页已显示。手环真机黑屏是否消失仍需用户安装后反馈，不能提前宣布已解决。
- 已验收 BIN：1023366 字节，SHA-256 48e94abd88af784a905686b1b68ed1089d9ad78cb7cc0f667088c6bba1db2f98。
- 模拟器曾因安装应用数量 21 而拒绝新包；按用户要求卸载 13 个旧测试应用后成功安装，保留 8 个预置应用。
- 本地原 checkout 出现构建期间文件临时移动；同步使用独立 clone，未对原脏工作区执行 reset/clean。继续工作前请核对自己所在目录和远端。
- GitHub Release 安装附件尚未发布。源码推送与 Release 发布是两件事。

## 后续交接格式

每次把最新记录放在顶部，保留必要历史：日期/执行工具、基线与实现提交、任务目标、关键文件及理由、测试命令和结果、设备验证范围、已知问题、分支或 PR、Release 状态。不要把 token、密码或私钥写入记录。
