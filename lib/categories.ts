export const categoryMeta: Record<
  string,
  { label: string; desc: string; color: string; seal: string }
> = {
  tutorials:    { label: 'AI 教程',   desc: 'LLM 入门到 RAG、Agent 实战',         color: '#c53d43', seal: '教程' },
  market:       { label: '市场分析',  desc: '大模型厂商格局、价格趋势',           color: '#b8860b', seal: '市场' },
  majors:       { label: '高校专业',  desc: 'AI 强校课程、师资与就业',             color: '#2e8b57', seal: '高校' },
  events:       { label: '赛事活动',  desc: 'Kaggle、NeurIPS 等顶赛清单',         color: '#c53d43', seal: '赛事' },
  hackathons:   { label: '黑客松',    desc: '高质量 AI 黑客松实时推荐',           color: '#b8860b', seal: '黑客' },
  'cloud-deals': { label: '云厂商优惠', desc: '阿里云、腾讯云、华为云 API 优惠',   color: '#2e8b57', seal: '云惠' },
  't-agent':    { label: 'T-agent',   desc: '多智能体协作框架',                   color: '#c53d43', seal: '智能' }
}
