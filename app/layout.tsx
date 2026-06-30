import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aoyinai.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'AI 探索者',
    template: '%s'
  },
  description: '一个聚焦人工智能的中文博客 — AI 教程、市场分析、高校专业、赛事活动、黑客松、云厂商优惠与 T-agent 项目。',
  keywords: ['AI', '人工智能', '大模型', 'LLM', 'RAG', 'Agent', '教程', '市场分析'],
  authors: [{ name: 'AI 探索者' }],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: siteUrl,
    siteName: 'AI 探索者',
    title: 'AI 探索者',
    description: '一个聚焦人工智能的中文博客 — AI 教程、市场分析、高校专业、赛事活动、黑客松、云厂商优惠与 T-agent 项目。'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI 探索者',
    description: '一个聚焦人工智能的中文博客 — AI 教程、市场分析、高校专业、赛事活动、黑客松、云厂商优惠与 T-agent 项目。'
  },
  alternates: {
    canonical: siteUrl,
    types: {
      'application/rss+xml': `${siteUrl}/rss.xml`
    }
  },
  robots: {
    index: true,
    follow: true
  }
}

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'dark';}document.documentElement.classList.toggle('dark',t==='dark');}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
