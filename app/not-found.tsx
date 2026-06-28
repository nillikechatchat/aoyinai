import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="ai-gradient-text text-8xl font-bold">404</div>
      <p className="text-lg text-muted-foreground">页面不存在或已被移除</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:scale-105 hover:shadow-lg"
      >
        ← 返回首页
      </Link>
    </div>
  )
}
