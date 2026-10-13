import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import RootLayout from './layout'
import TagsPage from './tags/page'
import ArchivesPage from './archives/page'
import { SearchClient } from '@/components/SearchClient'
import StatsPageContent from '@/components/StatsPageContent'

declare const describe: (name: string, run: () => void) => void
declare const it: (name: string, run: () => void) => void
declare const expect: (actual: unknown) => {
  toContain: (expected: string) => void
}

describe('页面布局一致性', () => {
  it('根布局向展示页面提供渐卦背景', () => {
    const html = renderToStaticMarkup(createElement(RootLayout, { children: '内容' }))

    expect(html).toContain('hexagram-scene')
    expect(html).toContain('风山渐')
  })

  it('搜索、标签和归档页面使用稳定的纸张内容层', () => {
    const searchHtml = renderToStaticMarkup(createElement(SearchClient, { posts: [] }))
    const tagsHtml = renderToStaticMarkup(createElement(TagsPage))
    const archivesHtml = renderToStaticMarkup(createElement(ArchivesPage))

    expect(searchHtml).toContain('content-page')
    expect(tagsHtml).toContain('content-page')
    expect(archivesHtml).toContain('content-page')
  })

  it('赛事统计页面使用稳定的纸张内容层', () => {
    const html = renderToStaticMarkup(createElement(StatsPageContent))

    expect(html).toContain('content-page')
  })
})
