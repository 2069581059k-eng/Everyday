# 每日一言 · Band 10 Pro

协作入口：[AGENTS.md](AGENTS.md) · [多工具流程](docs/COLLABORATION.md) · [当前交接](docs/HANDOFF.md) · [版本记录](docs/CHANGELOG.md) · [模拟器验收报告](docs/VERIFY-1.8.10-1.8.11.md)。

当前共同开发基准为 **1.8.13**（**首个正式版**，PR #4 合并 `6fcf419`，tag `v1.8.13`），WorkBuddy、Trae Code 与 Codex 后续请从最新 `main` 继续开发。[下载 1.8.13 正式版安装包](https://github.com/2069581059k-eng/Everyday/releases/tag/v1.8.13)（BIN/RPK 各 1,059,724 B，SHA-256 `4263b0b470d3b34f2cef47e7b102596bd2efac048963e7f8938d1b1804a4d74c`）。

1.8.13 内容：修复 P1「退出测试直接离开应用」（`router.back()` 改 `router.replace` 返回主页，与知识/日历/结果页一致）+ P2 死代码清理（`zodiac-scoring.js` 删除未用的 `getZodiacByDate`；`date.js` 按消费者拆分出 `moon.js`/`holiday.js`）。并含 1.8.12 纯架构清理（首页删除已迁移的旧知识/月历实现，`index.jsc` −68.5%、`zodiac-result.jsc` −91.5%）。模拟器验收全链路通过：退出测试后回到首页且应用仍在前台（画面与首页哈希完全一致），首页渲染与 1.8.11 逐像素一致；真机未验。

验证范围（1.8.13）：Vela Band 10 Pro 模拟器全链路验收通过（首页、星象遮罩、答题、退出测试返回主页、日历、知识）；真机尚未验证。此前已知 P1「退出测试直接离开应用」已在 1.8.13 修复。历史版本（1.8.11 知识大全文字修复、1.8.10 绑定修复等）详见 [版本记录](docs/CHANGELOG.md)。

1.8.0 的综合内容库仅使用用户提供的《米环综合内容库_V2_最终完整版_2000plus.zip》，完整替换之前的运行题库；不再合并旧条目。每日一言的独立 2000 条语录保持原样。

## 内容与玩法

- 脑筋急转弯 312 条、十万个为什么 290 条、百科全书 923 条、冷笑话 293 条、鬼故事 205 条，合计 2023 条。
- 每天抽取 50 条，五类各 10 条；问答点击“查看答案”，阅读类直接展开正文，长文可分页。
- 每日一签、签到、收藏、月历、星座、常亮和本地进度继续可用。首次升级重置题目阅读进度，保留收藏与签到等数据。

## 数据与溯源

`data/final-input.json` 是最终包原始主 JSON；`data/final-archive.json` 记录压缩包 SHA-256；`data/knowledge-selected.json` 是运行题库；`data/knowledge-replacement-report.json` 记录替换结果。只转换字段，不补写答案、解析或故事。源包中 1711 条未提供外部来源，保留空值及输入记录编号；内容一致性检查不等于事实核实。

旧版合并输入和脚本仅保留作历史审计，不参与当前构建或最终版源码发行包。原始压缩包和 Git 历史可用于恢复。

## 构建与验收

```powershell
npm.cmd run data:refresh
npm.cmd test                     # 静态/逻辑检查 + 未定义引用 + private 数据声明检查
npm.cmd run build                # 必须包含 --enable-jsc
npm.cmd run package:release
```

仓库规则：**每次代码变动必须在 commit / push 前通过模拟器验收**（见 `AGENTS.md` 的「模拟器验收门槛」）。标准顺序：

1. 将待提交源码（含新增文件）导出到不含 `.git` 的唯一独立目录（`git archive`），建立依赖联接；
2. 需要时执行 `tools/inline-modules.mjs`，再 `aiot build --enable-jsc`；
3. `tools/verify-rpk.mjs` 校验包名、版本与 JSC 字节码；
4. 安装到模拟器并核对实际安装版本（`manifest-watch.json`）；
5. `tools/capture-full.mjs` 跑全链路截图，`tools/analyze-full.mjs` 做像素级断言；
6. 证据归档到 `qa-<版本>/`（已 gitignore），并在 `docs/HANDOFF.md` 记录验收时间、模拟器型号、实际版本、源码快照、包 SHA-256、用例结果与证据路径。

静态验证覆盖五类数量、原文逐字段一致、旧库条目排除、每日分类比例与正文完整保留。安装包、源码与校验文件生成于 `release`（已 gitignore），正式附件发布在 GitHub Release。实际米环阅读效果仍需真机验收。

