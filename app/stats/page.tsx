import Link from 'next/link'
import { siteConfig } from '@/lib/site'

export const metadata = {
  title: '赛事统计',
  description: '2026 年 AI 赛事数据可视化：奖金池对比、时间轴、状态分布、参与趋势。',
  alternates: { canonical: `${siteConfig.url}/stats` }
}

const competitions = [
  { name: 'B站 AI 创造公开赛', prize: 130, unit: '万元', status: '报名中', deadline: '8月20日', category: '综合', color: '#c53d43' },
  { name: '书生国智科探挑战赛', prize: 60, unit: '万元', status: '报名中', deadline: '9月下旬', category: '学术', color: '#b8860b' },
  { name: 'CCF BDCI 2026', prize: 10, unit: '万元/题', status: '报名中', deadline: '9月中旬', category: 'Agent', color: '#c53d43' },
  { name: '阿里小有可为', prize: 21, unit: '万元', status: '报名中', deadline: '8月13日', category: '公益', color: '#2e8b57' },
  { name: 'AI 新睿人才星探计划', prize: 9, unit: '万元', status: '报名中', deadline: '8月31日', category: '产业AI', color: '#2e8b57' },
  { name: '猎鹰微波智探挑战', prize: 14.5, unit: '万元', status: '报名中', deadline: '8月31日', category: '智能感知', color: '#b8860b' },
  { name: '多模态客服智能体设计', prize: 14.5, unit: '万元', status: '报名中', deadline: '8月31日', category: 'Agent', color: '#c53d43' },
  { name: '红外开放世界分割挑战', prize: 14.5, unit: '万元', status: '报名中', deadline: '7月30日', category: '计算机视觉', color: '#b8860b' },
]

const prizeData = competitions
  .filter(c => c.prize > 0)
  .sort((a, b) => b.prize - a.prize)

const maxPrize = Math.max(...prizeData.map(d => d.prize))

const statusCounts = competitions.reduce((acc, c) => {
  acc[c.status] = (acc[c.status] || 0) + 1
  return acc
}, {} as Record<string, number>)

const statusColors: Record<string, string> = {
  '报名中': '#2e8b57',
}

const categoryCounts = competitions.reduce((acc, c) => {
  acc[c.category] = (acc[c.category] || 0) + 1
  return acc
}, {} as Record<string, number>)

const timeline = [
  { date: '7月30日', event: '红外开放世界分割挑战 截止', type: 'deadline' },
  { date: '8月13日', event: '阿里小有可为 初赛材料截止', type: 'deadline' },
  { date: '8月20日', event: 'B站 AI 创造公开赛 投稿截止', type: 'deadline' },
  { date: '8月21日', event: '阿里小有可为 决赛名单公布', type: 'event' },
  { date: '8月31日', event: 'DataFountain 三场赛事截止', type: 'deadline' },
  { date: '9月3日', event: '阿里小有可为 决赛材料截止', type: 'deadline' },
  { date: '9月5日', event: '阿里小有可为 线下决赛拟举行', type: 'event' },
  { date: '9月下旬', event: '书生国智科探挑战赛 颁奖', type: 'end' },
]

