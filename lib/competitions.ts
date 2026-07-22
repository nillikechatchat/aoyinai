export type CompetitionStatus = '报名中' | '待核验' | '已截止' | '已结束'

export type TimelineItemType = 'deadline' | 'result' | 'final' | 'award'

export type CompetitionTimelineItem = {
  id: string
  competitionId: string
  date: string
  label: string
  type: TimelineItemType
}

export type CompetitionSnapshot = {
  name: string
  category: string
  prize: number | null
  prizeUnit: string
  status: CompetitionStatus
  deadline: string | null
  deadlineLabel: string
  sourceUrl: string
  color: string
  keyDates: CompetitionTimelineItem[]
}

export type CompetitionChange = {
  date: string
  summary: string
  sourceUrl: string
  changes: Partial<CompetitionSnapshot>
}

export type CompetitionRecord = CompetitionSnapshot & {
  id: string
  verifiedAt: string
  changes: CompetitionChange[]
}

export type ResolvedCompetition = CompetitionSnapshot & {
  id: string
  verifiedAt: string
  changes: CompetitionChange[]
  lastUpdatedAt: string
}

export const competitionDataVerifiedAt = '2026-07-22'

export const competitionRecords: CompetitionRecord[] = [
  {
    id: 'bilibili-ai-creation-2026',
    name: 'B站 AI 创造公开赛',
    category: '综合',
    prize: 130,
    prizeUnit: '万元',
    status: '报名中',
    deadline: '2026-08-20',
    deadlineLabel: '8月20日',
    sourceUrl: 'https://www.bilibili.com/blackboard/era/Vf5kaXL0HnJyfqIG.html',
    color: '#c53d43',
    verifiedAt: competitionDataVerifiedAt,
    keyDates: [
      {
        id: 'bilibili-ai-creation-2026-deadline',
        competitionId: 'bilibili-ai-creation-2026',
        date: '2026-08-20',
        label: 'B站 AI 创造公开赛 投稿截止',
        type: 'deadline',
      },
      {
        id: 'bilibili-ai-creation-2026-result',
        competitionId: 'bilibili-ai-creation-2026',
        date: '2026-09-05',
        label: 'B站 AI 创造公开赛 结果公布',
        type: 'result',
      },
    ],
    changes: [],
  },
  {
    id: 'intern-ai-science-challenge-2026',
    name: '书生国智科探挑战赛',
    category: '学术',
    prize: 60,
    prizeUnit: '万元',
    status: '报名中',
    deadline: '2026-09-20',
    deadlineLabel: '9月下旬',
    sourceUrl: 'https://www.intern-ai.org.cn/',
    color: '#b8860b',
    verifiedAt: competitionDataVerifiedAt,
    keyDates: [
      {
        id: 'intern-ai-science-challenge-2026-award',
        competitionId: 'intern-ai-science-challenge-2026',
        date: '2026-09-20',
        label: '书生国智科探挑战赛 专家评审结束',
        type: 'award',
      },
    ],
    changes: [],
  },
  {
    id: 'ccf-bdci-2026',
    name: 'CCF BDCI 2026',
    category: 'Agent',
    prize: 10,
    prizeUnit: '万元/题',
    status: '报名中',
    deadline: '2026-09-15',
    deadlineLabel: '9月中旬',
    sourceUrl: 'https://www.xir.cn/competition/races/BDCI2026',
    color: '#c53d43',
    verifiedAt: competitionDataVerifiedAt,
    keyDates: [
      {
        id: 'ccf-bdci-2026-deadline',
        competitionId: 'ccf-bdci-2026',
        date: '2026-09-15',
        label: 'CCF BDCI 2026 初赛截止',
        type: 'deadline',
      },
    ],
    changes: [],
  },
  {
    id: 'alibaba-ai-for-good-2026',
    name: '阿里小有可为',
    category: '公益',
    prize: 21,
    prizeUnit: '万元',
    status: '报名中',
    deadline: '2026-08-13',
    deadlineLabel: '8月13日',
    sourceUrl: 'https://opc.aliyun.com/xiaoyoukewei?display_mode=3',
    color: '#2e8b57',
    verifiedAt: competitionDataVerifiedAt,
    keyDates: [
      {
        id: 'alibaba-ai-for-good-2026-deadline',
        competitionId: 'alibaba-ai-for-good-2026',
        date: '2026-08-13',
        label: '阿里小有可为 初赛材料截止',
        type: 'deadline',
      },
      {
        id: 'alibaba-ai-for-good-2026-result',
        competitionId: 'alibaba-ai-for-good-2026',
        date: '2026-08-21',
        label: '阿里小有可为 决赛名单公布',
        type: 'result',
      },
      {
        id: 'alibaba-ai-for-good-2026-final',
        competitionId: 'alibaba-ai-for-good-2026',
        date: '2026-09-03',
        label: '阿里小有可为 决赛材料截止',
        type: 'final',
      },
      {
        id: 'alibaba-ai-for-good-2026-award',
        competitionId: 'alibaba-ai-for-good-2026',
        date: '2026-09-05',
        label: '阿里小有可为 线下决赛拟举行',
        type: 'award',
      },
    ],
    changes: [],
  },
  {
    id: 'ai-new-talent-scout-2026',
    name: 'AI 新睿人才星探计划',
    category: '产业AI',
    prize: 9,
    prizeUnit: '万元',
    status: '报名中',
    deadline: '2026-08-31',
    deadlineLabel: '8月31日',
    sourceUrl: 'https://www.datafountain.cn/competitions/1169',
    color: '#2e8b57',
    verifiedAt: competitionDataVerifiedAt,
    keyDates: [
      {
        id: 'ai-new-talent-scout-2026-deadline',
        competitionId: 'ai-new-talent-scout-2026',
        date: '2026-08-31',
        label: 'AI 新睿人才星探计划 截止',
        type: 'deadline',
      },
    ],
    changes: [],
  },
  {
    id: 'falcon-microwave-detection-2026',
    name: '猎鹰微波智探挑战',
    category: '智能感知',
    prize: 14.5,
    prizeUnit: '万元',
    status: '报名中',
    deadline: '2026-08-31',
    deadlineLabel: '8月31日',
    sourceUrl: 'https://www.datafountain.cn/competitions/1166',
    color: '#b8860b',
    verifiedAt: competitionDataVerifiedAt,
    keyDates: [
      {
        id: 'falcon-microwave-detection-2026-deadline',
        competitionId: 'falcon-microwave-detection-2026',
        date: '2026-08-31',
        label: '猎鹰微波智探挑战 截止',
        type: 'deadline',
      },
    ],
    changes: [],
  },
  {
    id: 'multimodal-customer-agent-2026',
    name: '多模态客服智能体设计',
    category: 'Agent',
    prize: 14.5,
    prizeUnit: '万元',
    status: '报名中',
    deadline: '2026-08-31',
    deadlineLabel: '8月31日',
    sourceUrl: 'https://www.datafountain.cn/competitions/1165',
    color: '#c53d43',
    verifiedAt: competitionDataVerifiedAt,
    keyDates: [
      {
        id: 'multimodal-customer-agent-2026-deadline',
        competitionId: 'multimodal-customer-agent-2026',
        date: '2026-08-31',
        label: '多模态客服智能体设计 截止',
        type: 'deadline',
      },
    ],
    changes: [],
  },
  {
    id: 'infrared-open-world-segmentation-2026',
    name: '红外开放世界分割挑战',
    category: '计算机视觉',
    prize: 14.5,
    prizeUnit: '万元',
    status: '报名中',
    deadline: '2026-07-30',
    deadlineLabel: '7月30日',
    sourceUrl: 'https://www.datafountain.cn/competitions/1164',
    color: '#b8860b',
    verifiedAt: competitionDataVerifiedAt,
    keyDates: [
      {
        id: 'infrared-open-world-segmentation-2026-deadline',
        competitionId: 'infrared-open-world-segmentation-2026',
        date: '2026-07-30',
        label: '红外开放世界分割挑战 截止',
        type: 'deadline',
      },
    ],
    changes: [],
  },
  {
    id: 'goai-global-open-source-ai-challenge-2026',
    name: 'GOAI 世界人工智能开源大赛',
    category: '开源AI',
    prize: 500,
    prizeUnit: '万元',
    status: '报名中',
    deadline: '2026-08-15',
    deadlineLabel: '8月中旬',
    sourceUrl: 'https://goaihz.com',
    color: '#2e8b57',
    verifiedAt: competitionDataVerifiedAt,
    keyDates: [
      {
        id: 'goai-global-open-source-ai-challenge-2026-deadline',
        competitionId: 'goai-global-open-source-ai-challenge-2026',
        date: '2026-08-15',
        label: 'GOAI 世界人工智能开源大赛 初赛作品提交预计截止',
        type: 'deadline',
      },
      {
        id: 'goai-global-open-source-ai-challenge-2026-final',
        competitionId: 'goai-global-open-source-ai-challenge-2026',
        date: '2026-09-22',
        label: 'GOAI 世界人工智能开源大赛 线下决赛',
        type: 'final',
      },
      {
        id: 'goai-global-open-source-ai-challenge-2026-award',
        competitionId: 'goai-global-open-source-ai-challenge-2026',
        date: '2026-09-23',
        label: 'GOAI DAY 与颁奖典礼',
        type: 'award',
      },
    ],
    changes: [],
  },
  {
    id: 'postgraduate-ai-innovation-2026',
    name: '第八届中国研究生人工智能创新大赛',
    category: '学术',
    prize: 30,
    prizeUnit: '万元起',
    status: '报名中',
    deadline: '2026-08-25',
    deadlineLabel: '8月25日',
    sourceUrl:
      'https://cpipc.acge.org.cn/cw/contestNews/detail/2c9088a5696cbf370169a3f8101510bd/2c9080179e403028019e4963ef9f149e?page=0',
    color: '#b8860b',
    verifiedAt: competitionDataVerifiedAt,
    keyDates: [
      {
        id: 'postgraduate-ai-innovation-2026-deadline',
        competitionId: 'postgraduate-ai-innovation-2026',
        date: '2026-08-25',
        label: '中国研究生人工智能创新大赛 报名截止',
        type: 'deadline',
      },
      {
        id: 'postgraduate-ai-innovation-2026-submission',
        competitionId: 'postgraduate-ai-innovation-2026',
        date: '2026-09-01',
        label: '中国研究生人工智能创新大赛 作品提交截止',
        type: 'deadline',
      },
      {
        id: 'postgraduate-ai-innovation-2026-result',
        competitionId: 'postgraduate-ai-innovation-2026',
        date: '2026-09-30',
        label: '中国研究生人工智能创新大赛 晋级决赛名单预计公布',
        type: 'result',
      },
    ],
    changes: [],
  },
  {
    id: 'national-ai-creation-2026',
    name: '2026 全民 AI 创作大赛',
    category: 'AIGC',
    prize: 15,
    prizeUnit: '万元',
    status: '报名中',
    deadline: '2026-08-31',
    deadlineLabel: '8月31日',
    sourceUrl: 'https://zhjw.jnu.edu.cn/2026/0720/c7164a860655/page.htm',
    color: '#c53d43',
    verifiedAt: competitionDataVerifiedAt,
    keyDates: [
      {
        id: 'national-ai-creation-2026-deadline',
        competitionId: 'national-ai-creation-2026',
        date: '2026-08-31',
        label: '全民 AI 创作大赛 作品征集截止',
        type: 'deadline',
      },
      {
        id: 'national-ai-creation-2026-result',
        competitionId: 'national-ai-creation-2026',
        date: '2026-09-15',
        label: '全民 AI 创作大赛 结果公示结束',
        type: 'result',
      },
    ],
    changes: [],
  },
]

