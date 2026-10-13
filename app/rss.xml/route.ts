import { generateRssXml } from '@/lib/rss'

export const dynamic = 'force-static'

export async function GET() {
  return new Response(generateRssXml(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}
