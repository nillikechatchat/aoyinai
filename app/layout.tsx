import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { siteConfig } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.title, template: '%s — 敖胤AI' },
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

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(!t)t='dark';document.documentElement.classList.toggle('dark',t==='dark');}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen min-h-dvh bg-rice text-ink-900 dark:bg-ink-950 dark:text-ink-100">
        <div className="relative flex min-h-screen min-h-dvh flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        {/* 不蒜子访问量统计 */}
        <script async src="//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script>
      </body>
    </html>
  )
}
