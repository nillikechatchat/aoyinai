import { getSortedPosts } from '@/lib/posts'
import { SearchClient } from '@/components/SearchClient'

export const metadata = {
  title: '搜索 — AI 探索者'
}

export default function SearchPage() {
  const posts = getSortedPosts()
  return <SearchClient posts={posts} />
}