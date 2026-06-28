import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PostCard } from '@/components/PostCard'
import { getPostsByCategory } from '@/lib/posts'
import { categoryMeta } from '@/lib/categories'

export function generateStaticParams() {
  return Object.keys(categoryMeta).map((slug) => ({ slug }))
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const meta = categoryMeta[slug]
  if (!meta) notFound()

  const posts = getPostsByCategory(slug)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">首页</Link>
        <span>/</span>
        <span className="text-foreground">{meta.label}</span>
      </nav>

      <header
        className="mb-12 rounded-2xl border p-8"
        style={{
          borderColor: `${meta.color}30`,
          background: `linear-gradient(135deg, ${meta.color}08, transparent)`
        }}
      >
        <div className="flex items-start gap-4">
          <span className="text-5xl">{meta.emoji}</span>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: meta.color }}>
              {meta.label}
            </h1>
            <p className="mt-2 text-muted-foreground">{meta.desc}</p>
            <p className="mt-4 text-sm text-muted-foreground">共 {posts.length} 篇文章</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} detailed />
        ))}
      </div>

      {posts.length === 0 && (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          <p className="mb-2 text-2xl">📭</p>
          <p>该分类下暂无文章。</p>
        </div>
      )}

      <div className="mt-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          返回文章列表
        </Link>
      </div>
    </div>
  )
}
