import Link from 'next/link'
import { Github, Rss, Zap, BookOpen, BarChart3, GraduationCap, Trophy, Cloud, Bot } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">首页</Link>
        <span>/</span>
        <span className="text-foreground">关于</span>
      </nav>

      <header className="mb-12 text-center">
        <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-gradient-to-br from-primary via-accent-cyan to-accent-purple p-1">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-background">
            <Zap className="size-10 text-primary" />
          </div>
        </div>
        <h1 className="ai-gradient-text mb-4 text-4xl font-bold">AI 探索者</h1>
        <p className="text-lg text-muted-foreground">一个聚焦人工智能的中文博客</p>
      </header>

      <div className="prose prose-invert max-w-none">
        <h2>关于本站</h2>
        <p>
          AI 探索者是一个专注于人工智能领域的中文博客，致力于分享 AI 领域的最新动态、
          技术教程、市场分析和行业洞察。
        </p>

        <h2>内容主题</h2>
        <div className="not-prose grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { icon: BookOpen, label: 'AI 教程', desc: '从 LLM 入门到 RAG、Agent 实战' },
            { icon: BarChart3, label: '市场分析', desc: '大模型厂商竞争格局与价格趋势' },
            { icon: GraduationCap, label: '高校专业', desc: '国内 AI 强校课程与就业去向' },
            { icon: Trophy, label: '赛事活动', desc: 'Kaggle、NeurIPS 等顶赛清单' },
            { icon: Zap, label: '黑客松', desc: '高质量 AI 黑客松实时推荐' },
            { icon: Cloud, label: '云厂商优惠', desc: '主流云厂商大模型 API 优惠' },
            { icon: Bot, label: 'T-agent', desc: '多智能体协作框架' }
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center gap-2">
                <item.icon className="size-5 text-primary" />
                <h3 className="font-semibold">{item.label}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <h2>技术栈</h2>
        <ul>
          <li><strong>Next.js 14</strong> - React 框架，App Router</li>
          <li><strong>Tailwind CSS</strong> - 原子化 CSS</li>
          <li><strong>Framer Motion</strong> - 动效库</li>
          <li><strong>Markdown</strong> - 内容格式</li>
        </ul>

        <h2>联系方式</h2>
        <div className="not-prose flex gap-4">
          <a
            href="https://github.com/nillikechatchat/aoyinai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 transition-colors hover:bg-muted"
          >
            <Github className="size-5" />
            GitHub
          </a>
          <a
            href="/rss.xml"
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 transition-colors hover:bg-muted"
          >
            <Rss className="size-5" />
            RSS
          </a>
        </div>
      </div>
    </div>
  )
}
