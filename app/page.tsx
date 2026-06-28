import { Hero } from '@/components/Hero'
import { CategoryCard } from '@/components/CategoryCard'
import { PostCard } from '@/components/PostCard'
import { getSortedPosts } from '@/lib/posts'
import { categoryMeta } from '@/lib/categories'

export default function HomePage() {
  const posts = getSortedPosts().slice(0, 8)

  return (
    <>
      <Hero />

      {/* 主题分类 */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold">主题分类</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(categoryMeta).map(([slug, meta], index) => (
            <CategoryCard
              key={slug}
              slug={slug}
              label={meta.label}
              desc={meta.desc}
              color={meta.color}
              emoji={meta.emoji}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* 最新文章 */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-bold">最新文章</h2>
          <a href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
            查看全部 →
          </a>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {posts.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} detailed />
          ))}
        </div>
      </section>
    </>
  )
}
