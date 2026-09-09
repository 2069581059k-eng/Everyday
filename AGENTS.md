# Everyday 双工具协作规则

适用于本仓库所有编码助手。每次任务先阅读本文件、docs/COLLABORATION.md 和 docs/HANDOFF.md。用户当次明确指令优先；只读审查不自动授权修改或发布。

## 开始工作

1. 运行 git status -sb、git remote -v、git log -5 --oneline，确认目录、分支、未提交内容和远端。
2. git fetch origin --prune 后比较 HEAD 与 origin/main。干净的 main 可以 git pull --ff-only；脏工作区不得强行拉取、重置、覆盖或自动丢弃改动。
3. 查看上一次交接之后的 git log、git show 和 git diff，先理解另一工具已经改了什么。HANDOFF 是提示，Git 提交和当前文件才是事实依据。
4. 同时开发必须使用不同 clone/工作目录、不同功能分支。Codex 使用 codex/<任务>；另一工具可使用 agent/<任务>。同一个工作目录只允许一个工具修改或构建。

## 修改、提交、同步

- 保留任务开始前的未提交修改；不要使用 git add . 混入未知文件。按文件暂存，检查 git diff --cached。
- 一项目的一个提交，采用 feat:/fix:/docs:/test: 等清楚的标题；不要只写“更新”。提交正文或 HANDOFF 写明执行工具、基线提交、关键文件、测试和剩余问题。
- 完成已授权的代码修改后运行相关验证、提交并 git push -u origin <当前分支>。并行分支用 PR 比较和整合；未经用户授权不自行合并 PR。
- 用户要求直接写 main 时，只在干净独立 checkout 中操作并普通 push。若远端前进，先 fetch、检查并安全整合，禁止 force push。
- 提交后更新 docs/HANDOFF.md、必要时 docs/CHANGELOG.md；交接包含可查的实现提交号。更新 HANDOFF 的提交可以晚于实现提交，不写循环依赖的“本提交 SHA”。
- 最后核验远端分支 SHA，分别报告“已提交”“已推送”“已发布安装包”。推送失败不能说已同步。

## 构建与升级

- 禁止删除、移动或重建 .git 来解决构建错误；禁止 git reset --hard、git clean -fd 或强推来清空他人的工作。
- AIoT 构建会操作临时目录。必须从已提交源码导出一个不含 .git 的独立构建副本，使用唯一目录名；不得在多人共用 checkout 内同时构建。保护软件拦截时保留现场并排查，不能关闭 JSC 作为替代。
- 升级时同步 package.json、package-lock.json、src/manifest.json 的 versionName/versionCode。已分发版本不得同号覆盖；修复增加补丁号。
- 测试通过不等于米环能启动。设备包必须以 --enable-jsc 构建，并通过 tools/verify-rpk.mjs 检查 app.jsc、pages/index/index.jsc、包名和版本。package:release 会拒绝无 JSC 包。
- 模拟器验证必须核对实际安装版本和截图；安装数量限制、旧缓存、黑屏要明确记录，不能拿旧截图验收。真机结果只按用户或实际设备证据报告。
- Git push 只上传源码。仅在用户要求发布安装包/升级发布时创建 GitHub Release，附 BIN、RPK、源码包、校验文件、第三方说明和许可证；未真机验证的版本注明验证范围，必要时标为预发布。

## 产品约束

- 当前内容库仅来自最终 2023 条包，不能自动混回旧库。独立 2000 条一言语录保持其来源记录。
- 保留用户的分类阅读模式、正文优先布局、移除完成奖励的改动。仅脑筋急转弯和十万个为什么需查看答案；阅读类直接显示正文。
- 不补造出处、许可证或解析；数据一致性与事实准确性要分开说明。
- 包名保持 com.dailyquote.band10pro，不使用个人姓名创建包名或发布文件名。
