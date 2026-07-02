import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { getPostsByYear } from '@/lib/posts'
import { categoryMeta } from '@/lib/categories'
import { siteConfig } from '@/lib/site'

export const metadata = {
  title: '归档',
  alternates: { canonical: `${siteConfig.url}/archives` }
}

export default function ArchivesPage() {
  const byYear = getPostsByYear()
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-ink-900 dark:text-ink-100">
          <span className="seal mr-2 text-xs px-2 py-0.5">档</span>
          归档
        </h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-600">
          按时间浏览全部文章
        </p>
      </div>

      <div className="space-y-8">
        {years.map((year) => (
          <section key={year}>
            <h2 className="mb-4 font-serif text-lg font-bold text-ink-800 dark:text-ink-200">
              {year}
            </h2>
            <div className="relative border-l border-ink-200/30 pl-5 dark:border-ink-800/30">
              {byYear[year].map((post) => {
                const d = new Date(post.date)
                const md = `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
                return (
                  <div key={post.id} className="relative mb-4 last:mb-0">
                    {/* 时间轴节点 */}
                    <span className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full border border-vermilion bg-rice dark:bg-ink-950" />
                    <Link
                      href={`/blog/${post.id}`}
                      className="group block rounded p-2 transition-colors hover:bg-vermilion/5"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 shrink-0 font-mono text-xs text-ink-400 dark:text-ink-600">
                          {md}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-1 text-sm font-medium group-hover:text-vermilion">
                            {post.title}
                          </h3>
                          {post.categories.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {post.categories.map((cat) => (
                                <span
                                  key={cat}
                                  className="rounded-full px-1.5 py-0 text-[9px]"
                                  style={{ color: categoryMeta[cat]?.color }}
                                >
                                  {categoryMeta[cat]?.seal}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
