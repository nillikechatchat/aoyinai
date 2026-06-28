import Link from 'next/link'
import { Github, Rss } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="ai-gradient-text text-lg font-bold">AI 探索者</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              聚焦人工智能的中文博客，持续更新中。
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">快速链接</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/blog" className="hover:text-foreground">全部文章</Link></li>
              <li><Link href="/categories/tutorials" className="hover:text-foreground">AI 教程</Link></li>
              <li><Link href="/categories/market" className="hover:text-foreground">市场分析</Link></li>
              <li><Link href="/archives" className="hover:text-foreground">归档</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">关注我们</h4>
            <div className="flex gap-4">
              <a
                href="https://github.com/nillikechatchat/aoyinai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Github className="size-5" />
              </a>
              <a href="/rss.xml" className="text-muted-foreground hover:text-foreground">
                <Rss className="size-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} AI 探索者. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
