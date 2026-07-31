import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { siteConfig } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.title, template: '%s — 鸿渐Space' },
  description: siteConfig.description,
  keywords: ['AI', '人工智能', '大模型', 'LLM', 'RAG', 'Agent', '机器学习', '深度学习', '教程', '竞赛', '黑客松'],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description
  },
  alternates: {
    canonical: siteConfig.url,
    types: { 'application/rss+xml': `${siteConfig.url}/rss.xml` }
  },
  robots: { index: true, follow: true }
}

const busuanziFallback = `(function(){setTimeout(function(){var pv=document.getElementById('busuanzi_value_site_pv');if(pv&&!pv.innerText)pv.innerText='--';var uv=document.getElementById('busuanzi_value_site_uv');if(uv&&!uv.innerText)uv.innerText='--';},5000);})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen min-h-dvh bg-rice text-ink-900">
        {/* 渐卦六爻背景 — 始终可见 */}
        <div className="hexagram-scene" aria-hidden="true">
          <div className="hexagram-orbit" />
          <div className="hexagram-plane">
            <div className="hexagram-lines">
              <span className="hexagram-line broken" style={{ '--line-index': 0 } as React.CSSProperties}><i /><i /></span>
              <span className="hexagram-line broken" style={{ '--line-index': 1 } as React.CSSProperties}><i /><i /></span>
              <span className="hexagram-line solid" style={{ '--line-index': 2 } as React.CSSProperties}><i /></span>
              <span className="hexagram-line broken" style={{ '--line-index': 3 } as React.CSSProperties}><i /><i /></span>
              <span className="hexagram-line solid" style={{ '--line-index': 4 } as React.CSSProperties}><i /></span>
              <span className="hexagram-line solid" style={{ '--line-index': 5 } as React.CSSProperties}><i /></span>
              <span className="hexagram-caption">风山渐</span>
            </div>
          </div>
        </div>
        <div className="page-wrapper relative z-10 flex min-h-dvh flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        {/* 不蒜子访问量统计 */}
        <script async src="https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script>
        <script dangerouslySetInnerHTML={{ __html: busuanziFallback }} />
      </body>
    </html>
  )
}
