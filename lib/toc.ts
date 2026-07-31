export interface TableOfContentsItem {
  id: string
  title: string
  level: 2 | 3
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^\w\u4e00-\u9fff-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section'
}

export function extractTableOfContents(markdown: string): TableOfContentsItem[] {
  const counts = new Map<string, number>()

  return markdown.split('\n').flatMap((line) => {
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!match) return []

    const title = match[2].replace(/\[(.*?)\]\([^)]*\)/g, '$1')
    const baseId = slugify(title)
    const occurrence = counts.get(baseId) ?? 0
    counts.set(baseId, occurrence + 1)

    return [{
      id: occurrence ? `${baseId}-${occurrence + 1}` : baseId,
      title,
      level: match[1].length as 2 | 3,
    }]
  })
}
