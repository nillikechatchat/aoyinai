#!/usr/bin/env node
/**
 * 构建后钩子：生成 sitemap.xml 和 robots.txt 到 out/ 目录
 */
const fs = require('fs')
const path = require('path')

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sunzhizhi.cn'

function parseFrontmatter(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return null
  const front = match[1]
  const get = (key) => {
    const m = front.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : null
  }
  const getArray = (key) => {
    const inline = front.match(new RegExp(`^${key}:\\s*\\[([^\\]]*)\\]`, 'm'))
    if (inline) {
      return inline[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
    }
    const block = front.match(new RegExp(`^${key}:\\s*\\n((?:\\s*-[^\\n]*\\n?)+)`, 'm'))
    if (block) {
      return block[1].split('\n')
        .map(l => l.match(/^\s*-\s*(.+)/))
        .filter(Boolean)
        .map(m => m[1].trim().replace(/^["']|["']$/g, ''))
    }
    return []
  }

  return {
    title: get('title'),
    date: get('date'),
    updated: get('updated'),
    draft: get('draft') === 'true',
    tags: getArray('tags'),
    categories: getArray('categories')
  }
}

function generate() {
  const postsDir = path.join(process.cwd(), 'content', 'posts')
  if (!fs.existsSync(postsDir)) {
    console.log('[postbuild] no content/posts/ directory, skipping')
    return null
  }

  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))
  const posts = files
    .map(f => ({ id: f.replace(/\.md$/, ''), ...parseFrontmatter(path.join(postsDir, f)) }))
    .filter(p => p && !p.draft)

  const tagSet = new Set()
  const catSet = new Set()
  posts.forEach(p => {
    p.tags.forEach(t => tagSet.add(t))
    p.categories.forEach(c => catSet.add(c))
  })

  const now = new Date().toISOString()
  const urls = [
    { loc: '/', priority: '1.0', changefreq: 'weekly', lastmod: now },
    { loc: '/blog', priority: '0.9', changefreq: 'weekly', lastmod: now },
    { loc: '/roadmap', priority: '0.9', changefreq: 'monthly', lastmod: now },
    { loc: '/stats', priority: '0.8', changefreq: 'weekly', lastmod: now },
    { loc: '/community', priority: '0.8', changefreq: 'monthly', lastmod: now },
    { loc: '/archives', priority: '0.7', changefreq: 'monthly', lastmod: now },
    { loc: '/tags', priority: '0.6', changefreq: 'monthly', lastmod: now },
    { loc: '/about', priority: '0.5', changefreq: 'yearly', lastmod: now },
    ...Array.from(catSet).map(c => ({
      loc: `/categories/${c}`, priority: '0.8', changefreq: 'weekly', lastmod: now
    })),
    ...Array.from(tagSet).map(t => ({
      loc: `/tags/${encodeURIComponent(t)}`, priority: '0.6', changefreq: 'weekly', lastmod: now
    })),
    ...posts.map(p => ({
      loc: `/blog/${p.id}`, priority: '0.7', changefreq: 'monthly',
      lastmod: p.updated ? new Date(p.updated).toISOString() : new Date(p.date).toISOString()
    }))
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`

  const robots = `User-Agent: *
Allow: /
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`

  return { sitemap, robots }
}

const outDir = path.join(process.cwd(), 'out')
if (!fs.existsSync(outDir)) {
  console.log('[postbuild] no out/ directory, skipping')
  process.exit(0)
}

const result = generate()
if (result) {
  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), result.sitemap, 'utf8')
  fs.writeFileSync(path.join(outDir, 'robots.txt'), result.robots, 'utf8')
  console.log('[postbuild] wrote sitemap.xml + robots.txt')
}
