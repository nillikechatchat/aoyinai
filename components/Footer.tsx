import Link from 'next/link'
import { Feather } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ink-200/30 bg-rice-warm/50 dark:border-ink-800/30 dark:bg-ink-950/50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <Feather className="size-4 text-vermilion" />
            <span className="font-serif text-sm font-bold text-ink-700 dark:text-ink-300">
              鸿渐
            </span>
          </div>

          <p className="max-w-md text-xs text-ink-500 dark:text-ink-600">
            聚焦人工智能的中文博客 — 教程 · 市场 · 高校 · 赛事 · 黑客松 · 云厂商 · T-agent
          </p>

          <div className="flex gap-4 text-xs text-ink-500 dark:text-ink-600">
            <Link href="/blog" className="hover:text-vermilion">文章</Link>
            <Link href="/archives" className="hover:text-vermilion">归档</Link>
            <Link href="/tags" className="hover:text-vermilion">标签</Link>
            <Link href="/about" className="hover:text-vermilion">关于</Link>
            <a href="/rss.xml" className="hover:text-vermilion">RSS</a>
          </div>

          <div className="bamboo-divider w-24" />

          <p className="text-[10px] text-ink-400 dark:text-ink-700">
            © {new Date().getFullYear()} 鸿渐 · 以墨为舟，探索 AI 世界
          </p>
        </div>
      </div>
    </footer>
  )
}
