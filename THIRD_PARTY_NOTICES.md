# 第三方数据说明

本项目的 2000 条内置语录筛选自一言开源社区官方语句库：

- 项目：`hitokoto-osc/sentences-bundle`
- 地址：https://github.com/hitokoto-osc/sentences-bundle
- 许可证：GNU Affero General Public License v3.0（AGPL-3.0）
- 使用分类：原创（e）、网络（f）、哲学（k）

项目保留官方原始分类文件、许可证、筛选后的完整记录及生成脚本。每条筛选记录包含官方 UUID、正文、分类、出处和作者字段。语句著作权不一定完全归一言社区所有；具体说明以官方仓库 README 为准。

分发包含该语句库的应用时，应一并提供本项目对应源代码并遵守 AGPL-3.0。

## 知识问答：CMRC 2018

- 项目：`ymcui/cmrc2018`
- 地址：https://github.com/ymcui/cmrc2018
- 许可证：Creative Commons Attribution-ShareAlike 4.0 International（CC BY-SA 4.0）
- 本项目用途：600 条“十万个为什么”和 1000 条百科知识

CMRC 2018 是基于中文维基百科上下文、由专家人工标注的中文机器阅读理解数据集。本项目保留原问题、人工答案、答案所在原文句、记录 ID 与条目标题；仅清理 HTML 和空白，不补写或改写知识内容。使用时请保留本说明并注明 CMRC 2018 及原条目标题。

## 脑筋急转弯：ChineseDatasets / brainteasers

- 项目：`ShakaRover/ChineseDatasets`
- 固定版本：`5090c4f0fc9f2fab0e2de7d9d229f034b0524923`
- 地址：https://huggingface.co/datasets/ShakaRover/ChineseDatasets
- 数据卡标注许可证：Apache License 2.0
- 本项目用途：400 条脑筋急转弯

本项目只选择源答案本身带解释信息的记录，谜面和解释性答案均保持源数据内容，不另行生成解析。逐条来源索引和筛选清单见 `data/knowledge-selected.json`，固定版本与校验信息见 `data/knowledge-sources.json`。

## 用户提供内容包 V2（1.7.1 合并）

输入为《米环综合内容库_V2_最终2000条.zip》。1703 条与原库重复，净新增 150 条生活常识和 147 条动物知识卡。新增记录未填写外部来源与许可证，项目保留空值和原始记录，不能据此推定其采用 Apache、CC BY-SA 或 AGPL 授权。本项目的许可证不为这些独立内容补授许可。合并记录、原始主 JSON 与压缩包校验值随源码提供；本次没有补写内容或外部出处。
