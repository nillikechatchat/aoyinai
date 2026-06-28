import { PostCard } from '@/components/PostCard'
import { CategoryCard } from '@/components/CategoryCard'
import { getSortedPosts } from '@/lib/posts'
import { categoryMeta } from '@/lib/categories'

export default function BlogPage() {
  const posts = getSortedPosts()

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/" className="hover:text-foreground">首页</a>
        <span>/</span>
        <span className="text-foreground">全部文章</span>
      </nav>

      <header className="mb-12">
        <h1 className="ai-gradient-text mb-4 text-4xl font-bold">全部文章</h1>
        <p className="text-muted-foreground">共 {posts.length} 篇，持续更新中</p>
      </header>

      {/* 分类快筛 */}
      <div className="mb-8 flex flex-wrap gap-2">
        {Object.entries(categoryMeta).map(([slug, meta]) => (
          <a
            key={slug}
            href={`/categories/${slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:scale-105"
            style={{
              borderColor: `${meta.color}50`,
              color: meta.color,
              background: `${meta.color}10`
            }}
          >
            <span>{meta.emoji}</span>
            {meta.label}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} detailed />
        ))}
      </div>
    </div>
  )
}
