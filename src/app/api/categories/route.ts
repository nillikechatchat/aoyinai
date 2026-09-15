import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/categories —— 栏目及文章计数 + 各栏目最新一文（栏目卡浮层预览用）
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { order: "asc" },
    });
    const [counts, recent] = await Promise.all([
      db.article.groupBy({
        by: ["category"],
        where: { published: true },
        _count: { _all: true },
      }),
      db.article.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 80,
        select: {
          category: true,
          slug: true,
          title: true,
          excerpt: true,
          publishedAt: true,
        },
      }),
    ]);

    const countMap = new Map(counts.map((c) => [c.category, c._count._all]));
    // 每个栏目取最近一篇（recent 已按时间倒序）
    const latestMap = new Map<string, (typeof recent)[number]>();
    for (const a of recent) {
      if (!latestMap.has(a.category)) latestMap.set(a.category, a);
    }

    return NextResponse.json({
      ok: true,
      categories: categories.map((c) => ({
        ...c,
        count: countMap.get(c.key) || 0,
        latest: latestMap.get(c.key) ?? null,
      })),
    });
  } catch (e) {
    console.error("[GET /api/categories]", e);
    return NextResponse.json({ ok: false, error: "获取栏目失败" }, { status: 500 });
  }
}
