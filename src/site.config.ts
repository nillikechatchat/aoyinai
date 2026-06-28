import type { CardListData, Config, IntegrationUserConfig, ThemeUserConfig } from 'astro-pure/types'

export const theme: ThemeUserConfig = {
  // [Basic]
  title: 'AI 探索者',
  author: 'AI 探索者',
  description: '一个聚焦人工智能的中文博客 — AI 教程、市场分析、高校专业、赛事活动、黑客松、云厂商优惠与 T-agent 项目。',
  favicon: '/favicon.svg',
  socialCard: '/images/avatar.svg',
  locale: {
    lang: 'zh-CN',
    attrs: 'zh_CN',
    dateLocale: 'zh-CN',
    dateOptions: {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
  },
  logo: {
    src: '/src/assets/avatar.svg',
    alt: 'AI 探索者'
  },

  titleDelimiter: '·',
  prerender: true,
  npmCDN: 'https://cdn.jsdelivr.net/npm',

  head: [],
  customCss: ['/custom.css'],

  header: {
    menu: [
      { title: '首页', link: '/' },
      { title: 'AI 教程', link: '/categories/tutorials' },
      { title: '市场分析', link: '/categories/market' },
      { title: '高校专业', link: '/categories/majors' },
      { title: '赛事活动', link: '/categories/events' },
      { title: '黑客松', link: '/categories/hackathons' },
      { title: '云厂商', link: '/categories/cloud-deals' },
      { title: 'T-agent', link: '/categories/t-agent' },
      { title: '关于', link: '/about' }
    ]
  },

  footer: {
    year: `© ${new Date().getFullYear()}`,
    links: [],
    credits: false,
    social: [
      { icon: 'github', label: 'GitHub', href: 'https://github.com/nillikechatchat/aoyinai' },
      { icon: 'rss', label: 'RSS', href: '/rss.xml' }
    ]
  },

  content: {
    externalLinks: { content: ' ↗', properties: { style: 'user-select:none' } },
    blogPageSize: 8,
    share: ['weibo', 'x']
  }
}

export const integ: IntegrationUserConfig = {
  links: { logbook: [], applyTip: [], cacheAvatar: false },
  pagefind: true,
  quote: {
    server: 'https://dummyjson.com/quotes/random',
    target: `(data) => (data.quote.length > 80 ? \`\${data.quote.slice(0, 80)}...\` : data.quote || 'Stay hungry, stay foolish.')`
  },
  typography: { class: 'prose text-base', blockquoteStyle: 'italic', inlineCodeBlockStyle: 'modern' },
  mediumZoom: { enable: true, selector: '.prose .zoomable', options: { className: 'zoomable' } },
  waline: { enable: false, server: '', showMeta: false, emoji: [], additionalConfigs: { imageUploader: false } }
}

export const terms: CardListData = {
  title: 'Terms content',
  list: []
}

const config = { ...theme, integ } as Config
export default config
