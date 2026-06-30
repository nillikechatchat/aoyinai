'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import type { Post } from '@/lib/posts'
import { calculateReadingTime } from '@/lib/reading'

interface PostCardProps {
  post: Post
  index?: number
  detailed?: boolean
}

export function PostCard({ post, index = 0, detailed = false }: PostCardProps) {
  const date = new Date(post.date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const coverImage = post.cover?.image || post.image
  const readingTime = calculateReadingTime(post.content)

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/blog/${post.id}`}>
        <div className="card-hover relative overflow-hidden rounded-2xl border border-border bg-card">
          {detailed && coverImage && (
            <div className="relative h-48 w-full overflow-hidden sm:h-64">
              <Image
                src={coverImage}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          )}

          <div className="p-6">
            {post.categories.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {post.categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            <h3 className="mb-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
              {post.title}
            </h3>

            <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
              {post.description}
            </p>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {readingTime} 分钟
                </span>
              </div>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
