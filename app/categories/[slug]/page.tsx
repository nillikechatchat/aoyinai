import { notFound } from 'next/navigation'
import { PostCard } from '@/components/PostCard'
import { getPostsByCategory, getAllCategories } from '@/lib/posts'
import { categoryMeta } from '@/lib/categories'
import Link from 'next/link'

export function generateStaticParams() {
  return getAllCategories().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const meta = categoryMeta[params.slug]
  return { title: meta?.label || params.slug }
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const meta = categoryMeta[params.slug]
  if (!meta) notFound()
  const posts = getPostsByCategory(params.slug)

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* 色块头部 */}
      <div className="mb-8 rounded border border-ink-200/30 bg-rice-warm/80 p-6 text-center dark:border-ink-800/30 dark:bg-ink-900/50">
        <span
          className="seal mx-auto mb-3 text-lg px-4 py-2"
          style={{ borderColor: meta.color, color: meta.color }}
        >
          {meta.seal}
        </span>
        <h1 className="font-serif text-2xl font-bold text-ink-900 dark:text-ink-100">{meta.label}</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-600">{meta.desc}</p>
        <p className="mt-2 text-xs text-ink-400 dark:text-ink-700">{posts.length} 篇文章</p>
      </div>

      {/* 返回 */}
      <Link href="/blog" className="mb-6 inline-block text-xs text-ink-500 hover:text-vermilion dark:text-ink-600">
        ← 返回全部文章
      </Link>

      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((post, i) => (
          <PostCard key={post.id} post={post} index={i} />
        ))}
      </div>

      {posts.length === 0 && (
        <div className="rounded border border-dashed border-ink-200/30 p-12 text-center dark:border-ink-800/30">
          <p className="text-sm text-ink-500 dark:text-ink-600">暂无文章</p>
        </div>
      )}
    </div>
  )
}
