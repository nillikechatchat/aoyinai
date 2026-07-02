export const categoryMeta: Record<
  string,
  { label: string; desc: string; color: string; seal: string }
> = {
  tutorials:    { label: 'AI 入门实战', desc: '从零基础到大模型、RAG、Agent 开发全流程', color: '#c53d43', seal: '实战' },
  market:       { label: '行业动态',   desc: '大模型厂商竞争格局、投融资与价格趋势',     color: '#b8860b', seal: '动态' },
  majors:       { label: '升学就业',   desc: 'AI 强校专业选择、课程师资与求职路径',      color: '#2e8b57', seal: '升学' },
  events:       { label: '竞赛活动',   desc: 'Kaggle、顶会赛题、算法大赛报名与攻略',     color: '#c53d43', seal: '竞赛' },
  hackathons:   { label: '黑客松',     desc: 'AI 黑客松最新资讯与获奖经验分享',          color: '#b8860b', seal: '黑客' },
  'cloud-deals': { label: '算力优惠',  desc: 'GPU 云服务器、大模型 API 免费额度汇总',   color: '#2e8b57', seal: '算力' },
  't-agent':    { label: 'T-agent',    desc: '多智能体协作框架教程与落地案例',            color: '#c53d43', seal: '智能' }
}
