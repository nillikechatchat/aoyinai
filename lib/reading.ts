const WORDS_PER_MINUTE_CN = 350

export function calculateReadingTime(content: string): number {
  const plain = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[#>*_~`-]+/g, '')
    .trim()

  const cn = (plain.match(/[\u4e00-\u9fa5]/g) || []).length
  const en = (plain.match(/[a-zA-Z]+/g) || []).length
  return Math.max(1, Math.ceil(cn / WORDS_PER_MINUTE_CN + en / 200))
}
