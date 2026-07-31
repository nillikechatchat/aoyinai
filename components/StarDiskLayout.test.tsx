import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StarDiskLayout } from './StarDiskLayout'

declare const describe: (name: string, run: () => void) => void
declare const it: (name: string, run: () => void) => void
declare const expect: (actual: unknown) => {
  toBe: (expected: unknown) => void
  toContain: (expected: string) => void
}

const items = Array.from({ length: 8 }, (_, index) => ({
  slug: ['tutorials', 'inspiration', 'market', 'majors', 'events', 'hackathons', 'cloud-deals', 't-agent'][index],
  count: index + 1,
}))

describe('主题星盘', () => {
  const html = renderToStaticMarkup(createElement(StarDiskLayout, { items }))

  it('轮播渲染八个主题分类卡片', () => {
    expect((html.match(/star-carousel-slide/g) ?? []).length).toBe(8)
    expect(html).toContain('探索主题轮播')
  })

  it('轮播提供前后切换与位置指示器', () => {
    expect(html).toContain('查看上一个主题')
    expect(html).toContain('查看下一个主题')
    expect(html).toContain('轮播位置')
  })

  it('每个分类卡片保留可跳转链接', () => {
    for (const item of items) {
      expect(html).toContain(`/categories/${item.slug}`)
    }
  })
})
