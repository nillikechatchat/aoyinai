export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  cover: string;
  readMinutes: number;
  views: number;
  likes: number;
  /** AI 一句话速览（先生撰，懒生成 + 入库；卡片 hover 可展示） */
  tldr?: string;
  published: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  key: string;
  name: string;
  en: string;
  description: string;
  seal: string;
  order: number;
  count?: number;
  /** 该栏目最近一文（栏目卡 hover 预览用） */
  latest?: {
    slug: string;
    title: string;
    excerpt: string;
    publishedAt: string;
  } | null;
}

export interface Insight {
  name: string;
  oracle: string;
  interpret: string;
  advice: string;
}

/** 客户端栏目兜底信息（接口异常时也可渲染） */
export const CATEGORY_META: Record<
  string,
  { name: string; en: string; seal: string; description: string; cover: string }
> = {
  tutorials: {
    name: "AI 教程",
    en: "Tutorials",
    seal: "教",
    description: "LLM 入门、RAG、Agent 实战，从入门到进阶的完整路径。",
    cover: "/images/cover-tutorials.png",
  },
  market: {
    name: "市场分析",
    en: "Market",
    seal: "市",
    description: "大模型厂商竞争格局、价格趋势与行业风向研判。",
    cover: "/images/cover-market.png",
  },
  majors: {
    name: "高校专业",
    en: "Majors",
    seal: "校",
    description: "国内 AI 强校课程设置、实验室方向与就业去向。",
    cover: "/images/cover-majors.png",
  },
  events: {
    name: "赛事活动",
    en: "Events",
    seal: "赛",
    description: "Kaggle、NeurIPS 等顶赛清单与参赛攻略。",
    cover: "/images/cover-events.png",
  },
  hackathons: {
    name: "黑客松",
    en: "Hackathons",
    seal: "客",
    description: "高质量 AI 黑客松实时推荐与组队情报。",
    cover: "/images/cover-hackathons.png",
  },
  "cloud-deals": {
    name: "云厂商优惠",
    en: "Cloud Deals",
    seal: "云",
    description: "阿里云、腾讯云、华为云、火山引擎大模型 API 优惠汇总。",
    cover: "/images/cover-cloud.png",
  },
  "t-agent": {
    name: "T-agent",
    en: "T-agent",
    seal: "智",
    description: "正在打磨的多智能体协作框架：设计笔记与工程实录。",
    cover: "/images/cover-tagent.png",
  },
};

export const CATEGORY_KEYS = Object.keys(CATEGORY_META);

/** 中文数字编号 */
export const CN_NUM = ["壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖", "拾"];

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}