function isValidDate(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
}

function isValidSourceUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export function resolveCompetition(record: CompetitionRecord): ResolvedCompetition {
  const changes = [...record.changes].sort((left, right) => left.date.localeCompare(right.date))
  const snapshot: CompetitionSnapshot = { ...record }
  let lastUpdatedAt = record.verifiedAt

  for (const change of changes) {
    Object.assign(snapshot, change.changes)
    if (isValidDate(change.date) && change.date >= lastUpdatedAt) {
      lastUpdatedAt = change.date
    }
  }

  if (!isValidSourceUrl(snapshot.sourceUrl) || !isValidDate(snapshot.deadline)) {
    snapshot.status = '待核验'
  }

  return {
    ...snapshot,
    id: record.id,
    verifiedAt: record.verifiedAt,
    changes: record.changes,
    lastUpdatedAt,
  }
}

export function getActiveCompetitions(
  asOf: string,
  records: CompetitionRecord[] = competitionRecords,
): ResolvedCompetition[] {
  if (!isValidDate(asOf)) return []

  return records
    .map(resolveCompetition)
    .filter(
      (competition) =>
        competition.status === '报名中' &&
        isValidSourceUrl(competition.sourceUrl) &&
        isValidDate(competition.deadline) &&
        competition.deadline >= asOf,
    )
}

export function getArchivedCompetitions(
  asOf: string,
  records: CompetitionRecord[] = competitionRecords,
): ResolvedCompetition[] {
  if (!isValidDate(asOf)) return []

  return records
    .map(resolveCompetition)
    .filter((competition) => isValidDate(competition.deadline) && competition.deadline < asOf)
}

export function getTotalPrize(competitions: ResolvedCompetition[]): number {
  return competitions.reduce((total, competition) => total + (competition.prize ?? 0), 0)
}

export function getTimelineItems(
  records: CompetitionRecord[],
  asOf: string,
): CompetitionTimelineItem[] {
  const activeIds = new Set(getActiveCompetitions(asOf, records).map((competition) => competition.id))

  return records
    .flatMap((record) => resolveCompetition(record).keyDates)
    .filter((item) => activeIds.has(item.competitionId) && isValidDate(item.date) && item.date >= asOf)
    .sort((left, right) => left.date.localeCompare(right.date))
}

export const competitionTimeline = getTimelineItems(competitionRecords, competitionDataVerifiedAt)
