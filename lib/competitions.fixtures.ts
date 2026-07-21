import type { CompetitionRecord, CompetitionTimelineItem } from './competitions'

const sourceUrl = 'https://example.com/competition'

export function createTimelineItem(
  competitionId: string,
  date: string,
  type: CompetitionTimelineItem['type'] = 'deadline',
): CompetitionTimelineItem {
  return {
    id: `${competitionId}-${date}-${type}`,
    competitionId,
    date,
    label: `${competitionId} ${type}`,
    type,
  }
}

export function createCompetitionRecord(
  overrides: Partial<CompetitionRecord> = {},
): CompetitionRecord {
  const id = overrides.id ?? 'fixture-competition'

  return {
    id,
    name: '夹具赛事',
    category: '测试赛道',
    prize: 10,
    prizeUnit: '万元',
    status: '报名中',
    deadline: '2026-07-25',
    deadlineLabel: '7月25日',
    sourceUrl,
    color: '#c53d43',
    verifiedAt: '2026-07-01',
    keyDates: [createTimelineItem(id, '2026-07-25')],
    changes: [],
    ...overrides,
  }
}
