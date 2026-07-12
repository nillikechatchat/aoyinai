import { Hero } from '@/components/Hero'
import { PostCard } from '@/components/PostCard'
import { CategoryCard } from '@/components/CategoryCard'
import { getSortedPosts } from '@/lib/posts'
import { categoryMeta } from '@/lib/categories'

export default function HomePage() {
  const posts = getSortedPosts()
  const categories = Object.keys(categoryMeta)

  return (
    <>
      <Hero />

      {/* 分类栏目 */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <h2 className="mb-6 text-center font-serif text-xl font-bold text-ink-800 dark:text-ink-200">
          <span className="seal mr-2 text-[10px] px-2 py-0.5">览</span>
          内容栏目
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <CategoryCard key={cat} slug={cat} index={i} />
          ))}
        </div>
      </section>

      {/* 最新文章 */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="bamboo-divider mb-8" />
        <h2 className="mb-6 text-center font-serif text-xl font-bold text-ink-800 dark:text-ink-200">
          <span className="seal mr-2 text-[10px] px-2 py-0.5">新</span>
          最新文章
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.slice(0, 6).map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
        {posts.length > 6 && (
          <div className="mt-8 text-center">
            <a
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-vermilion hover:underline"
            >
              查看全部文章 →
            </a>
          </div>
        )}
      </section>
    </>
  )
}
