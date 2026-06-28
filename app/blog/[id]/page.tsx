import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Tag } from 'lucide-react'
import { getPostById, getSortedPosts, markdownToHtml } from '@/lib/posts'
import { categoryMeta } from '@/lib/categories'

export function generateStaticParams() {
  const posts = getSortedPosts()
  return posts.map((post) => ({ id: post.id }))
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = getPostById(params.id)
  if (!post) notFound()

  const htmlContent = await markdownToHtml(post.content)
  const date = new Date(post.date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const coverImage = post.cover?.image || post.image

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* 面包屑 */}
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">首页</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-foreground">文章</Link>
        {post.categories.length > 0 && (
          <>
            <span>/</span>
            {post.categories.map((cat, i) => (
              <span key={cat}>
                <Link
                  href={`/categories/${cat}`}
                  className="hover:text-foreground"
                  style={{ color: categoryMeta[cat]?.color }}
                >
                  {categoryMeta[cat]?.label || cat}
                </Link>
                {i < post.categories.length - 1 && <span> · </span>}
              </span>
            ))}
          </>
        )}
      </nav>

      {/* 封面图 */}
      {coverImage && (
        <div className="relative mb-8 h-64 overflow-hidden rounded-2xl sm:h-96">
          <Image
            src={coverImage}
            alt={post.title}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>
      )}

      {/* 文章头部 */}
      <header className="mb-8">
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="size-4" />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-4" />
            5 分钟阅读
          </span>
        </div>

        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary"
              >
                <Tag className="size-3" />
                {tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* 文章内容 */}
      <article
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* 返回按钮 */}
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
