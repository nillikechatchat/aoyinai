import fs from 'fs'
import path from 'path'
import { getSortedPosts, getAllCategories, getAllTags } from './posts'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aoyinai.vercel.app'

export function generateSitemapXml(): string {
  const now = new Date().toISOString()
  const posts = getSortedPosts()
  const tags = getAllTags()

  const staticUrls = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/blog', priority: '0.9', changefreq: 'weekly' },
    { loc: '/archives', priority: '0.7', changefreq: 'monthly' },
    { loc: '/tags', priority: '0.6', changefreq: 'monthly' },
    { loc: '/about', priority: '0.5', changefreq: 'yearly' }
  ]

  const categoryUrls = getAllCategories().map((cat) => ({
    loc: `/categories/${cat}`,
    priority: '0.8',
    changefreq: 'weekly'
  }))

  const tagUrls = tags.map((tag) => ({
    loc: `/tags/${encodeURIComponent(tag)}`,
    priority: '0.6',
    changefreq: 'weekly'
  }))

  const postUrls = posts.map((post) => {
    const lastmod = post.updated ? new Date(post.updated).toISOString() : new Date(post.date).toISOString()
    return {
      loc: `/blog/${post.id}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod
    }
  })

  const all = [...staticUrls, ...categoryUrls, ...tagUrls, ...postUrls]

  const urls = all
    .map((u) => {
      const lastmodTag = 'lastmod' in u ? `    <lastmod>${u.lastmod}</lastmod>\n` : `    <lastmod>${now}</lastmod>\n`
      return `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
${lastmodTag}    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

export function writeSitemapIfChanged(outDir: string): void {
  const xml = generateSitemapXml()
  const target = path.join(outDir, 'sitemap.xml')
  if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== xml) {
    fs.writeFileSync(target, xml, 'utf8')
  }
}

export function generateRobotsTxt(): string {
  return `User-Agent: *
Allow: /
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`
}