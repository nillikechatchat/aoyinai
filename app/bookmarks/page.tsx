import Link from 'next/link'
import { siteConfig } from '@/lib/site'

export const metadata = {
  title: '收藏',
  description: '精选收藏的 AI 领域优质文章，覆盖 Agent 工程、Skill 开发、AI 工具、开源项目等方向。',
  alternates: { canonical: `${siteConfig.url}/bookmarks` }
}

const bookmarks = [
  {
    title: 'Harness Engineering：AI Coding 的第三次范式跃迁',
    summary: 'AI Coding 三次范式跃迁：Prompt→Context→Harness。四种 Agent 失败模式，四根支柱（上下文架构/Agent 专业化/持久化记忆/结构化执行）。真实项目落地 .harness/ 目录，AI 代码率从 25% 提升至 90%。',
    url: 'https://mp.weixin.qq.com/s/rlIyIIZOXFObNIXbPI7gDg',
    source: '阿里云开发者',
    tags: ['Harness', 'Agent', '工程实践']
  },
  {
    title: 'Spec-Driven Development：让 AI 编程从"快"到"可控"',
    summary: 'SDD 定义：Spec 是唯一真实来源，代码是派生产物。三文件体系 spec.md+plan.md+tasks.md+constitution.md，四阶段 Specify→Plan→Implement→Validate。API 变更周期缩短 75%，错误减少 50%。',
    url: 'https://mp.weixin.qq.com/s/hVizUucsy8rwFOUR-VZ6wA',
    source: '阿里云开发者',
    tags: ['SDD', '工程实践', 'Harness']
  },
  {
    title: 'GenericAgent：3300 行代码的极简自进化 Agent',
    summary: '核心代码 3300 行，Agent Loop 仅 92 行。同样任务 Token 消耗为 Claude Code 的 35.1%、OpenClaw 的 29.8%。9 个原子工具 + 分层记忆架构(L0-L4) + 上下文截断压缩。',
    url: 'https://mp.weixin.qq.com/s/35PEdUfcZn5Z7W3jFGIDqg',
    source: '智猩猩AI',
    tags: ['Token优化', 'Agent', '极简架构']
  },
  {
    title: 'Claude Code Skill 渐进式披露机制揭秘',
    summary: '三层渐进式披露：第 1 层只读头部 2 行（~90 Token），第 2 层匹配后读完整 SKILL.md（~3000 Token），第 3 层执行时才加载资源文件。104 个 Skill 启动只多花 0.5 秒。',
    url: 'https://mp.weixin.qq.com/s/fSKD92UFm2diFN4UYgqgSQ',
    source: 'AI杰见',
    tags: ['Skill', 'Claude Code', '工程实践']
  },
  {
    title: 'Taste-Skill：给 Claude Code 装上"前端审美外挂"',
    summary: 'GitHub 20K+ Star。三大可调参数：设计变异度、动效强度、视觉密度。10+ 代码输出类 Skill，从源头杜绝 AI 模板脸。一键安装：npx skills add。',
    url: 'https://mp.weixin.qq.com/s/Leonxlnx/taste-skill',
    source: 'AI架构之道',
    tags: ['Skill', '设计', 'VibeCoding']
  },
  {
    title: 'Hermes v0.12.0 看板：多 Agent 协作的新范式',
    summary: 'SQLite 原子事务任务争抢；六列看板(Triage→Done)；自动依赖提升；Worker 崩溃自动释放 + 熔断；9 种协作模式。',
    url: 'https://mp.weixin.qq.com/s/QH6qe8Vt6SYnCa9hZsZ58w',
    source: 'i龙虾',
    tags: ['Hermes', 'Kanban', '多Agent']
  },
  {
    title: 'VPS 上安全部署 Hermes：Docker+非root用户实践',
    summary: 'Docker 圈住 Hermes 防碰宿主机；专用用户 hermes 降权限；UID/GID 映射解决权限；7x24 运行方案。',
    url: 'https://mp.weixin.qq.com/s/i0HU7BmKvINB6XfYMliPGA',
    source: '尼克的AI笔记',
    tags: ['Docker', 'Hermes', '安全部署']
  },
  {
    title: 'Hermes 装完必做的 9 件事',
    summary: '14 种聊天风格 + SOUL.md 灵魂定义 + 7 款皮肤；三层记忆系统；Firecrawl 上网 + Camofox 反爬；hermes gateway setup 直接接入微信。',
    url: 'https://mp.weixin.qq.com/s/mk9vx9dtzyguqPDPmY91zQ',
    source: '梦朝思夕',
    tags: ['Hermes', '配置指南', '微信接入']
  },
  {
    title: '三件让 Hermes 真正进化的事：记忆、Skill、定时任务',
    summary: '三件一次性配置：1) 喂记忆（memory.md+user.md）；2) 建 Skill（触发条件+步骤+验证+坑点）；3) 跑 Cron（定时任务自动执行+投递 IM）。',
    url: 'https://mp.weixin.qq.com/s/nSykAst2A4L8UqhZnfdV1g',
    source: '量子智元',
    tags: ['Hermes', '记忆', 'Skill', 'Cron']
  },
  {
    title: 'Hermes Profile 机制：一台机器上跑多个独立 Agent',
    summary: 'Profile 解决单机多 Agent 隔离问题：独立配置/密钥/记忆/会话；切换用 -p 参数；每个 Profile 有自己的 SOUL.md 和独立 Gateway。',
    url: 'https://mp.weixin.qq.com/s/JH4CUsG_K_KjsqX4GA827g',
    source: '量子智元',
    tags: ['Hermes', 'Profile', '多Agent']
  },
  {
    title: '浏览器自动化 Token 优化指南：从 56K 到 2.6K',
    summary: 'agent-browser 可访问性树 + refs 节省 95% Token；Playwright CLI 节省 4 倍；bb-browser 复用真实浏览器登录态绕过反爬；Lightpanda 轻量级引擎。',
    url: 'https://mp.weixin.qq.com/s/KE9GmnuLVmU9GVcoiGT9JA',
    source: '璟礼AI',
    tags: ['浏览器', 'Token优化', 'MCP']
  },
  {
    title: '3 小时 25 分钟，15 万亿个 token，和我那颗反复碎裂的自信心',
    summary: 'Base model = 有损压缩包；Tokenization 导致锯齿型智能；RL 可能产生第 37 手；ChatGPT = 标注员统计投影。',
    url: 'https://mp.weixin.qq.com/s/W4BRilQtJSrBTHKs9tPXCg',
    source: '小试AI',
    tags: ['LLM原理', 'Tokenization', 'RL']
  },
  {
    title: '怎么写好一份 AGENTS.md？',
    summary: 'AGENTS.md 已成事实标准；地图而非手册；四大实践：仓库聚合/统一环境/验证闭环/自动化检查。',
    url: 'https://mp.weixin.qq.com/s/fBBBSfQajYjYtngZAitZCA',
    source: '阿里云开发者',
    tags: ['AGENTS.md', '工程实践']
  },
  {
    title: 'AI 视频工具的三阶段演化：从盲盒到画布原生 Agent',
    summary: 'AI 视频三阶段：盲盒→双入口外挂→画布原生 Agent。关键判断是过程透明。RunningHub 生态驱动能力上限（10 万+ 社区应用）。',
    url: 'https://mp.weixin.qq.com/s/UICnWBFy-9KBYsZ4JqPmwg',
    source: '花叔',
    tags: ['AI视频', 'Agent', '产品范式']
  },
  {
    title: 'MiniCPM-V 4.6：1B 参数的「端侧第一」多模态模型',
    summary: '面壁智能 1.3B 参数端侧多模态模型，超越 Qwen3.5-0.8B。LLaVA-UHD v4 架构：ViT 内部早压缩(降 55.8% 运算量) + 4/16 倍混合 Token 压缩。首响 75.7ms。',
    url: 'https://mp.weixin.qq.com/s/jN5OJCrHnaPSjINfM1yQQA',
    source: '机器之心',
    tags: ['端侧模型', '多模态', 'MiniCPM']
  },
  {
    title: 'Harness Engineering: A Survey — Agent 工程三次迁移',
    summary: 'CMU/Yale/JHU/Amazon 联合综述。ETCLOVG 七层框架：Execution/Tooling/Context/Lifecycle/Observability/Verification/Governance。梳理 170+ 开源项目。',
    url: 'https://mp.weixin.qq.com/s/rlIyIIZOXFObNIXbPI7gDg',
    source: 'Datawhale',
    tags: ['Agent', 'Harness', '论文']
  },
  {
    title: 'Agent Skill 不能永远停留在 README 时代——SSL 论文解读',
    summary: '北大论文提出 SSL 三层表示：调度层/结构层/逻辑层。检索 MRR 从 0.573 提升到 0.707，风险评估 Macro F1 从 0.744 提升到 0.787。',
    url: 'https://mp.weixin.qq.com/s/COOLPKU/SSL',
    source: 'Hyman',
    tags: ['Skill', '论文', '安全审计']
  },
  {
    title: 'DCI：砍掉 embedding 和向量索引，用 grep+bash 做 agentic search',
    summary: '砍掉 embedding+vector index+top-k retrieval，用 grep/bash/find/sed 直接搜索原始语料。准确率 69%→80%(+11pp)，成本降 30%。',
    url: 'https://mp.weixin.qq.com/s/XVx4LVRaC4nSEmskR_zv7w',
    source: '井底之硅',
    tags: ['RAG', 'DCI', '检索范式']
  },
  {
    title: '让 Claude Code 自动修复自己的错误',
    summary: '六步配置：CLAUDE.md 规则 → PostToolUse 钩子 → Stop 钩子 → PreToolUse 钩子 → 自动重试模式 → 跨会话记忆。',
    url: 'https://mp.weixin.qq.com/s/AI寒武纪',
    source: 'AI寒武纪',
    tags: ['Claude Code', '自动化', 'Hooks']
  },
  {
    title: '本体论：比上下文工程和 Harness 更落地的 Agent 构建方法论',
    summary: '阿里云 UModel 基于本体论构建 IT 世界统一建模框架。STAROps 是基于 UModel 构建的 AIOps Agent，提供智能查数、故障定位、主动运维能力。',
    url: 'https://mp.weixin.qq.com/s/Higress',
    source: 'Higress',
    tags: ['本体论', 'AIOps', '阿里云']
  },
  {
    title: '小米技术团队的 AI 工程化实践',
    summary: '三层实践：VAF 统一工作流（带菜单的低门槛方案）、VKF 知识索引（代码知识目录和索引）、eight-claw 协作工作台（飞书话题作为并行推进的最小治理单元）。',
    url: 'https://mp.weixin.qq.com/s/小米技术',
    source: '小米技术',
    tags: ['团队协作', 'AI工程化', '代码知识库']
  },
  {
    title: 'OfficeCLI：给 AI Agent 装上直接操作 Office 文档的手',
    summary: 'GitHub 4.7k stars。无需安装 Microsoft Office，单二进制文件跨平台运行。三层文档架构：L1 view/L2 DOM/L3 Raw XML。内置 MCP 服务器。',
    url: 'https://mp.weixin.qq.com/s/OfficeCLI',
    source: 'CourseAI',
    tags: ['Agent', 'Office', '开源']
  },
  {
    title: 'Graphify：把代码、文档、PDF、图片、视频整理成知识图谱',
    summary: '代码用 tree-sitter 本地 AST 解析，非结构化内容用 AI 语义抽取。输出可视化图谱 + 报告 + 结构化数据。支持 16+ AI 编程助手。',
    url: 'https://mp.weixin.qq.com/s/Graphify',
    source: '兔兔AGI',
    tags: ['知识图谱', '工程实践', '开源']
  },
  {
    title: 'Open Design：开源免费的 Claude Design 替代品',
    summary: '支持 16 种 CLI Agent + BYOK。内置 Linear/Stripe/Apple/Cursor 等品牌设计体系。6 天破 2 万 Star。支持文本→原型/PPT/App 界面/官网。',
    url: 'https://mp.weixin.qq.com/s/OpenDesign',
    source: '网罗灯下黑',
    tags: ['设计', 'VibeCoding', '开源']
  },
  {
    title: 'GPT-Image2 工业级提示词引擎：390+ 逆向工程案例',
    summary: '390+ 逆向工程案例 + 20+ 行业模板。原子化提示词架构、自动化友好设计、结构化精准控制。覆盖 12 大主流领域。',
    url: 'https://mp.weixin.qq.com/s/GPT-Image2',
    source: 'GitHub项目进阶',
    tags: ['Prompt', 'AI绘画', '开源']
  },
  {
    title: '我搞了一个免费法律 Skill：核验法条真实性+防 AI 幻觉',
    summary: '律师自建 chinese-law-verifier SKILL + 法条库，免费提供 API 核验法条真实性、查询法条内容，防 AI 幻觉。',
    url: 'https://mp.weixin.qq.com/s/uS4LlGbzK1XIT5TQ65I7jw',
    source: '游戏人的法律手册',
    tags: ['Skill', '法律', '防幻觉']
  },
  {
    title: '完备的 AI Agent 学习路线',
    summary: 'Datawhale 出品。Part1 入门→Part2 进阶(Harness/Multi-Agent)→Part3 工程化(评测/安全)→Part4 项目阶梯→Part5 精选资源。开源仓库。',
    url: 'https://mp.weixin.qq.com/s/Agent-Learning-Hub',
    source: 'Datawhale',
    tags: ['Agent', '学习路线', '开源']
  },
  {
    title: '达尔文 2.0：最完整的个人开发者 Skill 优化器',
    summary: '基于微软两篇论文升级。9 维评分标准、多层验证机制、human in the loop、反例黑名单。实测从 80.8 分提升到 91.65 分。',
    url: 'https://mp.weixin.qq.com/s/darwin-skill',
    source: '花叔',
    tags: ['Skill', '优化器', '开源']
  },
  {
    title: 'AI 不会淘汰程序员，只会淘汰不懂工程基础的——Matt Pocock 演讲',
    summary: '四个方法论：Grill Me(AI 拷问设计决策)→统一语言→TDD(控制粒度)→Deep Modules(藏复杂露简单)。底层逻辑：管理认知负荷。',
    url: 'https://mp.weixin.qq.com/s/5J6OfK7MxqUY32OtRL5Aiw',
    source: '逛逛GitHub',
    tags: ['AI Coding', '工程基础', 'TDD']
  },
  {
    title: 'FDE（Forward Deployed Engineer）爆火',
    summary: 'AI 产业重心从模型竞赛转向工程交付。Palantir 起源，OpenAI/Anthropic 近期大量招聘。三层价值：收入引擎/产品雷达/标准化工厂。',
    url: 'https://mp.weixin.qq.com/s/FDE',
    source: 'ZERORE',
    tags: ['FDE', '商业模式', '产品化']
  },
  {
    title: 'Helio — AI-native 团队协作平台',
    summary: '人类和 AI 放在同一个消息平面。5 大支柱：统一频道/任务/编码会话/AI 同事/邮件。支持 Claude Code/Codex 持久运行时。',
    url: 'https://helio.im',
    source: 'Helio',
    tags: ['团队协作', 'AI Native', '产品']
  },
]

