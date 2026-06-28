import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'content/blog')

export interface Post {
  id: string
  title: string
  description: string
  date: string
  updated?: string
  categories: string[]
  tags: string[]
  image?: string
  cover?: {
    image?: string
    alt?: string
  }
  draft: boolean
  content: string
  htmlContent?: string
}

export function getSortedPosts(): Post[] {
  const fileNames = fs.readdirSync(postsDirectory)
  const allPosts = fileNames
    .filter((name) => name.endsWith('.md'))
    .map((fileName) => {
      const id = fileName.replace(/\.md$/, '')
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      return {
        id,
        title: data.title || '',
        description: data.description || '',
        date: data.date || data.publishDate || new Date().toISOString(),
        updated: data.updated || data.updatedDate,
        categories: data.categories || [],
        tags: data.tags || [],
        image: data.image,
        cover: data.cover,
        draft: data.draft || false,
        content
      }
    })
    .filter((post) => !post.draft)
    .sort((a, b) => (new Date(b.date) as any) - (new Date(a.date) as any))

  return allPosts
}

export function getPostById(id: string): Post | null {
  const fullPath = path.join(postsDirectory, `${id}.md`)
  if (!fs.existsSync(fullPath)) return null

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    id,
    title: data.title || '',
    description: data.description || '',
    date: data.date || data.publishDate || new Date().toISOString(),
    updated: data.updated || data.updatedDate,
    categories: data.categories || [],
    tags: data.tags || [],
    image: data.image,
    cover: data.cover,
    draft: data.draft || false,
    content
  }
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(html).process(markdown)
  return result.toString()
}

export function getAllCategories(): string[] {
  const posts = getSortedPosts()
  const categories = new Set<string>()
  posts.forEach((post) => {
    post.categories.forEach((cat) => categories.add(cat))
  })
  return Array.from(categories)
}

export function getAllTags(): string[] {
  const posts = getSortedPosts()
  const tags = new Set<string>()
  posts.forEach((post) => {
    post.tags.forEach((tag) => tags.add(tag))
  })
  return Array.from(tags)
}

export function getPostsByCategory(category: string): Post[] {
  return getSortedPosts().filter((post) => post.categories.includes(category))
}

export function getPostsByTag(tag: string): Post[] {
  return getSortedPosts().filter((post) => post.tags.includes(tag))
}

export function getPostsByYear(): Record<string, Post[]> {
  const posts = getSortedPosts()
  const byYear: Record<string, Post[]> = {}
  posts.forEach((post) => {
    const year = new Date(post.date).getFullYear().toString()
    if (!byYear[year]) byYear[year] = []
    byYear[year].push(post)
  })
  return byYear
}
