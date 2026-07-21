import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import StatsPage from './page'
import { CompetitionTable } from '@/components/StatsPageContent'
import { resolveCompetition } from '@/lib/competitions'
import { createCompetitionRecord } from '@/lib/competitions.fixtures'

declare const describe: (name: string, run: () => void) => void
declare const it: (name: string, run: () => void) => void
declare const expect: (actual: string) => {
  toContain: (expected: string) => void
}

describe('赛事统计页', () => {
  it('渲染活跃统计、来源链接、折叠归档区和响应式时间轴', () => {
    const html = renderToStaticMarkup(createElement(StatsPage))

    expect(html).toContain('当前可报名赛事')
    expect(html).toContain('历史赛事（0）')
    expect(html).toContain('https://www.bilibili.com/blackboard/era/Vf5kaXL0HnJyfqIG.html')
    expect(html).toContain('lg:hidden')
    expect(html).toContain('sticky top-24')
    expect(html).toContain('#competition-bilibili-ai-creation-2026')
  })

  it('为已修订赛事渲染可展开的变更历史', () => {
    const competition = resolveCompetition(createCompetitionRecord({
      changes: [
        {
          date: '2026-07-10',
          summary: '更新报名截止日期',
          sourceUrl: 'https://example.com/update',
          changes: { deadline: '2026-08-01', deadlineLabel: '8月1日' },
        },
      ],
    }))
    const html = renderToStaticMarkup(createElement(CompetitionTable, { competitions: [competition] }))

    expect(html).toContain('查看 1 条更新记录')
    expect(html).toContain('更新报名截止日期')
    expect(html).toContain('https://example.com/update')
  })
})
