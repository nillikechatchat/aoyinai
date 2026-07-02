import Link from 'next/link'
import Image from 'next/image'
import { Github, GitBranch, Code2, BookOpen, Globe, MessageSquare, Mail, Rss } from 'lucide-react'
import { siteConfig } from '@/lib/site'

export const metadata = {
  title: '关于',
  description: `关于 ${siteConfig.name} — 聚焦人工智能的中文博客`,
  alternates: { canonical: `${siteConfig.url}/about` }
}

const socialLinks = [
  { href: 'https://github.com/nillikechatchat/aoyinai', icon: Github, label: 'GitHub', desc: '开源项目与代码' },
  { href: 'https://gitee.com/hongjian_Ai', icon: GitBranch, label: 'Gitee', desc: '国内代码托管' },
  { href: 'https://atomgit.com/u012823422', icon: Code2, label: 'AtomGit', desc: 'AtomGit 社区' },
  { href: 'https://blog.csdn.net/u012823422', icon: BookOpen, label: 'CSDN', desc: '技术博客' },
  { href: 'https://my.oschina.net/mfeng', icon: Globe, label: 'OSCHINA', desc: '开源中国社区' },
  { href: 'https://segmentfault.com/u/nillikechatchat/articles', icon: MessageSquare, label: 'SegmentFault', desc: '技术问答与文章' },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* 头部 */}
      <div className="mb-10 text-center">
        <span className="seal text-lg px-4 py-2 mb-4 inline-block">关于</span>
        <h1 className="font-serif text-3xl font-bold text-ink-900 dark:text-ink-100 mb-3">
          敖胤AI
        </h1>
        <p className="text-ink-500 dark:text-ink-600 max-w-lg mx-auto">
          一个聚焦人工智能的中文博客，以墨为舟，探索 AI 世界
        </p>
      </div>

      {/* 竹节分隔 */}
      <div className="bamboo-divider mb-10" />

      {/* 内容主题 */}
      <section className="mb-12">
        <h2 className="font-serif text-xl font-bold text-ink-800 dark:text-ink-200 mb-6 flex items-center gap-2">
          <span className="seal text-xs px-2 py-0.5">览</span>
          内容主题
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: 'AI 入门实战', desc: '从零基础到大模型、RAG、Agent 开发全流程', color: '#c53d43' },
            { title: '行业动态', desc: '大模型厂商竞争格局、投融资与价格趋势', color: '#b8860b' },
            { title: '升学就业', desc: 'AI 强校专业选择、课程师资与求职路径', color: '#2e8b57' },
            { title: '竞赛活动', desc: 'Kaggle、顶会赛题、算法大赛报名与攻略', color: '#c53d43' },
            { title: '黑客松', desc: 'AI 黑客松最新资讯与获奖经验分享', color: '#b8860b' },
            { title: '算力优惠', desc: 'GPU 云服务器、大模型 API 免费额度汇总', color: '#2e8b57' },
            { title: 'T-agent', desc: '多智能体协作框架教程与落地案例', color: '#c53d43' },
          ].map((item) => (
            <div
              key={item.title}
              className="card p-4 flex items-start gap-3"
            >
              <span
                className="seal text-[10px] px-1.5 py-0.5 shrink-0"
                style={{ borderColor: item.color, color: item.color }}
              >
                {item.title.slice(0, 2)}
              </span>
              <div>
                <h3 className="font-medium text-sm text-ink-800 dark:text-ink-200">{item.title}</h3>
                <p className="text-xs text-ink-500 dark:text-ink-600 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 社交链接 */}
      <section className="mb-12">
        <h2 className="font-serif text-xl font-bold text-ink-800 dark:text-ink-200 mb-6 flex items-center gap-2">
          <span className="seal text-xs px-2 py-0.5">链</span>
          关注我
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {socialLinks.map(({ href, icon: Icon, label, desc }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="card group p-4 flex items-center gap-3 transition-all hover:border-vermilion/40"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-vermilion/10 text-vermilion group-hover:bg-vermilion/20 transition-colors">
                <Icon className="size-5" />
              </div>
              <div>
                <h3 className="font-medium text-sm text-ink-800 dark:text-ink-200 group-hover:text-vermilion transition-colors">
                  {label}
                </h3>
                <p className="text-xs text-ink-500 dark:text-ink-600">{desc}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 技术栈 */}
      <section className="mb-12">
        <h2 className="font-serif text-xl font-bold text-ink-800 dark:text-ink-200 mb-6 flex items-center gap-2">
          <span className="seal text-xs px-2 py-0.5">技</span>
          技术栈
        </h2>
        <div className="card p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              'Next.js 14',
              'Tailwind CSS',
              'TypeScript',
              'rehype-pretty-code',
              'Shiki 代码高亮',
              'gray-matter',
              'remark-gfm',
              'Vercel 部署',
              '不蒜子统计',
            ].map((tech) => (
              <div
                key={tech}
                className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-400"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-vermilion/60" />
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 二维码 */}
      <section className="mb-12">
        <h2 className="font-serif text-xl font-bold text-ink-800 dark:text-ink-200 mb-6 flex items-center gap-2">
          <span className="seal text-xs px-2 py-0.5">码</span>
          扫码关注
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-5 text-center">
            <div className="mx-auto mb-3 w-40 h-40 relative">
              <Image
                src="/qrcode-knowledge.webp"
                alt="知识码"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <p className="text-sm font-medium text-ink-800 dark:text-ink-200">知识码</p>
            <p className="text-xs text-ink-500 dark:text-ink-600 mt-1">Hiclaw 深度实践</p>
          </div>
          <div className="card p-5 text-center">
            <div className="mx-auto mb-3 w-40 h-40 relative">
              <Image
                src="/qrcode-wechat.webp"
                alt="微信扫码"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <p className="text-sm font-medium text-ink-800 dark:text-ink-200">微信扫码</p>
            <p className="text-xs text-ink-500 dark:text-ink-600 mt-1">搜索联合传播</p>
          </div>
        </div>
      </section>

      {/* 联系方式 */}
      <section className="mb-12">
        <h2 className="font-serif text-xl font-bold text-ink-800 dark:text-ink-200 mb-6 flex items-center gap-2">
          <span className="seal text-xs px-2 py-0.5">联</span>
          联系我
        </h2>
        <div className="card p-5">
          <p className="text-sm text-ink-600 dark:text-ink-400 mb-4">
            如果你有任何问题、建议或合作意向，欢迎通过以下方式联系我：
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/nillikechatchat/aoyinai/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-vermilion hover:underline"
            >
              <Github className="size-4" />
              GitHub Issues
            </a>
            <a
              href="/rss.xml"
              className="inline-flex items-center gap-1.5 text-sm text-vermilion hover:underline"
            >
              <Rss className="size-4" />
              RSS 订阅
            </a>
          </div>
        </div>
      </section>

      {/* 竹节分隔 */}
      <div className="bamboo-divider mb-10" />

      {/* 底部 */}
      <div className="text-center">
        <p className="text-xs text-ink-400 dark:text-ink-700">
          © {new Date().getFullYear()} 敖胤AI · 以墨为舟，探索 AI 世界
        </p>
      </div>
    </div>
  )
}
