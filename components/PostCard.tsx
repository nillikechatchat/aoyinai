'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { Post } from '@/lib/posts'
import { calculateReadingTime } from '@/lib/reading'
import { categoryMeta } from '@/lib/categories'

interface PostCardProps {
  post: Post
  index?: number
}

export function PostCard({ post, index = 0 }: PostCardProps) {
  const publishedAt = new Date(post.date)
  const date = [
    publishedAt.getUTCFullYear(),
    String(publishedAt.getUTCMonth() + 1).padStart(2, '0'),
    String(publishedAt.getUTCDate()).padStart(2, '0'),
  ].join('.')
  const readingTime = calculateReadingTime(post.content)
  const category = post.categories[0] ? categoryMeta[post.categories[0]] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -3 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      style={{ transition: 'transform var(--dur-hover) var(--ease-ink)' }}
    >
      <Link href={`/blog/${post.id}`} className="post-card group">
        <div className="flex items-center justify-between text-[10px] font-medium tracking-[0.14em] text-ink-400">
          <span style={category ? { color: category.color } : undefined}>
            {category?.seal || '文章'}
          </span>
          <span>
            {date} / {readingTime} MIN
          </span>
        </div>
        <div className="mt-9 flex items-start gap-4">
          <span className="font-mono text-xs text-ink-300">0{index + 1}</span>
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-xl font-semibold leading-snug tracking-wide text-ink-900 transition-colors duration-300 group-hover:text-vermilion">
              {post.title}
            </h3>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink-500">
              {post.description}
            </p>
          </div>
          <ArrowUpRight className="mt-1 size-4 shrink-0 text-ink-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-vermilion" />
        </div>
      </Link>
    </motion.div>
  )
}
