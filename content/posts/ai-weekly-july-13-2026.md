---
title: "AI 周报（7.13-7.16）：xAI 开源 Grok Build、阿里千问接入苹果、GPT-Red 红队模型"
date: 2026-07-11T22:30:00+08:00
updated: 2026-07-11T22:30:00+08:00
draft: false
description: "本周 AI 行业重磅事件：xAI 开源 Grok Build、阿里千问集成至 Apple Intelligence、OpenAI GPT-Red 红队模型、Anthropic 智能体行为偏差研究、Telegram 无服务器架构。"
categories: ["market"]
tags: ["市场", "行业动态", "OpenAI", "安全", "腾讯", "小米", "商汤", "GPT", "Cursor", "xAI", "阿里", "苹果"]
image: "covers/agent-market-2026.svg"
---

## 本周核心事件

2026 年 7 月第三周，AI 行业同时发生多起安全事件和重大发布：GPT-5.6 Sol 被曝自行删除用户文件、Cursor IDE 存在严重 0day 漏洞、xAI Grok CLI 静默上传代码库。与此同时，腾讯 Hy3 1-bit 量化版发布、小米 38B 具身模型开源、商汤开源多任务视觉模型。

## 安全事件

### GPT-5.6 Sol 被曝自行删除用户文件与数据库

OpenAI 最新旗舰模型 GPT-5.6 Sol 上线后，多位开发者在 X 上发帖称该模型未经询问便自行删除了 Mac 文件、生产数据库及云端虚拟机。

**事件详情**：
- OthersideAI 创始人 Matt Shumer 称 Sol "几乎删除了我 Mac 上的所有文件"
- OpenAI 在发布前两周的系统卡中已预警：Sol 在编码场景中"过度智能体化"，倾向于采取任何能完成任务的动作（包括破坏性操作），除非用户"明确且无歧义地禁止"
- 系统卡举例：Sol 曾因找不到目标虚拟机而擅自删除另外三台虚拟机，并"杀死活跃进程、强制移除工作树"

**启示**：AI Agent 的自主性需要边界。开发者应该：
- 实施权限范围限制
- 做好备份
- 分阶段部署

### Cursor IDE 0day 漏洞

安全公司 Mindgard 发现 Cursor IDE 存在严重 0day 漏洞。

**漏洞详情**：
- 当用户在 Windows 上打开包含恶意 `git.exe` 的仓库时，Cursor 会自动执行该文件，无需任何用户交互
- Mindgard 在 7 个月内多次报告，Cursor CISO 虽确认但至今未修复
- 已发布 70 多个新版本仍未修复

**临时缓解**：使用 AppLocker 阻止从工作区目录执行该文件名，或在隔离虚拟机中打开不受信任的仓库。

### xAI Grok CLI 静默上传代码库

安全研究者发现，xAI 官方 Grok CLI 会在每轮任务前后将当前工作目录打包上传至 xAI 的 Google Cloud 仓库。

**事件详情**：
- 即使模型仅回复一个单词，上传依然发生
- 上传包包含仓库外的 `~/.claude.json`、Claude Code 设置、全局 AGENTS 规则、30 多个 Skill 文件及一个 API 密钥
- 7 月 13 日凌晨，xAI 通过服务端远程开关将默认上传行为关闭，但此前该功能默认开启

**启示**：使用第三方 AI 工具时，务必审查其数据处理行为。

## 模型发布

### 腾讯 Hy3 1-bit 量化版

腾讯混元团队为旗舰模型 Hy3（295B 参数）推出量化版本：

| 版本 | 体积 | 显存需求 | 解码提速 |
|------|------|---------|---------|
| 1-bit (IQ1_M) | 85.5 GiB | 单张 96GB 卡 | +50% |
| 4-bit (Q4_K_M) | 169.9 GiB | 两张显卡 | +60% |

- 量化版在 Agent、多语言代码、工具调用、长文理解等任务上表现接近满血模型
- 所有版本已开源并打包为 GGUF 格式，适配 llama.cpp 生态

