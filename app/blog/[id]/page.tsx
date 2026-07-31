import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Tag } from 'lucide-react'
import { getPostById, getSortedPosts, markdownToHtml } from '@/lib/posts'
import { calculateReadingTime } from '@/lib/reading'
import { categoryMeta } from '@/lib/categories'
import { siteConfig } from '@/lib/site'
import { extractTableOfContents } from '@/lib/toc'
import { ReadingProgress } from '@/components/ReadingProgress'
import { TableOfContents } from '@/components/TableOfContents'

export function generateStaticParams() {
  return getSortedPosts().map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const post = getPostById(params.id)
  if (!post) return {}
  const url = `${siteConfig.url}/blog/${params.id}`
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article' as const,
      publishedTime: post.date,
      tags: post.tags,
      url
    }
  }
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = getPostById(params.id)
  if (!post) notFound()

  const htmlContent = await markdownToHtml(post.content)
  const tableOfContents = extractTableOfContents(post.content)
  const readingTime = calculateReadingTime(post.content)
  const date = new Date(post.date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="relative min-h-[calc(100dvh-3.5rem)] bg-rice">
      <ReadingProgress />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-vermilion"
        >
          <ArrowLeft className="size-3.5" />
          返回文章列表
        </Link>
        <div className="lg:grid lg:grid-cols-[minmax(0,46rem)_12rem] lg:gap-16">
          <div>
      {/* 面包屑 */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
        <Link href="/" className="hover:text-vermilion">首页</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-vermilion">文章</Link>
        {post.categories.length > 0 && (
          <>
            <span>/</span>
            {post.categories.map((cat, i) => (
              <span key={cat}>
                <Link
                  href={`/categories/${cat}`}
                  className="hover:text-vermilion"
                  style={{ color: categoryMeta[cat]?.color }}
                >
                  {categoryMeta[cat]?.label}
                </Link>
                {i < post.categories.length - 1 && <span> · </span>}
              </span>
            ))}
          </>
        )}
      </nav>

      {/* 文章头部 */}
      <header className="mb-8">
        {/* 分类印章 */}
        {post.categories.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {post.categories.map((cat) => (
              <span key={cat} className="seal text-xs px-2 py-0.5">
                {categoryMeta[cat]?.seal || cat}
              </span>
            ))}
          </div>
        )}

        <h1 className="mb-4 font-serif text-2xl font-bold leading-snug text-ink-900 sm:text-3xl">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500">
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {readingTime} 分钟阅读
          </span>
          <span id="busuanzi_container_page_pv" className="flex items-center gap-1">
            <span className="size-3">👁</span>
            <span id="busuanzi_value_page_pv"></span> 次阅读
          </span>
        </div>

        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                prefetch={false}
                className="inline-flex items-center gap-1 rounded-full border border-ink-200/30 px-2.5 py-0.5 text-[11px] text-ink-500 transition-colors hover:border-vermilion/30 hover:text-vermilion"
              >
                <Tag className="size-2.5" />
                {tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* 分隔线 */}
      <div className="bamboo-divider mb-8" />

      {/* 正文 */}
      <article
        className="prose"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* 返回 */}
      <div className="bamboo-divider mt-12 mb-6" />
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-vermilion"
      >
        <ArrowLeft className="size-3.5" />
        返回文章列表
      </Link>
          </div>
          <aside className="mt-12 hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents items={tableOfContents} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
