import Link from 'next/link'
import { getAllTags } from '@/lib/posts'

export const metadata = { title: '标签' }

export default function TagsPage() {
  const tags = getAllTags()

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-ink-900 dark:text-ink-100">
          <span className="seal mr-2 text-xs px-2 py-0.5">标</span>
          标签
        </h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-600">
          共 {tags.length} 个标签
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}`}
            className="card inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-ink-600 transition-colors hover:border-vermilion/30 hover:text-vermilion dark:text-ink-400"
          >
            #{tag}
          </Link>
        ))}
      </div>
    </div>
  )
}
