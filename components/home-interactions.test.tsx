import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { CategoryCard } from './CategoryCard'
import { PostCard } from './PostCard'
import { FullPageSection } from './fullscreen/FullPageSection'
import { getHeroParallax } from '@/lib/home-motion'
import type { Post } from '@/lib/posts'

declare const describe: (name: string, run: () => void) => void
declare const it: (name: string, run: () => void) => void
declare const expect: (actual: unknown) => {
  toBe: (expected: unknown) => void
  toEqual: (expected: unknown) => void
  toContain: (expected: string) => void
}

const post: Post = {
  id: 'motion-test',
  title: '空间反馈测试',
  description: '验证文章卡片的空间悬停配置。',
  date: '2026-07-31',
  categories: ['tutorials'],
  tags: [],
  draft: false,
  content: '测试正文',
}

describe('首页交互', () => {
  it('滚动视差将进度限制在首屏范围内', () => {
    expect(getHeroParallax(0)).toEqual({
      titleY: 0,
      titleOpacity: 1,
      subtitleY: 0,
      logoScale: 1,
      ctaY: 0,
    })
    expect(getHeroParallax(0.5).titleY).toBe(-60)
    expect(getHeroParallax(1).logoScale).toBe(0.9)
    expect(getHeroParallax(-1).ctaY).toBe(0)
  })

  it('分类和文章卡片保留可交互的链接语义', () => {
    const categoryHtml = renderToStaticMarkup(createElement(CategoryCard, { slug: 'tutorials', count: 2 }))
    const postHtml = renderToStaticMarkup(createElement(PostCard, { post }))

    expect(categoryHtml).toContain('category-card-item')
    expect(categoryHtml).toContain('/categories/tutorials')
    expect(postHtml).toContain('post-card')
    expect(postHtml).toContain('/blog/motion-test')
  })

  it('整屏区块保留滚动吸附所需的标记', () => {
    const html = renderToStaticMarkup(createElement(FullPageSection, { id: 'motion-section', children: '内容' }))

    expect(html).toContain('data-fullpage-section')
    expect(html).toContain('id="motion-section"')
  })
})