export default function BookmarksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <span className="seal text-lg px-4 py-2 mb-4 inline-block">藏</span>
        <h1 className="font-serif text-3xl font-bold text-ink-900 dark:text-ink-100 mb-3">
          收藏文章
        </h1>
        <p className="text-ink-500 dark:text-ink-600 max-w-xl mx-auto text-sm">
          精选收藏的 AI 领域优质文章，覆盖 Agent 工程、Skill 开发、AI 工具、开源项目等方向。点击标题跳转原文。
        </p>
      </div>

      <div className="bamboo-divider mb-8" />

      <div className="space-y-3">
        {bookmarks.map((b, i) => (
          <a
            key={i}
            href={b.url.startsWith('http') ? b.url : `https://${b.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="card group block px-5 py-4 transition-all hover:border-vermilion/40 h-full"
          >
            <div className="flex items-start gap-3">
              <span className="mt-1 text-xs text-ink-400 dark:text-ink-600 w-6 text-right shrink-0 font-mono">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-ink-800 dark:text-ink-200 group-hover:text-vermilion transition-colors mb-1 leading-snug">
                  {b.title}
                </h3>
                <p className="text-xs text-ink-500 dark:text-ink-600 leading-relaxed line-clamp-2 mb-2">
                  {b.summary}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-ink-400 dark:text-ink-700">{b.source}</span>
                  {b.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[9px] px-1.5 py-0.5 rounded-full border border-ink-200/30 dark:border-ink-800/30 text-ink-400 dark:text-ink-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="bamboo-divider mt-10 mb-8" />

      <div className="text-center">
        <p className="text-xs text-ink-400 dark:text-ink-600">
          共 {bookmarks.length} 篇收藏 · 持续更新中
        </p>
      </div>
    </div>
  )
}
