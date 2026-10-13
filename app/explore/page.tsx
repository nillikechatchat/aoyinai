import type { Metadata } from 'next'
import { CategoryCard } from '@/components/CategoryCard'
import { categoryMeta } from '@/lib/categories'
import { getPostsByCategory } from '@/lib/posts'

export const metadata: Metadata = {
  title: '探索主题',
  description: '围绕鸿渐Space的八个主题路径，选择下一段学习与思考。',
}

export default function ExplorePage() {
  const items = Object.keys(categoryMeta)

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="text-sm text-ink-500">主题探索</p>
      <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-ink-900">
        从一个方向，走向更远的理解。
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-ink-500">
        八条主题路径帮助你从当下的问题进入可持续的学习与实践。
      </p>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((slug, i) => (
          <CategoryCard
            key={slug}
            slug={slug}
            index={i}
            count={getPostsByCategory(slug).length}
          />
        ))}
      </div>
    </main>
  )
}
