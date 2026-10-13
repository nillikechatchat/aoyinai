#!/usr/bin/env node
/** 构建后生成 sitemap.xml 和 robots.txt，使用与正文相同的 YAML 解析器。 */
const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sunzhizhi.cn').replace(/\/$/, '')
function escapeXml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}
function generate() {
  const postsDir = path.join(process.cwd(), 'content', 'posts')
  const posts = fs.readdirSync(postsDir).filter(f => f.endsWith('.md')).map(file => {
    const { data } = matter(fs.readFileSync(path.join(postsDir, file), 'utf8'))
    return { ...data, id: file.replace(/\.md$/, ''), tags: data.tags || [], categories: data.categories || [] }
  }).filter(post => !post.draft)
  const tags = new Set(posts.flatMap(post => post.tags))
  const categories = new Set(posts.flatMap(post => post.categories))
  const now = new Date().toISOString()
  const urls = [
    ...['/', '/blog', '/explore', '/roadmap', '/stats', '/community', '/bookmarks', '/archives', '/tags', '/about'].map(loc => ({ loc, lastmod: now })),
    ...Array.from(categories, category => ({ loc: `/categories/${encodeURIComponent(category)}`, lastmod: now })),
    ...Array.from(tags, tag => ({ loc: `/tags/${encodeURIComponent(tag)}`, lastmod: now })),
    ...posts.map(post => ({ loc: `/blog/${encodeURIComponent(post.id)}`, lastmod: new Date(post.updated || post.date || now).toISOString() }))
  ]
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url><loc>${escapeXml(SITE_URL + url.loc)}</loc><lastmod>${url.lastmod}</lastmod></url>`).join('\n')}
</urlset>\n`
  const robots = `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
  return { sitemap, robots, count: urls.length }
}
const outDir = path.join(process.cwd(), 'out')
if (!fs.existsSync(outDir)) throw new Error('缺少 out/，请先运行 next build')
const result = generate()
fs.writeFileSync(path.join(outDir, 'sitemap.xml'), result.sitemap, 'utf8')
fs.writeFileSync(path.join(outDir, 'robots.txt'), result.robots, 'utf8')
console.log(`[postbuild] wrote sitemap.xml (${result.count} URLs) + robots.txt`)
