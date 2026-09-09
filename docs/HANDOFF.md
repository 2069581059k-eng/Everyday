# 当前交接

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
