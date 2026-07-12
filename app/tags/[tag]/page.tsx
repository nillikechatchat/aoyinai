import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PostCard } from '@/components/PostCard'
import { getPostsByTag, getAllTags } from '@/lib/posts'
import { siteConfig } from '@/lib/site'

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: encodeURIComponent(tag) }))
}

export async function generateMetadata({ params }: { params: { tag: string } }) {
  const decoded = decodeURIComponent(params.tag)
  return {
    title: `#${decoded}`,
    alternates: { canonical: `${siteConfig.url}/tags/${params.tag}` }
  }
}

export default function TagDetailPage({ params }: { params: { tag: string } }) {
  const decoded = decodeURIComponent(params.tag)
  const posts = getPostsByTag(decoded)
  if (posts.length === 0) notFound()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-ink-900 dark:text-ink-100">
          #{decoded}
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
