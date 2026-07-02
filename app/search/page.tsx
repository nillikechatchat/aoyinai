import { getSortedPosts } from '@/lib/posts'
import { SearchClient } from '@/components/SearchClient'
import { siteConfig } from '@/lib/site'

export const metadata = {
  title: '搜索',
  alternates: { canonical: `${siteConfig.url}/search` }
}

export default function SearchPage() {
  return <SearchClient posts={getSortedPosts()} />
}
