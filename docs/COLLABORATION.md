# WorkBuddy、Trae Code 与 Codex 如何协作

共同基准：1.8.10，标签 v1.8.10，发布源码 c82a8a3。开始开发时先同步包含此版本的最新 origin/main；旧功能分支先检查相对主分支的差异，再整合，不能直接用旧目录替换新版本。每个工具使用独立目录，分别采用 workbuddy/、trae/、codex/ 分支前缀，并在交接中写明实际工具名称。

发布后必须报告标签对应提交以及该提交是否已进入 main。Release 存在不代表默认分支已更新；整合主分支应遵循用户授权。

GitHub 是共享的代码记录；两个工具各自使用独立目录，避免 AIoT 构建临时搬移文件时干扰对方。仓库规则不会自动控制第三方工具：首次交给另一工具时，请明确让它读取根目录 AGENTS.md。

可直接发送给另一个工具：

> 请先读取仓库 AGENTS.md、docs/HANDOFF.md 和 docs/CHANGELOG.md。检查本地未提交改动并 fetch GitHub 最新提交，了解另一工具已经修改的内容。使用自己的工作目录和分支完成任务，验证后按文件提交并推送，更新交接记录，返回提交号和分支链接。若只是审查则不要修改。发布安装包时另行遵循 Release 流程。

## 查看另一边的改动

```powershell
git status -sb
git fetch origin --prune
git log --oneline --decorate -10 origin/main
git show --stat <对方提交号>
git show <对方提交号> -- src/pages/index/index.ux
git diff <上次确认的提交号>..origin/main -- src tools
```

并行功能分支使用 GitHub Pull Request 的 Files changed；顺序开发也必须先检查远端，工作区干净后才能 fast-forward。未推送且位于另一台电脑上的修改无法通过 GitHub看到；本地共享目录虽然能看到文件，但不能同时写入。这里没有启用后台监控，下一次任务会主动检查远端。

## 构建与发布

先在工作目录运行 npm.cmd test 并提交源码，再用 git archive 导出该提交到唯一临时目录、解压后构建；导出内容没有 .git，避免构建工具触及版本历史。当前脚本依赖父目录 node_modules，构建副本应位于同一父目录，或先准备对应依赖。构建命令为 npm.cmd run build，必须包含 --enable-jsc；随后运行 npm.cmd run package:release。

发布前核验版本、JSC、SHA-256，并记录模拟器/真机结果。将版本标签指向构建所用提交，推送标签后创建 Release，上传对应 BIN/RPK/源码与许可证。确认 Release 附件可下载才报告发布完成。已发布标签和文件不得静默覆盖，修复另发补丁版本。

本次仅建立协作流程并同步修复源码；仓库规则、PR 模板不是强制分支保护，也没有安装自动发布服务。
