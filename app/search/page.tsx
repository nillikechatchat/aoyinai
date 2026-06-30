import { getSortedPosts } from '@/lib/posts'
import { SearchClient } from '@/components/SearchClient'

export const metadata = { title: '搜索' }

export default function SearchPage() {
  return <SearchClient posts={getSortedPosts()} />
}
