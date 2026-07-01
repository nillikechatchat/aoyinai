export const metadata = { title: '关于' }

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <span className="seal text-lg px-4 py-2">关于</span>
      </div>

      <article className="prose">
        <h1>鸿渐</h1>
        <p>
          一个聚焦人工智能的中文博客，以墨为舟，探索 AI 世界。
        </p>

        <h2>内容主题</h2>
        <ul>
          <li><strong>AI 教程</strong> — LLM 入门到 RAG、Agent 实战的进阶之路</li>
          <li><strong>市场分析</strong> — 大模型厂商竞争格局、价格趋势与商业洞察</li>
          <li><strong>高校专业</strong> — 国内 AI 强校课程、师资与就业去向</li>
          <li><strong>赛事活动</strong> — Kaggle、NeurIPS 等顶赛清单与报名截止</li>
          <li><strong>黑客松</strong> — 高质量 AI 黑客松实时推荐</li>
          <li><strong>云厂商优惠</strong> — 阿里云、腾讯云、华为云、火山引擎大模型 API 优惠</li>
          <li><strong>T-agent</strong> — 我正在做的多智能体协作框架</li>
        </ul>

        <h2>技术栈</h2>
        <ul>
          <li>Next.js 14（App Router + 静态导出）</li>
          <li>Tailwind CSS + 自定义水墨主题</li>
          <li>rehype-pretty-code + Shiki 代码高亮</li>
          <li>gray-matter + remark-gfm Markdown 渲染</li>
          <li>Vercel 静态站点托管</li>
        </ul>

        <h2>联系方式</h2>
        <p>
          GitHub: <a href="https://github.com/nillikechatchat/aoyinai" target="_blank" rel="noopener noreferrer">nillikechatchat/aoyinai</a>
        </p>
      </article>
    </div>
  )
}
