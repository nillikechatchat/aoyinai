import { getSortedPosts } from './posts'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aoyinai.vercel.app'
const SITE_TITLE = 'AI 探索者'
const SITE_DESCRIPTION =
  '一个聚焦人工智能的中文博客 — AI 教程、市场分析、高校专业、赛事活动、黑客松、云厂商优惠与 T-agent 项目。'

function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toRfc822(date: string): string {
  return new Date(date).toUTCString()
}

export function generateRssXml(): string {
  const posts = getSortedPosts()
  const buildDate = toRfc822(new Date().toISOString())

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.id}`
      const pubDate = toRfc822(post.date)
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${post.description}]]></description>
      ${post.categories.map((c) => `<category>${escapeXml(c)}</category>`).join('\n      ')}
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`
}