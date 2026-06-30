import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeStringify from 'rehype-stringify'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export interface Post {
  id: string
  title: string
  description: string
  date: string
  updated?: string
  categories: string[]
  tags: string[]
  image?: string
  cover?: { image?: string; alt?: string }
  draft: boolean
  content: string
}

export function getSortedPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) return []
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames
    .filter((name) => name.endsWith('.md'))
    .map((fileName) => {
      const id = fileName.replace(/\.md$/, '')
      const fullPath = path.join(postsDirectory, fileName)
      const { data, content } = matter(fs.readFileSync(fullPath, 'utf8'))
      return {
        id,
        title: data.title || '',
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        updated: data.updated,
        categories: data.categories || [],
        tags: data.tags || [],
        image: data.image,
        cover: data.cover,
        draft: data.draft || false,
        content
      }
    })
    .filter((post) => !post.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostById(id: string): Post | null {
  const fullPath = path.join(postsDirectory, `${id}.md`)
  if (!fs.existsSync(fullPath)) return null
  const { data, content } = matter(fs.readFileSync(fullPath, 'utf8'))
  return {
    id,
    title: data.title || '',
    description: data.description || '',
    date: data.date || new Date().toISOString(),
    updated: data.updated,
    categories: data.categories || [],
    tags: data.tags || [],
    image: data.image,
    cover: data.cover,
    draft: data.draft || false,
    content
  }
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypePrettyCode, {
      theme: 'github-dark-dimmed',
      keepBackground: false,
      defaultLang: 'plaintext'
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown)
  return result.toString()
}

export function getAllCategories(): string[] {
  const set = new Set<string>()
  getSortedPosts().forEach((p) => p.categories.forEach((c) => set.add(c)))
  return Array.from(set)
}

export function getAllTags(): string[] {
  const set = new Set<string>()
  getSortedPosts().forEach((p) => p.tags.forEach((t) => set.add(t)))
  return Array.from(set)
}

export function getPostsByCategory(category: string): Post[] {
  return getSortedPosts().filter((p) => p.categories.includes(category))
}

export function getPostsByTag(tag: string): Post[] {
  return getSortedPosts().filter((p) => p.tags.includes(tag))
}

export function getPostsByYear(): Record<string, Post[]> {
  const byYear: Record<string, Post[]> = {}
  getSortedPosts().forEach((p) => {
    const y = new Date(p.date).getFullYear().toString()
    if (!byYear[y]) byYear[y] = []
    byYear[y].push(p)
  })
  return byYear
}