export default function StatsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* 头部 */}
      <div className="mb-10 text-center">
        <span className="seal text-lg px-4 py-2 mb-4 inline-block">数据</span>
        <h1 className="font-serif text-3xl font-bold text-ink-900 dark:text-ink-100 mb-3">
          2026 AI 赛事统计
        </h1>
        <p className="text-ink-500 dark:text-ink-600 max-w-xl mx-auto text-sm">
          截至 2026 年 7 月 21 日，当前收录 {competitions.length} 场可报名赛事，展示奖金池、截止时间与赛道分布。
        </p>
      </div>

      <div className="bamboo-divider mb-10" />

      {/* 概览卡片 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-10">
        {[
          { value: competitions.length, label: '收录赛事', icon: '奖' },
          { value: `${competitions.filter(c => c.status === '报名中').length}`, label: '可报名', icon: '报' },
          { value: `${prizeData.reduce((s, c) => s + c.prize, 0).toFixed(0)}万`, label: '总奖金池', icon: '金' },
          { value: '7月21日', label: '最近核验', icon: '校' },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <span className="seal text-xs px-1.5 py-0.5 mb-2 inline-block">{s.icon}</span>
            <div className="font-serif text-2xl font-bold text-vermilion">{s.value}</div>
            <div className="text-[11px] text-ink-500 dark:text-ink-600 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 奖金池对比 */}
      <section className="mb-12">
        <h2 className="font-serif text-xl font-bold text-ink-800 dark:text-ink-200 mb-6 flex items-center gap-2">
          <span className="seal text-xs px-2 py-0.5">金</span>
          奖金池对比（万元）
        </h2>
        <div className="space-y-3">
          {prizeData.map((c) => (
            <div key={c.name} className="flex items-center gap-3">
              <div className="w-36 sm:w-48 text-right text-xs text-ink-600 dark:text-ink-400 shrink-0 truncate">
                {c.name}
              </div>
              <div className="flex-1 relative h-7 rounded bg-ink-100/30 dark:bg-ink-800/30 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded transition-all duration-700 flex items-center"
                  style={{
                    width: `${(c.prize / maxPrize) * 100}%`,
                    background: `linear-gradient(90deg, ${c.color}cc, ${c.color})`,
                    minWidth: '48px'
                  }}
                >
                  <span className="px-2 text-[11px] font-medium text-white whitespace-nowrap">
                    {c.prize}{c.unit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="bamboo-divider mb-10" />

      {/* 状态分布 + 分类分布 */}
      <div className="grid gap-8 sm:grid-cols-2 mb-12">
        {/* 状态分布 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-ink-800 dark:text-ink-200 mb-6 flex items-center gap-2">
            <span className="seal text-xs px-2 py-0.5">态</span>
            状态分布
          </h2>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: statusColors[status] || '#8c7044' }}
                />
                <span className="text-sm text-ink-700 dark:text-ink-300 w-16">{status}</span>
                <div className="flex-1 h-5 rounded bg-ink-100/30 dark:bg-ink-800/30 overflow-hidden">
                  <div
                    className="h-full rounded flex items-center justify-end pr-2"
                    style={{
                      width: `${(count / competitions.length) * 100}%`,
                      background: statusColors[status] || '#8c7044',
                      minWidth: '28px'
                    }}
                  >
                    <span className="text-[10px] font-medium text-white">{count}</span>
                  </div>
                </div>
                <span className="text-[11px] text-ink-400 w-8 text-right">
                  {Math.round((count / competitions.length) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 分类分布 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-ink-800 dark:text-ink-200 mb-6 flex items-center gap-2">
            <span className="seal text-xs px-2 py-0.5">类</span>
            赛道分布
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => (
                <div
                  key={cat}
                  className="card px-3 py-2 flex items-center gap-2"
                >
                  <span className="font-medium text-sm text-ink-800 dark:text-ink-200">{cat}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-vermilion/10 text-vermilion font-medium">
                    {count}
                  </span>
                </div>
              ))}
          </div>
          <div className="mt-4 text-xs text-ink-400 dark:text-ink-600">
            赛道覆盖：综合 / 学术 / Agent / 公益 / 产业 AI / 智能感知 / 计算机视觉
          </div>
        </section>
      </div>

      <div className="bamboo-divider mb-10" />

      {/* 时间轴 */}
      <section className="mb-12">
        <h2 className="font-serif text-xl font-bold text-ink-800 dark:text-ink-200 mb-6 flex items-center gap-2">
          <span className="seal text-xs px-2 py-0.5">时</span>
          2026 赛事时间轴
        </h2>
        <div className="relative border-l-2 border-ink-200/30 pl-6 dark:border-ink-800/30 sm:pl-8">
          {timeline.map((t, i) => (
            <div key={i} className="relative mb-5 last:mb-0">
              <span
                className="absolute -left-[9px] top-1.5 h-3 w-3 rounded-full border-2 bg-rice dark:bg-ink-950"
                style={{
                  borderColor: t.type === 'start' ? '#2e8b57' : t.type === 'deadline' ? '#c53d43' : t.type === 'end' ? '#8c7044' : '#b8860b'
                }}
              />
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xs text-ink-400 dark:text-ink-600 w-16 shrink-0">{t.date}</span>
                <span className="text-sm text-ink-700 dark:text-ink-300">{t.event}</span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{
                    background: t.type === 'start' ? 'rgba(46,139,87,0.1)' : t.type === 'deadline' ? 'rgba(197,61,67,0.1)' : t.type === 'end' ? 'rgba(140,112,68,0.1)' : 'rgba(184,134,11,0.1)',
                    color: t.type === 'start' ? '#2e8b57' : t.type === 'deadline' ? '#c53d43' : t.type === 'end' ? '#8c7044' : '#b8860b'
                  }}
                >
                  {t.type === 'start' ? '开赛' : t.type === 'deadline' ? '截止' : t.type === 'end' ? '结束' : '活动'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="bamboo-divider mb-10" />

      {/* 赛事详情表 */}
      <section className="mb-12">
        <h2 className="font-serif text-xl font-bold text-ink-800 dark:text-ink-200 mb-6 flex items-center gap-2">
          <span className="seal text-xs px-2 py-0.5">表</span>
          全部赛事一览
        </h2>
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
              {competitions.map((c) => (
                <tr key={c.name} className="border-b border-ink-100/30 dark:border-ink-900/30">
                  <td className="py-2.5 pr-3 text-ink-800 dark:text-ink-200 font-medium">{c.name}</td>
                  <td className="py-2.5 pr-3 text-ink-500 dark:text-ink-600">{c.category}</td>
                  <td className="py-2.5 pr-3 text-right text-ink-600 dark:text-ink-400">
                    {c.prize > 0 ? `${c.prize}${c.unit}` : c.unit}
                  </td>
                  <td className="py-2.5 pr-3 text-center text-ink-500 dark:text-ink-600">{c.deadline}</td>
                  <td className="py-2.5 text-center">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: `${statusColors[c.status] || '#8c7044'}15`,
                        color: statusColors[c.status] || '#8c7044'
                      }}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="bamboo-divider mb-8" />

      {/* 底部 */}
      <div className="text-center">
        <p className="text-xs text-ink-400 dark:text-ink-600 mb-4">
          数据截至 2026 年 7 月 2 日，仅统计已收录赛事。奖金金额含税。
        </p>
        <Link href="/blog/ai-competitions-2026" className="text-sm text-vermilion hover:underline">
          查看完整赛事文章 →
        </Link>
      </div>
    </div>
  )
}
