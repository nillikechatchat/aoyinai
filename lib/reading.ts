const WORDS_PER_MINUTE_CN = 350

export function calculateReadingTime(content: string): number {
  const plain = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[#>*_~`-]+/g, '')
    .trim()

  const chineseChars = (plain.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishWords = (plain.match(/[a-zA-Z]+/g) || []).length
  const minutes = chineseChars / WORDS_PER_MINUTE_CN + englishWords / 200
  return Math.max(1, Math.ceil(minutes))
}