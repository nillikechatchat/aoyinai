import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PostCard } from '@/components/PostCard'
import { getPostsByTag, getAllTags } from '@/lib/posts'

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }))
}

export async function generateMetadata({ params }: { params: { tag: string } }) {
  return { title: `#${params.tag}` }
}

export default function TagDetailPage({ params }: { params: { tag: string } }) {
  const posts = getPostsByTag(params.tag)
  if (posts.length === 0) notFound()

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-ink-900 dark:text-ink-100">
          #{params.tag}
        </h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-600">
          {posts.length} 篇文章
        </p>
      </div>

      <Link href="/tags" className="mb-6 inline-block text-xs text-ink-500 hover:text-vermilion dark:text-ink-600">
        ← 返回标签列表
      </Link>

      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((post, i) => (
          <PostCard key={post.id} post={post} index={i} />
        ))}
      </div>
    </div>
  )
}
