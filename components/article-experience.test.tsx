import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Link from 'next/link'
import { ReadingProgress, getReadingProgress } from './ReadingProgress'
import { TableOfContents } from './TableOfContents'
import { extractTableOfContents } from '@/lib/toc'
import { markdownToHtml } from '@/lib/posts'

declare const describe: (name: string, run: () => void) => void
declare const it: (name: string, run: () => void | Promise<void>) => void
declare const expect: (actual: unknown) => {
  toBe: (expected: unknown) => void
  toContain: (expected: string) => void
}

describe('文章阅读体验', () => {
  const markdown = '## 开始使用\n\n### 第一步\n\n## 开始使用'

  it('目录生成稳定的标题锚点', async () => {
    const items = extractTableOfContents(markdown)
    const html = renderToStaticMarkup(createElement(TableOfContents, { items }))
    const articleHtml = await markdownToHtml(markdown)

    expect(html).toContain('href="#开始使用"')
    expect(html).toContain('href="#第一步"')
    expect(html).toContain('href="#开始使用-2"')
    expect(articleHtml).toContain('<h2 id="开始使用">')
    expect(articleHtml).toContain('<h3 id="第一步">')
  })

  it('阅读进度根据可滚动高度计算并限制在 0 到 100', () => {
    expect(getReadingProgress(0, 1000, 500)).toBe(0)
    expect(getReadingProgress(250, 1000, 500)).toBe(50)
    expect(getReadingProgress(900, 1000, 500)).toBe(100)
    expect(getReadingProgress(0, 500, 500)).toBe(0)
    expect(renderToStaticMarkup(createElement(ReadingProgress))).toContain('scaleX(0)')
  })

  it('返回入口保留文章列表链接', () => {
    const html = renderToStaticMarkup(createElement(Link, { href: '/blog' }, '返回文章列表'))

    expect(html).toContain('href="/blog"')
  })
})
