import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// GET /rss.xml —— RSS 2.0 订阅源（对齐原站功能）
export async function GET() {
  try {
    const articles = await db.article.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 20,
      select: { slug: true, title: true, excerpt: true, publishedAt: true, category: true },
    });

    const items = articles
      .map((a) => {
        return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>https://aoyinai.com/?article=${a.slug}</link>
      <guid isPermaLink="false">aoyinai-${a.slug}</guid>
      <description>${escapeXml(a.excerpt)}</description>
      <category>${escapeXml(a.category)}</category>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
    </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>敖胤AI · 观智能之潮，守问学之心</title>
    <link>https://aoyinai.com</link>
    <description>聚焦人工智能的中文博客：AI 教程、市场分析、高校专业、赛事活动、黑客松、云厂商优惠与 T-agent。</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://aoyinai.com/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=600",
      },
    });
  } catch (e) {
    console.error("[GET /rss.xml]", e);
    return new Response("RSS 生成失败", { status: 500 });
  }
}
