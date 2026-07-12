import Link from 'next/link'
import { siteConfig } from '@/lib/site'

export const metadata = {
  title: '社区',
  description: 'AI 学习与实践社区推荐：Datawhale 开源学习、Hermes Agent 中文社区、绿盟 AISS 大模型安全社区。',
  alternates: { canonical: `${siteConfig.url}/community` }
}

const communities = [
  {
    name: 'Datawhale',
    slogan: '学用 AI，从此开始',
    desc: '国内最大的 AI 开源学习社区之一，坚持组队学习七年。覆盖大模型、RAG、Agent、量化交易等方向，提供免费开源教程和社群带学。2026 年发布 OPC 九级人才能力标准，连续三年举办 AI 夏令营（10 万+ 人参与）和黑客松高校联赛。',
    tags: ['开源学习', '组队学习', 'AI 夏令营', '黑客松', 'OPC 能力标准'],
    url: 'https://datawhale.cn',
    color: '#2e8b57',
    seal: '学习',
    highlights: [
      '免费组队学习，领航员带学 + 打卡督学',
      'Hello-ROCm / Happy-LLM 等开源教程',
      'AI+X 创造节多城巡回，OPC 超级个体',
      '与魔搭社区、浙大智海等深度合作',
    ]
  },
  {
    name: 'Hermes Agent 中文社区',
    slogan: '开源、自托管、越用越聪明的 AI Agent',
    desc: 'Nous Research 出品的开源 AI Agent，支持长期记忆、Skills 技能沉淀、MCP 工具集成。可通过微信、飞书、QQ 等平台持续在线。中文社区提供完整的安装教程、Windows 适配指南和微信交流群。',
    tags: ['开源 Agent', '长期记忆', 'MCP', '消息网关', '自托管'],
    url: 'https://hermesagent.org.cn',
    color: '#c53d43',
    seal: 'Agent',
    highlights: [
      '跨会话记忆 + Skills 技能沉淀，越用越懂你',
      '支持微信/飞书/钉钉/QQ 等 10+ 消息平台',
      '兼容 Qwen/GLM/Kimi/DeepSeek 等国产模型',
      '60 秒部署，一条命令从 OpenClaw 迁移',
    ]
  },
  {
    name: 'AISS 绿盟大模型安全智链社区',
    slogan: '大模型安全知识库与威胁矩阵',
    desc: '绿盟科技推出的大模型安全社区，提供大模型安全知识库、AI 攻击案例库、类 Claw 威胁矩阵、越狱攻击技术体系等专业内容。面向 AI 安全研究者和从业者，帮助理解和防御大模型面临的安全风险。',
    tags: ['AI 安全', '威胁矩阵', '越狱攻击', '案例库', '知识库'],
    url: 'https://aiss.nsfocus.com',
    color: '#b8860b',
    seal: '安全',
    highlights: [
      '大模型安全知识库，覆盖训练/推理/部署全链路',
      '类 Claw 威胁矩阵，系统化 AI 攻击分类',
      '越狱攻击技术体系，攻防对抗实战参考',
      'AI 攻击案例库，真实场景安全事件分析',
    ]
  }
]

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* 头部 */}
      <div className="mb-10 text-center">
        <span className="seal text-lg px-4 py-2 mb-4 inline-block">社区</span>
        <h1 className="font-serif text-3xl font-bold text-ink-900 dark:text-ink-100 mb-3">
          AI 社区推荐
        </h1>
        <p className="text-ink-500 dark:text-ink-600 max-w-xl mx-auto text-sm">
          精选 AI 学习、开发与安全领域的中文社区。加入社区，和志同道合的人一起成长。
        </p>
      </div>

      <div className="bamboo-divider mb-10" />

      {/* 社区卡片 */}
      <div className="space-y-6">
        {communities.map((c) => (
          <a
            key={c.name}
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card group block p-6 transition-all hover:border-vermilion/40 h-full"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* 左侧：印章 + 标题 */}
              <div className="flex items-center gap-3 sm:w-56 shrink-0">
                <span
                  className="seal text-sm px-3 py-1.5"
                  style={{ borderColor: c.color, color: c.color }}
                >
                  {c.seal}
                </span>
                <div>
                  <h2 className="font-serif text-lg font-bold text-ink-900 dark:text-ink-100 group-hover:text-vermilion transition-colors">
                    {c.name}
                  </h2>
                  <p className="text-xs text-ink-400 dark:text-ink-600 mt-0.5">{c.slogan}</p>
                </div>
              </div>

              {/* 右侧：描述 + 亮点 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink-600 dark:text-ink-400 mb-3 leading-relaxed line-clamp-3">
                  {c.desc}
                </p>

                {/* 亮点 */}
                <ul className="space-y-1.5 mb-3">
                  {c.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-xs text-ink-500 dark:text-ink-500">
                      <span className="mt-1 h-1 w-1 rounded-full shrink-0" style={{ background: c.color }} />
                      {h}
                    </li>
                  ))}
                </ul>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-ink-200/30 dark:border-ink-800/30 text-ink-500 dark:text-ink-600"
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

      <div className="bamboo-divider mt-12 mb-8" />

      {/* 底部 */}
      <div className="text-center">
        <p className="text-xs text-ink-400 dark:text-ink-600 mb-4">
          以上社区均为公开社区，内容来自各社区官方介绍。如有新的优质 AI 社区推荐，欢迎反馈。
        </p>
        <Link href="/about" className="text-sm text-ink-500 hover:text-vermilion dark:text-ink-600">
          联系我们 →
        </Link>
      </div>
    </div>
  )
}
