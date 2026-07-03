import type { MetadataRoute } from 'next'
import { getSortedPosts, getAllCategories, getAllTags } from '@/lib/posts'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sunzhizhi.cn'

export function generateSitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const posts = getSortedPosts()

  const statics: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/roadmap`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/stats`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/community`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/archives`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/tags`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 }
  ]

  const cats = getAllCategories().map((c) => ({
    url: `${SITE_URL}/categories/${c}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8
  }))

  const tags = getAllTags().map((t) => ({
    url: `${SITE_URL}/tags/${encodeURIComponent(t)}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.6
  }))

  const postRoutes = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.id}`,
    lastModified: p.updated ? new Date(p.updated) : new Date(p.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7
  }))

  return [...statics, ...cats, ...tags, ...postRoutes]
}
