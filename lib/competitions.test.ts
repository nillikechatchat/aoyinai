import {
  getActiveCompetitions,
  getArchivedCompetitions,
  getTimelineItems,
  getTotalPrize,
  resolveCompetition,
  type CompetitionRecord,
} from './competitions'
import { createCompetitionRecord, createTimelineItem } from './competitions.fixtures'

declare const describe: (name: string, run: () => void) => void
declare const it: (name: string, run: () => void) => void
declare const expect: (actual: unknown) => {
  toBe: (expected: unknown) => void
  toEqual: (expected: unknown) => void
  toHaveLength: (expected: number) => void
}

describe('赛事数据派生', () => {
  it('属性 1、2：生成的赛事标识唯一，更新日期满足核验日期边界', () => {
    for (let sample = 0; sample < 32; sample += 1) {
      const records = Array.from({ length: sample + 1 }, (_, index) =>
        createCompetitionRecord({
          id: `record-${sample}-${index}`,
          changes: [
            {
              date: `2026-07-${String(index + 1).padStart(2, '0')}`,
              summary: '更新信息',
              sourceUrl: 'https://example.com/update',
              changes: { prize: index },
            },
          ],
        }),
      )

      expect(new Set(records.map((record) => record.id)).size).toBe(records.length)
      expect(records.every((record) => record.changes.every((change) => change.date >= record.verifiedAt))).toBe(true)
    }
  })

  it('属性 3、5：快照按日期合并，且不修改初始记录与变更历史', () => {
    for (let sample = 0; sample < 20; sample += 1) {
      const record = createCompetitionRecord({
        changes: [
          {
            date: '2026-07-10',
            summary: '更新奖金',
            sourceUrl: 'https://example.com/prize',
            changes: { prize: sample + 10 },
          },
          {
            date: '2026-07-15',
            summary: '延期报名',
            sourceUrl: 'https://example.com/deadline',
            changes: { deadline: '2026-08-01', deadlineLabel: '8月1日' },
          },
        ].reverse(),
      })
      const original = JSON.stringify(record)
      const resolved = resolveCompetition(record)

      expect(resolved.prize).toBe(sample + 10)
      expect(resolved.deadline).toBe('2026-08-01')
      expect(resolved.lastUpdatedAt).toBe('2026-07-15')
      expect(JSON.stringify(record)).toBe(original)
    }
  })

  it('属性 4、7：活跃、归档与奖金统计只纳入满足规则的记录', () => {
    const records: CompetitionRecord[] = [
      createCompetitionRecord({ id: 'active-with-prize', prize: 20 }),
      createCompetitionRecord({ id: 'active-without-prize', prize: null }),
      createCompetitionRecord({ id: 'deadline-today', deadline: '2026-07-21' }),
      createCompetitionRecord({ id: 'archived', deadline: '2026-07-20' }),
      createCompetitionRecord({ id: 'missing-source', sourceUrl: '' }),
      createCompetitionRecord({ id: 'invalid-deadline', deadline: '2026-02-30' }),
      createCompetitionRecord({ id: 'closed-status', status: '已截止' }),
    ]
    const active = getActiveCompetitions('2026-07-21', records)
    const archived = getArchivedCompetitions('2026-07-21', records)

    expect(active.map((record) => record.id)).toEqual([
      'active-with-prize',
      'active-without-prize',
      'deadline-today',
    ])
    expect(archived.map((record) => record.id)).toEqual(['archived'])
    expect(getTotalPrize(active)).toBe(30)
  })

  it('属性 6：时间轴按日期升序，并只关联活跃赛事', () => {
    const active = createCompetitionRecord({
      id: 'active',
      keyDates: [
        createTimelineItem('active', '2026-07-28', 'result'),
        createTimelineItem('active', '2026-07-22'),
      ],
    })
    const archived = createCompetitionRecord({
      id: 'archived',
      deadline: '2026-07-20',
      keyDates: [createTimelineItem('archived', '2026-07-25')],
    })
    const timeline = getTimelineItems([archived, active], '2026-07-21')

    expect(timeline.map((item) => item.date)).toEqual(['2026-07-22', '2026-07-28'])
    expect(timeline.every((item) => item.competitionId === 'active')).toBe(true)
  })
})
