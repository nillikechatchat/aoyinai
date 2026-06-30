'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Search as SearchIcon, X, Calendar, Clock } from 'lucide-react'
import { categoryMeta } from '@/lib/categories'
import { calculateReadingTime } from '@/lib/reading'
import type { Post } from '@/lib/posts'

function highlight(text: string, q: string) {
  if (!q) return text
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  )
}

export function SearchClient({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return posts
    return posts
      .map((p) => {
        const titleHit = p.title.toLowerCase().includes(q) ? 3 : 0
        const descHit = p.description.toLowerCase().includes(q) ? 2 : 0
        const tagHit = p.tags.some((t) => t.toLowerCase().includes(q)) ? 2 : 0
        const catHit = p.categories.some((c) => {
          const m = categoryMeta[c]
          return c.toLowerCase().includes(q) || (m?.label || '').toLowerCase().includes(q)
        })
          ? 1
          : 0
        const bodyHit = p.content.toLowerCase().includes(q) ? 1 : 0
        return { post: p, score: titleHit + descHit + tagHit + catHit + bodyHit }
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.post)
  }, [query, posts])

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-ink-900 dark:text-ink-100">
          搜索文章
        </h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-600">
          在 {posts.length} 篇文章中查找
        </p>
      </div>

      <div className="card mb-8 overflow-hidden p-1">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <SearchIcon className="size-4 text-ink-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索标题、描述、标签、正文…"
            autoFocus
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-400/60"
          />
          {query && (
            <button onClick={() => setQuery('')} className="rounded p-1 text-ink-400 hover:text-vermilion">
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {query && (
        <p className="mb-4 text-xs text-ink-500 dark:text-ink-600">
          找到 <span className="font-semibold text-vermilion">{results.length}</span> 篇
        </p>
      )}

      <div className="space-y-3">
        {results.map((post, i) => {
          const date = new Date(post.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
          const rt = calculateReadingTime(post.content)
          return (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="card group flex items-start gap-4 overflow-hidden p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px]">
                  {post.categories.map((c) => (
                    <span key={c} className="seal px-1.5 py-0 text-[10px]" style={{ borderColor: categoryMeta[c]?.color, color: categoryMeta[c]?.color }}>
                      {categoryMeta[c]?.seal || c}
                    </span>
                  ))}
                  <span className="text-ink-400 dark:text-ink-600">{date}</span>
                </div>
                <h3 className="mb-1 line-clamp-1 font-serif text-base font-bold group-hover:text-vermilion">
                  {highlight(post.title, query)}
                </h3>
                <p className="line-clamp-1 text-xs text-ink-500 dark:text-ink-500">
                  {highlight(post.description, query)}
                </p>
              </div>
            </Link>
          )
        })}

        {query && results.length === 0 && (
          <div className="rounded border border-dashed border-ink-200/30 p-12 text-center dark:border-ink-800/30">
            <SearchIcon className="mx-auto mb-3 size-10 text-ink-300 dark:text-ink-700" />
            <p className="text-sm text-ink-500 dark:text-ink-600">没有匹配文章</p>
          </div>
        )}
      </div>
    </div>
  )
}
