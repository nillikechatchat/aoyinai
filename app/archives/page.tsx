import Link from 'next/link'
import { Calendar, ArrowLeft } from 'lucide-react'
import { getPostsByYear } from '@/lib/posts'

export default function ArchivesPage() {
  const postsByYear = getPostsByYear()
  const years = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">首页</Link>
        <span>/</span>
        <span className="text-foreground">归档</span>
      </nav>

      <header className="mb-12">
        <h1 className="ai-gradient-text mb-4 text-4xl font-bold">时间线归档</h1>
        <p className="text-muted-foreground">
          共 {Object.values(postsByYear).flat().length} 篇文章
        </p>
      </header>

      <div className="space-y-12">
        {years.map((year) => (
          <div key={year}>
            <div className="mb-6 flex items-center gap-3">
              <span className="ai-gradient-text text-3xl font-bold">{year}</span>
              <span className="text-sm text-muted-foreground">
                ({postsByYear[year].length} 篇)
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-4 border-l-2 border-border pl-6">
              {postsByYear[year].map((post) => {
                const date = new Date(post.date).toLocaleDateString('zh-CN', {
                  month: 'long',
                  day: 'numeric'
                })

                return (
                  <div key={post.id} className="relative">
                    <div className="absolute -left-[29px] top-3 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                    <Link href={`/blog/${post.id}`} className="group block">
                      <div className="flex items-start justify-between gap-4 rounded-lg p-4 transition-colors hover:bg-muted">
                        <div>
                          <h3 className="font-medium group-hover:text-primary">
                            {post.title}
                          </h3>
                          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                            {post.description}
                          </p>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="size-3" />
                          {date}
                        </span>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          返回首页
        </Link>
      </div>
    </div>
  )
}
