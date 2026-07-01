import { getSortedPosts } from './posts'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aoyinai.vercel.app'

function escapeXml(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;')
}

export function generateRssXml(): string {
  const posts = getSortedPosts()
  const buildDate = new Date().toUTCString()
  const items = posts.map((p) => {
    const url = `${SITE_URL}/blog/${p.id}`
    return `  <item>
    <title>${escapeXml(p.title)}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    <description><![CDATA[${p.description}]]></description>
    ${p.categories.map((c) => `<category>${escapeXml(c)}</category>`).join('\n    ')}
  </item>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>鸿渐</title>
  <link>${SITE_URL}</link>
  <description>聚焦人工智能的中文博客</description>
  <language>zh-CN</language>
  <lastBuildDate>${buildDate}</lastBuildDate>
  <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`
}
