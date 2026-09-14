import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/stats —— 全站墨迹统计（关于页看板用）
export async function GET() {
  try {
    const [articleAgg, commentCount, insightCount, categoryCounts, recentArticles] =
      await Promise.all([
        db.article.aggregate({
          where: { published: true },
          _count: { _all: true },
          _sum: { views: true, likes: true },
        }),
        db.comment.count(),
        db.insightRecord.count(),
        db.article.groupBy({
          by: ["category"],
          where: { published: true },
          _count: { _all: true },
          _sum: { views: true },
          orderBy: { _count: { category: "desc" } },
        }),
        db.article.findMany({
          where: { published: true },
          orderBy: { publishedAt: "desc" },
          take: 1,
          select: { title: true, publishedAt: true },
        }),
      ]);

    const articles = articleAgg._count._all;
    const views = articleAgg._sum.views ?? 0;
    const likes = articleAgg._sum.likes ?? 0;

    // 最热栏目（按总浏览量）
    const topByViews = [...categoryCounts].sort(
      (a, b) => (b._sum.views ?? 0) - (a._sum.views ?? 0)
    )[0];

    return NextResponse.json({
      ok: true,
      stats: {
        articles,
        views,
        likes,
        comments: commentCount,
        insights: insightCount,
        topCategory: topByViews?.category ?? null,
        latestArticle: recentArticles[0] ?? null,
      },
    });
  } catch (e) {
    console.error("[GET /api/stats]", e);
    return NextResponse.json({ ok: false, error: "统计获取失败" }, { status: 500 });
  }
}
