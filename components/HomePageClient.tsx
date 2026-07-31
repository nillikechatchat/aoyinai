'use client'

import { useState } from 'react'
import { Hero } from '@/components/Hero'
import { PostCard } from '@/components/PostCard'
import { CategoryCard } from '@/components/CategoryCard'
import { Footer } from '@/components/Footer'
import { FullPageScroller } from '@/components/fullscreen/FullPageScroller'
import { FullPageSection } from '@/components/fullscreen/FullPageSection'
import { Feather } from 'lucide-react'
import type { Post } from '@/lib/posts'

interface HomePageClientProps {
  posts: Post[]
  categories: string[]
  tagCount: number
}

export function HomePageClient({ posts, categories, tagCount }: HomePageClientProps) {
  const [scrollProgress, setScrollProgress] = useState(0)

  return (
    <FullPageScroller onScrollProgress={setScrollProgress}>
      <FullPageSection id="hero">
        <Hero scrollProgress={scrollProgress} />
      </FullPageSection>

      <FullPageSection id="categories" className="home-section-content justify-center">
        <div className="mx-auto w-full max-w-[1240px] px-6 sm:px-10 lg:px-14">
          <div className="home-section-heading">
            <span>01 / 主题路径</span>
            <a href="/explore">浏览全部主题 <span className="text-vermilion">↗</span></a>
          </div>
          <div className="mb-9 grid items-end gap-6 lg:grid-cols-12">
            <h2 className="font-serif text-4xl font-semibold tracking-[-0.04em] text-ink-900 sm:text-5xl lg:col-span-7">
              从复杂中<br />提炼方向。
            </h2>
            <p className="max-w-sm text-sm leading-7 text-ink-500 lg:col-span-4 lg:col-start-9">
              以专题组织信息密度，用可持续的知识结构代替短暂的资讯洪流。
            </p>
          </div>
          <div className="grid grid-cols-2 border-l border-t border-ink-900/10 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat, i) => (
              <CategoryCard key={cat} slug={cat} index={i} count={posts.filter(p => p.categories.includes(cat)).length} />
            ))}
          </div>
        </div>
      </FullPageSection>

      <FullPageSection id="latest" className="home-section-content justify-center" allowOverflow>
        <div className="mx-auto w-full max-w-[1240px] px-6 py-10 sm:px-10 lg:px-14">
          <div className="home-section-heading">
            <span>02 / 最新阅读</span>
            <a href="/blog">全部文章 <span className="text-vermilion">↗</span></a>
          </div>
          <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
            <h2 className="font-serif text-4xl font-semibold tracking-[-0.04em] text-ink-900 sm:text-5xl">
              正在发生的<br className="sm:hidden" />思考。
            </h2>
            <p className="max-w-xs text-sm leading-7 text-ink-500">
              研究、实践与判断。每一篇都为下一次更好的决策服务。
            </p>
          </div>
          <div className="grid gap-x-12 gap-y-0 border-t border-ink-900/10 sm:grid-cols-2">
            {posts.slice(0, 4).map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        </div>
      </FullPageSection>

      <FullPageSection id="site-info" className="home-site-info justify-center" allowOverflow>
        <div className="mx-auto flex w-full max-w-[1240px] flex-col px-6 sm:px-10 lg:px-14">
          <div className="grid items-end gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-vermilion">03 / 关于这个空间</p>
              <h2 className="mt-6 font-serif text-4xl font-semibold leading-tight tracking-[-0.04em] text-ink-900 sm:text-6xl">
                让理解成为<br />下一种直觉。
              </h2>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <p className="text-sm leading-7 text-ink-500">
                鸿渐Space 记录技术与人的共同演化，让值得沉淀的判断在此持续生长。
              </p>
              <a
                href="/about"
                className="mt-7 inline-flex items-center gap-2 text-sm text-ink-700 transition-colors hover:text-vermilion"
              >
                <Feather className="size-4" />
                认识鸿渐Space
              </a>
            </div>
          </div>
          <div className="mt-14 grid grid-cols-3 border-y border-ink-900/10">
            {[
              [posts.length, '文章'],
              [categories.length, '栏目'],
              [tagCount, '标签'],
            ].map(([value, label]) => (
              <div
                key={String(label)}
                className="border-r border-ink-900/10 px-3 py-5 last:border-r-0 sm:px-8 sm:py-7"
              >
                <p className="font-serif text-3xl font-semibold text-ink-900 sm:text-5xl">
                  {value}
                </p>
                <p className="mt-1 text-[10px] tracking-[0.15em] text-ink-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-auto">
          <Footer />
        </div>
      </FullPageSection>
    </FullPageScroller>
  )
}
