'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import { categoryMeta } from '@/lib/categories'
import type { Post } from '@/lib/posts'

interface SearchClientProps {
  posts: Post[]
}

function highlight(text: string, query: string) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-primary/20 px-0.5 text-primary">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export function SearchClient({ posts }: SearchClientProps) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return posts

    return posts
      .map((post) => {
        const titleHit = post.title.toLowerCase().includes(q) ? 3 : 0
        const descHit = post.description.toLowerCase().includes(q) ? 2 : 0
        const tagHit = post.tags.some((t) => t.toLowerCase().includes(q)) ? 2 : 0
        const catHit = post.categories.some((c) => {
          const meta = categoryMeta[c]
          return c.toLowerCase().includes(q) || (meta?.label || '').toLowerCase().includes(q)
        })
          ? 1
          : 0
        const bodyHit = post.content.toLowerCase().includes(q) ? 1 : 0
        const score = titleHit + descHit + tagHit + catHit + bodyHit
        return { post, score }
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.post)
  }, [query, posts])

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
          <span className="ai-gradient-text">搜索文章</span>
        </h1>
        <p className="text-muted-foreground">在 {posts.length} 篇文章中查找你感兴趣的内容</p>
      </div>

      <div className="card-hover relative mb-8 rounded-2xl border border-border bg-card p-1">
        <div className="flex items-center gap-3 px-4 py-3">
          <SearchIcon className="size-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索标题、描述、标签、分类或正文…"
            autoFocus
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {query && (
        <p className="mb-4 text-sm text-muted-foreground">
          找到 <span className="font-semibold text-primary">{results.length}</span> 篇匹配文章
        </p>
      )}

      <div className="space-y-4">
        {results.map((post) => {
          const coverImage = post.cover?.image || post.image
          const date = new Date(post.date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
          return (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="card-hover group flex gap-4 overflow-hidden rounded-xl border border-border bg-card p-4"
            >
              {coverImage && (
                <div className="relative hidden h-24 w-32 shrink-0 overflow-hidden rounded-lg sm:block">
                  <Image
                    src={coverImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                  {post.categories.map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary"
                    >
                      {categoryMeta[c]?.label || c}
                    </span>
                  ))}
                  <span className="text-muted-foreground">{date}</span>
                </div>
                <h3 className="mb-1 line-clamp-1 text-lg font-semibold group-hover:text-primary">
                  {highlight(post.title, query)}
                </h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {highlight(post.description, query)}
                </p>
                {post.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="text-xs text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          )
        })}

        {query && results.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <SearchIcon className="mx-auto mb-4 size-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">没有匹配的文章，换个关键词试试</p>
          </div>
        )}
      </div>
    </div>
  )
}