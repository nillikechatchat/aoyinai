#!/usr/bin/env node
/**
 * 构建后钩子：生成 sitemap.xml 和 robots.txt 到 out/ 目录
 */
const fs = require('fs')
const path = require('path')

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aoyinai.vercel.app'

function generateSitemapXml() {
  const postsDir = path.join(process.cwd(), 'content', 'blog')
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'))

  const posts = files
    .map((file) => {
      const id = file.replace(/\.md$/, '')
      const raw = fs.readFileSync(path.join(postsDir, file), 'utf8')
      const match = raw.match(/^---\n([\s\S]*?)\n---/)
      const front = match ? match[1] : ''
      const dateMatch = front.match(/^date:\s*(.+)$/m)
      const updatedMatch = front.match(/^updated:\s*(.+)$/m)
      const draftMatch = front.match(/^draft:\s*(true|false)$/m)
      const date = dateMatch ? new Date(dateMatch[1]).toISOString() : new Date().toISOString()
      const updated = updatedMatch ? new Date(updatedMatch[1]).toISOString() : date
      const draft = draftMatch ? draftMatch[1] === 'true' : false
      return { id, date, updated, draft }
    })
    .filter((p) => !p.draft)

  const tagSet = new Set()
  const catSet = new Set()
  files.forEach((file) => {
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf8')
    const match = raw.match(/^---\n([\s\S]*?)\n---/)
    if (!match) return
    const front = match[1]

    const inlineArray = (key) => {
      const re = new RegExp(`^${key}:\\s*\\[([^\\]]*)\\]`, 'm')
      const m = front.match(re)
      if (m) {
        return m[1]
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean)
      }
      const blockRe = new RegExp(`^${key}:\\s*\\n((?:\\s*-[^\\n]*\\n?)+)`, 'm')
      const bm = front.match(blockRe)
      if (bm) {
        return bm[1]
          .split('\n')
          .map((l) => l.match(/^\s*-\s*(.+)/))
          .filter(Boolean)
          .map((mm) => mm[1].trim().replace(/^["']|["']$/g, ''))
      }
      return []
    }

    inlineArray('tags').forEach((t) => tagSet.add(t))
    inlineArray('categories').forEach((c) => catSet.add(c))
  })

  const now = new Date().toISOString()
  const staticUrls = [
    { loc: '/', priority: '1.0', changefreq: 'weekly', lastmod: now },
    { loc: '/blog', priority: '0.9', changefreq: 'weekly', lastmod: now },
    { loc: '/archives', priority: '0.7', changefreq: 'monthly', lastmod: now },
    { loc: '/tags', priority: '0.6', changefreq: 'monthly', lastmod: now },
    { loc: '/about', priority: '0.5', changefreq: 'yearly', lastmod: now }
  ]
  const categoryUrls = Array.from(catSet).map((c) => ({
    loc: `/categories/${c}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: now
  }))
  const tagUrls = Array.from(tagSet).map((t) => ({
    loc: `/tags/${encodeURIComponent(t)}`,
    priority: '0.6',
    changefreq: 'weekly',
    lastmod: now
  }))
  const postUrls = posts.map((p) => ({
    loc: `/blog/${p.id}`,
    priority: '0.7',
    changefreq: 'monthly',
    lastmod: p.updated
  }))

  const all = [...staticUrls, ...categoryUrls, ...tagUrls, ...postUrls]
  const urls = all
    .map(
      (u) => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

function generateRobotsTxt() {
  return `User-Agent: *
Allow: /
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`
}

const outDir = path.join(process.cwd(), 'out')
if (!fs.existsSync(outDir)) {
  console.log('[postbuild] no out/ directory, skipping')
  process.exit(0)
}

const sitemapPath = path.join(outDir, 'sitemap.xml')
const robotsPath = path.join(outDir, 'robots.txt')

const sitemap = generateSitemapXml()
const robots = generateRobotsTxt()

fs.writeFileSync(sitemapPath, sitemap, 'utf8')
fs.writeFileSync(robotsPath, robots, 'utf8')

console.log(`[postbuild] wrote ${sitemapPath}`)
console.log(`[postbuild] wrote ${robotsPath}`)