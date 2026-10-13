'use client'

import Link from 'next/link'
import { PostCard } from '@/components/PostCard'
import { CategoryCard } from '@/components/CategoryCard'
import type { Post } from '@/lib/posts'

interface HomePageClientProps {
  posts: Post[]
  categories: string[]
  tagCount: number
}

export function HomePageClient({ posts, categories, tagCount }: HomePageClientProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
      <section className="mb-12 border-b border-ink-200 pb-10">
        <p className="text-sm text-ink-500">AI 学习 · 创作 · 技术思考</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
          把每一次阅读，变成下一步的能力。
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-ink-600">
          鸿渐Space 是一份持续更新的中文 AI 博客，覆盖入门实战、行业动态、竞赛与算力。
        </p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-500">
          <span>{posts.length} 篇文章</span>
          <span>{categories.length} 个栏目</span>
          <span>{tagCount} 个标签</span>
        </div>
      </section>

      <section className="mb-14">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-serif text-2xl font-semibold text-ink-900">最新文章</h2>
          <Link href="/blog" className="text-sm text-vermilion hover:underline">
            全部文章
          </Link>
        </div>
        <div>
          {posts.slice(0, 6).map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-serif text-2xl font-semibold text-ink-900">栏目</h2>
          <Link href="/explore" className="text-sm text-vermilion hover:underline">
            浏览主题
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((cat, i) => (
            <CategoryCard
              key={cat}
              slug={cat}
              index={i}
              count={posts.filter((p) => p.categories.includes(cat)).length}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