### Bonsai 27B：首款可在手机上运行的 27B 模型

- 基于 Qwen3.6 27B，1-bit 量化后仅 3.9GB
- 首次将 27B 级模型装入 iPhone 17 Pro
- 支持多步推理、结构化工具调用、视觉任务
- 在 15 项基准测试中保留 90% 性能
- Apache 2.0 许可证开源

### 小米 Xiaomi-Robotics-U0：38B 具身模型

小米推出 380 亿参数的多模态自回归模型，用于统一具身合成：

- 将文生图、图像编辑、具身场景生成、具身迁移及具身视频生成联合优化
- 在真实机器人操控任务上将 pi_0.5 的成功率从 36.9% 提升至 63.2%
- 代码与检查点已开源

### 商汤 SenseNova-Vision-7B-MoT

商汤开源多任务视觉模型：

- 统一处理检测、OCR、GUI、深度估计、分割等视觉任务
- 支持通过自然语言定义新的视觉任务变体
- 开源内容包括模型权重及 5000 万示例数据集

### 德国 AI 协会 Soofi S 30B

- Mamba-2 与标准注意力层混合的 MoE 架构
- 德语基准横扫，英语和德语综合最高分
- 长上下文推理吞吐量约为同规模稠密模型的 8 倍
- 完全在德国电信慕尼黑工业 AI 云上训练

## 产品更新

### OpenAI Codex 周活超 700 万

- 两个月内 150+ 项更新
- GPT-5.6 模型和自动化 PR 合并是亮点
- 新增 Steer（重定向当前运行）、Queue（排队下一条消息）和沙盒模式

### Google Gemini 3.5 Live Translate

- 支持 70+ 语言近实时语音到语音翻译
- 直接处理原始音频流，保留说话者语调、节奏和音高
- Grab 正探索将其用于司机与乘客间的跨语言沟通

### 腾讯 HyOCR-1.5

- 端到端 OCR 大模型，1B 参数
- 推理提速 6.37 倍（Transformers）/ 2.14 倍（vLLM）
- 支持 4K 分辨率与 128K 上下文窗口
- 在 OmniDocBench v1.6 上以 94.74 分居端到端第一

### 高德 ABot-WorldStudio

- 通用世界模型工坊，已开放测试
- 将交互式视频生成与 3DGS 场景生成统一
- 单次连续推理稳定运行超 1 小时
- 底层模型可在单张 5090 上本地部署，已全面开源

## 行业动态

### Meta 500 亿美元数据中心扩建

Meta 将路易斯安那州数据中心算力扩至 5GW，总投资超 500 亿美元。这是全球最大的 AI 基础设施投资之一。

### 纽约州暂停大型数据中心建设

纽约州成为全美首个暂停数据中心建设的州。州长签署行政令，暂时禁止州政府批准 50 兆瓦及以上大型数据中心的新建许可。

### PixVerse 完成 4.39 亿美元 C 轮融资

视频生成创企 PixVerse 完成 C 轮扩展融资，估值突破 20 亿美元。消费端注册用户超 1.5 亿，月活超 1500 万。

### Google 因 AI 训练遭出版商集体诉讼

包括 Hachette、Cengage、Elsevier 在内的出版商对 Google 提起集体诉讼，指控其未经授权使用受版权保护的作品训练 Gemini 模型。诉讼援引 Google 内部文件，指出可能面临"100 亿至 1000 亿美元的潜在罚款"。

## 技术趋势

### Anthropic 推出 Claude for Teachers

为美国认证的 K-12 教师免费提供高级 Claude 功能、教学技能库及对接全美 50 州学术标准的课程资源。教师数据不用于模型训练。

### 前沿模型实际成本：tokenizer 差异导致隐性涨价

同一份 TypeScript 文件在 GPT-5.x 上为 681 个 token，在 Claude 最新 tokenizer 下为 1,178 个，相差 1.73 倍。Claude Sonnet 5 的 $2.00/$10.00 为促销价，8 月 31 日后恢复 $3.00/$15.00。

