import Link from 'next/link'
import { Tag } from 'lucide-react'
import { PostCard } from '@/components/PostCard'
import { getPostsByTag, getAllTags } from '@/lib/posts'

export function generateStaticParams() {
  const tags = getAllTags()
  return tags.map((tag) => ({ tag }))
}

export default function TagPage({ params }: { params: { tag: string } }) {
  const { tag } = params
  const posts = getPostsByTag(tag)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">首页</Link>
        <span>/</span>
        <Link href="/tags" className="hover:text-foreground">标签</Link>
        <span>/</span>
        <span className="text-foreground">{tag}</span>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-3">
          <Tag className="size-6" />
          <h1 className="ai-gradient-text text-3xl font-bold">{tag}</h1>
        </div>
        <p className="mt-2 text-muted-foreground">共 {posts.length} 篇文章</p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} detailed />
        ))}
      </div>

      {posts.length === 0 && (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          <p className="mb-2 text-2xl">📭</p>
          <p>该标签下暂无文章。</p>
        </div>
      )}
    </div>
  )
}
