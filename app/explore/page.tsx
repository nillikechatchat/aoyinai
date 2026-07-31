import type { Metadata } from 'next'
import { StarDiskLayout } from '@/components/StarDiskLayout'
import { categoryMeta } from '@/lib/categories'
import { getPostsByCategory } from '@/lib/posts'

export const metadata: Metadata = {
  title: '探索主题',
  description: '围绕鸿渐Space的八个主题路径，选择下一段学习与思考。',
}

export default function ExplorePage() {
  const items = Object.keys(categoryMeta).map((slug) => ({
    slug,
    count: getPostsByCategory(slug).length,
  }))

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-[1240px] flex-col justify-center px-6 py-8 sm:px-10 lg:px-14">
      <p className="text-[10px] font-medium tracking-[0.2em] text-vermilion">主题探索</p>
      <h1 className="mt-5 font-serif text-4xl font-semibold tracking-[-0.04em] text-ink-900 sm:text-6xl">
        从一个方向，
        <br />
        走向更远的理解。
      </h1>
      <p className="mt-7 max-w-lg text-sm leading-7 text-ink-500 sm:text-base">
        八条主题路径将围绕风山渐展开，帮助你从当下的问题进入可持续的学习与实践。
      </p>
      <div className="mt-10 sm:mt-14">
        <h2 className="sr-only">探索方向</h2>
        <StarDiskLayout items={items} />
      </div>
    </main>
  )
}
