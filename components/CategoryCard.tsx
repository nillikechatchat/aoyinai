import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { categoryMeta } from '@/lib/categories'
import { getPostsByCategory } from '@/lib/posts'

interface CategoryCardProps {
  slug: string
  index?: number
}

export function CategoryCard({ slug, index = 0 }: CategoryCardProps) {
  const meta = categoryMeta[slug]
  if (!meta) return null
  const count = getPostsByCategory(slug).length

  return (
    <article
      className="animate-in group"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <Link href={`/categories/${slug}`}>
        <div className="card overflow-hidden p-5 text-center h-full flex flex-col items-center justify-center">
          {/* 印章徽章 */}
          <div className="mx-auto mb-3">
            <span
              className="seal text-base px-3 py-1.5"
              style={{ borderColor: meta.color, color: meta.color }}
            >
              {meta.seal}
            </span>
          </div>

          <h3 className="mb-1 font-serif text-base font-bold text-ink-900 dark:text-ink-100">
            {meta.label}
          </h3>

          <p className="mb-2 text-xs text-ink-500 dark:text-ink-600 line-clamp-2">
            {meta.desc}
          </p>

          <div className="flex items-center justify-center gap-1 text-xs text-vermilion">
            <span>{count} 篇</span>
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    </article>
  )
}
