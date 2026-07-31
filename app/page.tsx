import { HomePageClient } from '@/components/HomePageClient'
import { getSortedPosts, getAllTags } from '@/lib/posts'
import { categoryMeta } from '@/lib/categories'

export default function HomePage() {
  const posts = getSortedPosts()
  const categories = Object.keys(categoryMeta)
  const tagCount = getAllTags().length

  return <HomePageClient posts={posts} categories={categories} tagCount={tagCount} />
}
