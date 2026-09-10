# 每日一言 · Band 10 Pro

协作入口：[AGENTS.md](AGENTS.md) · [多工具流程](docs/COLLABORATION.md) · [当前交接](docs/HANDOFF.md) · [版本记录](docs/CHANGELOG.md)。

当前共同开发基准为 **1.8.10**（发布源码 `c82a8a3`），WorkBuddy、Trae Code 与 Codex 后续从最新 `main` 继续开发。此版本包含多页面架构、星象分析及页面数据绑定与分页修复。[下载已有 1.8.10 发布包](https://github.com/2069581059k-eng/Everyday/releases/tag/v1.8.10)。本次同步通过静态与逻辑测试；设备验证范围见交接记录。

1.8.0 的综合内容库仅使用用户提供的《米环综合内容库_V2_最终完整版_2000plus.zip》，完整替换之前的运行题库；不再合并旧条目。每日一言的独立 2000 条语录保持原样。

## 内容与玩法

- 脑筋急转弯 312 条、十万个为什么 290 条、百科全书 923 条、冷笑话 293 条、鬼故事 205 条，合计 2023 条。
- 每天抽取 50 条，五类各 10 条；问答点击“查看答案”，阅读类直接展开正文，长文可分页。
- 每日一签、签到、收藏、月历、星座、常亮和本地进度继续可用。首次升级重置题目阅读进度，保留收藏与签到等数据。

## 数据与溯源

`data/final-input.json` 是最终包原始主 JSON；`data/final-archive.json` 记录压缩包 SHA-256；`data/knowledge-selected.json` 是运行题库；`data/knowledge-replacement-report.json` 记录替换结果。只转换字段，不补写答案、解析或故事。源包中 1711 条未提供外部来源，保留空值及输入记录编号；内容一致性检查不等于事实核实。

旧版合并输入和脚本仅保留作历史审计，不参与当前构建或最终版源码发行包。原始压缩包和 Git 历史可用于恢复。

## 构建

```powershell
npm.cmd run data:refresh
npm.cmd test
npm.cmd run build
npm.cmd run package:release
```

`data:refresh` 只读取最终包快照。安装包、源码与校验文件位于 `release`。静态验证覆盖五类数量、原文逐字段一致、旧库条目排除、每日分类比例与正文完整保留。实际米环阅读效果需要设备验收。
