import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI 探索者',
  description: '一个聚焦人工智能的中文博客 — AI 教程、市场分析、高校专业、赛事活动、黑客松、云厂商优惠与 T-agent 项目。',
  keywords: ['AI', '人工智能', '大模型', 'LLM', 'RAG', 'Agent', '教程', '市场分析']
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
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
