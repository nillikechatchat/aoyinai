import { PostCard } from '@/components/PostCard'
import { getSortedPosts } from '@/lib/posts'
import { categoryMeta } from '@/lib/categories'
import { siteConfig } from '@/lib/site'
import Link from 'next/link'

export const metadata = {
  title: '全部文章',
  alternates: { canonical: `${siteConfig.url}/blog` }
}

export default function BlogPage() {
  const posts = getSortedPosts()
  const categories = Object.keys(categoryMeta)

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-ink-900 dark:text-ink-100">
          <span className="seal mr-2 text-xs px-2 py-0.5">文</span>
          全部文章
        </h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-600">
          共 {posts.length} 篇
        </p>
      </div>

      {/* 分类快筛 */}
      <div className="mb-8 flex flex-wrap gap-2">
        <span className="rounded-full border border-vermilion/30 bg-vermilion/10 px-3 py-1 text-xs font-medium text-vermilion">
          全部
        </span>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/categories/${cat}`}
            className="rounded-full border border-ink-200/30 px-3 py-1 text-xs text-ink-600 transition-colors hover:border-vermilion/30 hover:bg-vermilion/10 hover:text-vermilion dark:border-ink-800/30 dark:text-ink-400"
          >
            {categoryMeta[cat]?.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((post, i) => (
          <PostCard key={post.id} post={post} index={i} />
        ))}
      </div>
    </div>
  )
}
