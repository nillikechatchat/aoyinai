import Link from 'next/link'
import { Tag } from 'lucide-react'
import { getAllTags, getPostsByTag } from '@/lib/posts'

export default function TagsPage() {
  const tags = getAllTags()

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">首页</Link>
        <span>/</span>
        <span className="text-foreground">标签</span>
      </nav>

      <header className="mb-12">
        <h1 className="ai-gradient-text mb-4 text-4xl font-bold">标签</h1>
        <p className="text-muted-foreground">共 {tags.length} 个标签</p>
      </header>

      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => {
          const count = getPostsByTag(tag).length
          return (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition-all hover:scale-105 hover:border-primary/50 hover:bg-primary/5"
            >
              <Tag className="size-4" />
              <span className="font-medium">{tag}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {count}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
