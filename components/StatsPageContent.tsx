import Link from 'next/link'
import {
  competitionDataVerifiedAt,
  competitionRecords,
  getActiveCompetitions,
  getArchivedCompetitions,
  getTimelineItems,
  getTotalPrize,
  type CompetitionTimelineItem,
  type ResolvedCompetition,
} from '@/lib/competitions'

const statusColors: Record<string, string> = {
  报名中: '#2e8b57',
  待核验: '#b8860b',
  已截止: '#8c7044',
  已结束: '#8c7044',
}

const timelineLabels: Record<CompetitionTimelineItem['type'], string> = {
  deadline: '截止',
  result: '结果',
  final: '决赛',
  award: '颁奖',
}

function formatDate(date: string): string {
  return date.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$1年$2月$3日')
}

function Timeline({ items }: { items: CompetitionTimelineItem[] }) {
  return (
    <section aria-labelledby="timeline-heading">
      <h2 id="timeline-heading" className="font-serif text-xl font-bold text-ink-800 dark:text-ink-200 mb-6 flex items-center gap-2">
        <span className="seal text-xs px-2 py-0.5">时</span>
        关键时间轴
      </h2>
      <div className="relative border-l-2 border-ink-200/30 pl-6 dark:border-ink-800/30 sm:pl-8">
        {items.map((item) => {
          const color = item.type === 'deadline' ? '#c53d43' : item.type === 'result' ? '#b8860b' : item.type === 'final' ? '#2e8b57' : '#8c7044'

          return (
            <div key={item.id} className="relative mb-5 last:mb-0">
              <span
                className="absolute -left-[9px] top-1.5 h-3 w-3 rounded-full border-2 bg-rice dark:bg-ink-950"
                style={{ borderColor: color }}
              />
              <Link href={`#competition-${item.competitionId}`} className="block group">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xs text-ink-400 dark:text-ink-600 w-16 shrink-0">{item.date}</span>
                  <span className="text-sm text-ink-700 dark:text-ink-300 group-hover:text-vermilion">{item.label}</span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: `${color}15`, color }}
                  >
                    {timelineLabels[item.type]}
                  </span>
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function CompetitionTable({ competitions }: { competitions: ResolvedCompetition[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-200/30 dark:border-ink-800/30">
            <th className="text-left py-2 pr-3 font-medium text-ink-600 dark:text-ink-400">赛事</th>
            <th className="text-left py-2 pr-3 font-medium text-ink-600 dark:text-ink-400">赛道</th>
            <th className="text-right py-2 pr-3 font-medium text-ink-600 dark:text-ink-400">奖金</th>
            <th className="text-center py-2 pr-3 font-medium text-ink-600 dark:text-ink-400">截止</th>
            <th className="text-center py-2 font-medium text-ink-600 dark:text-ink-400">状态</th>
          </tr>
        </thead>
        <tbody>
          {competitions.map((competition) => {
            const color = statusColors[competition.status] ?? '#8c7044'

            return (
              <tr key={competition.id} id={`competition-${competition.id}`} className="border-b border-ink-100/30 align-top dark:border-ink-900/30">
                <td className="py-2.5 pr-3 text-ink-800 dark:text-ink-200 font-medium">
                  <a href={competition.sourceUrl} target="_blank" rel="noreferrer" className="hover:text-vermilion hover:underline">
                    {competition.name}
                  </a>
                  <div className="mt-1 text-[10px] font-normal text-ink-400">更新于 {formatDate(competition.lastUpdatedAt)}</div>
                  {competition.changes.length > 0 && (
                    <details className="mt-2 text-xs font-normal text-ink-500 dark:text-ink-500">
                      <summary className="cursor-pointer hover:text-vermilion">查看 {competition.changes.length} 条更新记录</summary>
                      <ul className="mt-2 space-y-2 border-l border-ink-200/50 pl-3 dark:border-ink-700/50">
                        {[...competition.changes].sort((left, right) => right.date.localeCompare(left.date)).map((change) => (
                          <li key={`${competition.id}-${change.date}-${change.summary}`}>
                            <span>{formatDate(change.date)}：{change.summary}</span>
                            <a href={change.sourceUrl} target="_blank" rel="noreferrer" className="ml-1 text-vermilion hover:underline">来源</a>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </td>
                <td className="py-2.5 pr-3 text-ink-500 dark:text-ink-600">{competition.category}</td>
                <td className="py-2.5 pr-3 text-right text-ink-600 dark:text-ink-400">{competition.prize === null ? '未公开' : `${competition.prize}${competition.prizeUnit}`}</td>
                <td className="py-2.5 pr-3 text-center text-ink-500 dark:text-ink-600">{competition.deadlineLabel}</td>
                <td className="py-2.5 text-center">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${color}15`, color }}>
                    {competition.status}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function StatsPageContent() {
  const activeCompetitions = getActiveCompetitions(competitionDataVerifiedAt)
  const archivedCompetitions = getArchivedCompetitions(competitionDataVerifiedAt)
  const timelineItems = getTimelineItems(competitionRecords, competitionDataVerifiedAt)
  const prizeData = activeCompetitions.filter((competition): competition is ResolvedCompetition & { prize: number } => competition.prize !== null && competition.prize > 0).sort((left, right) => right.prize - left.prize)
  const maxPrize = Math.max(...prizeData.map((competition) => competition.prize), 1)
  const categoryCounts = activeCompetitions.reduce<Record<string, number>>((counts, competition) => {
    counts[competition.category] = (counts[competition.category] ?? 0) + 1
    return counts
  }, {})

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <span className="seal text-lg px-4 py-2 mb-4 inline-block">数据</span>
        <h1 className="font-serif text-3xl font-bold text-ink-900 dark:text-ink-100 mb-3">2026 AI 赛事统计</h1>
        <p className="text-ink-500 dark:text-ink-600 max-w-xl mx-auto text-sm">数据核验于 {formatDate(competitionDataVerifiedAt)}，当前收录 {activeCompetitions.length} 场可报名赛事。</p>
      </div>

      <div className="bamboo-divider mb-10" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-10">
        {[
          { value: activeCompetitions.length, label: '可报名赛事', icon: '报' },
          { value: `${getTotalPrize(activeCompetitions)}万`, label: '已公开奖金', icon: '金' },
          { value: Object.keys(categoryCounts).length, label: '覆盖赛道', icon: '类' },
          { value: formatDate(competitionDataVerifiedAt), label: '最近核验', icon: '校' },
        ].map((item) => (
          <div key={item.label} className="card p-4 text-center">
            <span className="seal text-xs px-1.5 py-0.5 mb-2 inline-block">{item.icon}</span>
            <div className="font-serif text-2xl font-bold text-vermilion">{item.value}</div>
            <div className="text-[11px] text-ink-500 dark:text-ink-600 mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        <main className="lg:col-span-8">
          <section className="mb-12">
            <h2 className="font-serif text-xl font-bold text-ink-800 dark:text-ink-200 mb-6 flex items-center gap-2"><span className="seal text-xs px-2 py-0.5">金</span>奖金池对比（万元）</h2>
            <div className="space-y-3">
              {prizeData.map((competition) => (
                <div key={competition.id} className="flex items-center gap-3">
                  <div className="w-32 text-right text-xs text-ink-600 dark:text-ink-400 shrink-0 truncate">{competition.name}</div>
                  <div className="flex-1 relative h-7 rounded bg-ink-100/30 dark:bg-ink-800/30 overflow-hidden">
                    <div className="absolute inset-y-0 left-0 rounded flex items-center" style={{ width: `${(competition.prize / maxPrize) * 100}%`, background: `linear-gradient(90deg, ${competition.color}cc, ${competition.color})`, minWidth: '48px' }}>
                      <span className="px-2 text-[11px] font-medium text-white whitespace-nowrap">{competition.prize}{competition.prizeUnit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-xl font-bold text-ink-800 dark:text-ink-200 mb-6 flex items-center gap-2"><span className="seal text-xs px-2 py-0.5">类</span>赛道分布</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryCounts).sort((left, right) => right[1] - left[1]).map(([category, count]) => (
                <div key={category} className="card px-3 py-2 flex items-center gap-2">
                  <span className="font-medium text-sm text-ink-800 dark:text-ink-200">{category}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-vermilion/10 text-vermilion font-medium">{count}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="lg:hidden mb-12"><Timeline items={timelineItems} /></div>

          <section className="mb-12">
            <h2 className="font-serif text-xl font-bold text-ink-800 dark:text-ink-200 mb-6 flex items-center gap-2"><span className="seal text-xs px-2 py-0.5">表</span>当前可报名赛事</h2>
            <CompetitionTable competitions={activeCompetitions} />
          </section>

          <details className="card p-5 mb-12">
            <summary className="cursor-pointer font-serif text-xl font-bold text-ink-800 dark:text-ink-200">历史赛事（{archivedCompetitions.length}）</summary>
            <div className="mt-6"><CompetitionTable competitions={archivedCompetitions} /></div>
          </details>
        </main>

        <aside className="hidden lg:block lg:col-span-4">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2"><Timeline items={timelineItems} /></div>
        </aside>
      </div>

      <div className="bamboo-divider mb-8" />
      <div className="text-center">
        <p className="text-xs text-ink-400 dark:text-ink-600 mb-4">赛事信息以主办方或赛事平台来源为准。</p>
        <Link href="/blog/ai-competitions-2026" className="text-sm text-vermilion hover:underline">查看完整赛事文章 →</Link>
      </div>
    </div>
  )
}