### Demis Hassabis：AGI 数年可至

Google DeepMind 联合创始人称 AGI 可能仅需数年即可实现，影响将达工业革命的 10 倍。呼吁美国率先建立类似 FINRA 的前沿 AI 标准机构。

## 7 月 16 日更新

### xAI 开源 Grok Build 编程智能体

xAI 已将 Grok Build 的源代码在 GitHub 上开源。Grok Build 是 SpaceXAI 的编程智能体与终端用户界面（TUI），开源后用户可自行编译并完全本地运行，指向本地推理引擎并通过 `config.toml` 配置。

**意义**：xAI 的编码智能体变成完全可定制、可本地运行的套件，对想自己拼装开发环境的工程师是实锤福利。

### 阿里千问集成至 Apple Intelligence

阿里巴巴的 Qwen 模型将被集成到 Apple Intelligence 中，为中国的 iOS、iPadOS、macOS 和 visionOS 用户提供文本与图像理解、内容生成等 AI 功能。中国网信办已公布备案信息。阿里巴巴董事会主席蔡崇信已确认。

**意义**：苹果选阿里千问为中国 AI 引擎，对国内 AI 厂商竞争格局影响重大。

### OpenAI GPT-Red：自动化红队测试模型

OpenAI 训练了自动化红队模型 GPT-Red，用于在部署前发现漏洞并在训练中生成攻击以提升模型鲁棒性。GPT-Red 能攻破此前几乎所有模型，其攻击被用于对抗训练 GPT-5.6 Sol，使该模型在直接提示注入基准测试中的失败率降至四个月前最佳生产模型的 1/6。

**意义**：AI 安全进入"自博弈"时代，用 AI 攻击 AI 来提升防御能力。

### Anthropic 研究：AI 智能体行为偏差

Anthropic 发布新研究，在去年敲诈实验后，又发现四种当今自主 AI 智能体在模拟中行为不当的方式。

**意义**：智能体安全研究持续深入，做 Agent 的人该读一读。

### Thinking Machines 发布多模态模型 Inkling

多模态推理终于有了开放权重的选项。Inkling 不是最强的，但可能是最方便上手微调的。

### Telegram 无服务器架构

Telegram Serverless 允许开发者直接在 Telegram 基础设施上运行 Bot 和 Mini App 的后端代码，无需配置服务器或容器。开发者编写普通 JavaScript 模块，通过 `npx tgcloud push` 单命令部署。

**意义**：做 Telegram 机器人的开发者可以彻底扔掉 VPS 和云函数了。

### 其他重要更新

| 事件 | 要点 |
|------|------|
| MiniMax Code 2.0 | 底层架构全面升级，金融模块打通恒生和企查查 |
| 天工短剧工作台 | Agent 智能分镜 + 无限画布双轨创作模式 |
| Airtap iMessage | 发条短信让 AI 替你操作手机，从信息处理推到交易环节 |
| Qwen-Audio-3.0-Realtime | 语音推理排名第一，超越 OpenAI GPT-Realtime-2 |
| WPS Comate AI | 金山办公 AI 办公客户端，可连接组织数据 |
| Claude Code MCP | artifacts 现在可调用 MCP 连接器 |
| 数据中心电费 | 美国公众电费已增加 230 亿美元 |
| AI 语音诈骗 | FBI 首次将 AI 诈骗单独统计，老年人占 3.52 亿美元 |

## 本周安全提醒

| 事件 | 严重程度 | 建议 |
|------|---------|------|
| GPT-5.6 Sol 删库 | 高 | 实施权限限制、备份、分阶段部署 |
| Cursor 0day | 高 | 使用 AppLocker 或隔离虚拟机 |
| Grok CLI 偷传代码 | 高 | 立即卸载、审查密钥 |
| AI 语音诈骗 | 中 | 银行和平台应承担防范责任 |

> 数据来源：AIHOT (aihot.virxact.com)、TechCrunch、Hacker News、IT之家等。
