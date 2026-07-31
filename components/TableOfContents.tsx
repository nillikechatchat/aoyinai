import type { TableOfContentsItem } from '@/lib/toc'

interface TableOfContentsProps {
  items: TableOfContentsItem[]
}

export function TableOfContents({ items }: TableOfContentsProps) {
  if (!items.length) return null

  return (
    <nav aria-label="文章目录" className="border-l border-ink-900/10 pl-4">
      <p className="mb-3 text-[10px] font-medium tracking-[0.2em] text-vermilion">本页目录</p>
      <ol className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? 'pl-3' : ''}>
            <a
              href={`#${item.id}`}
              className="block text-xs leading-5 text-ink-500 transition-colors hover:text-vermilion"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
