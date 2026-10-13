import StatsPageContent from '@/components/StatsPageContent'
import { siteConfig } from '@/lib/site'

export const metadata = {
  title: '赛事统计',
  description: '2026 年 AI 赛事数据可视化：奖金池对比、时间轴、状态分布、参与趋势。',
  alternates: { canonical: `${siteConfig.url}/stats` }
}

export default function StatsPage() {
  return <StatsPageContent />
}
