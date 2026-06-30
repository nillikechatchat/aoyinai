import Link from 'next/link'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import type { Post } from '@/lib/posts'
import { calculateReadingTime } from '@/lib/reading'
import { categoryMeta } from '@/lib/categories'

interface PostCardProps {
  post: Post
  index?: number
  showCover?: boolean
}

export function PostCard({ post, index = 0, showCover = false }: PostCardProps) {
  const date = new Date(post.date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const readingTime = calculateReadingTime(post.content)
  const coverImage = post.cover?.image || post.image

  return (
    <article
      className="animate-in group"
      style={{ opacity: 0, animationDelay: `${index * 0.08}s` }}
    >
      <Link href={`/blog/${post.id}`}>
        <div className="card overflow-hidden p-5 sm:p-6">
          {/* 分类印章 */}
          {post.categories.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {post.categories.map((cat) => (
                <span key={cat} className="seal text-[10px] px-2 py-0.5">
                  {categoryMeta[cat]?.seal || cat}
                </span>
              ))}
            </div>
          )}

          {/* 标题 */}
          <h3 className="mb-2 font-serif text-lg font-bold text-ink-900 transition-colors group-hover:text-vermilion dark:text-ink-100">
            {post.title}
          </h3>

          {/* 描述 */}
          <p className="mb-3 line-clamp-2 text-sm text-ink-500 dark:text-ink-500">
            {post.description}
          </p>

          {/* 底部信息 */}
          <div className="flex items-center justify-between text-xs text-ink-400 dark:text-ink-600">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                {date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {readingTime} 分钟
              </span>
            </div>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 group-hover:text-vermilion" />
          </div>
        </div>
      </Link>
    </article>
  )
}
