import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/stats —— 全站墨迹统计（关于页看板用）
export async function GET() {
  try {
    const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const [articleAgg, commentCount, insightCount, categoryCounts, recentArticles, recentComments, recentInsights] =
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
        db.comment.findMany({
          where: { createdAt: { gte: since } },
          select: { createdAt: true },
        }),
        db.insightRecord.findMany({
          where: { createdAt: { gte: since } },
          select: { createdAt: true },
        }),
      ]);

    const articles = articleAgg._count._all;
    const views = articleAgg._sum.views ?? 0;
    const likes = articleAgg._sum.likes ?? 0;

    // 最热栏目（按总浏览量）
    const topByViews = [...categoryCounts].sort(
      (a, b) => (b._sum.views ?? 0) - (a._sum.views ?? 0)
    )[0];

    // 七日趋势：按访客无关的服务器日期聚合（近 7 天，含今日）
    const dayKey = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
    const days: Array<{ date: string; insights: number; comments: number }> = [];
    const insightByDay = new Map<string, number>();
    const commentByDay = new Map<string, number>();
    for (const r of recentInsights) {
      const k = dayKey(new Date(r.createdAt));
      insightByDay.set(k, (insightByDay.get(k) ?? 0) + 1);
    }
    for (const c of recentComments) {
      const k = dayKey(new Date(c.createdAt));
      commentByDay.set(k, (commentByDay.get(k) ?? 0) + 1);
    }
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 3600 * 1000);
      const k = dayKey(d);
      days.push({
        date: k,
        insights: insightByDay.get(k) ?? 0,
        comments: commentByDay.get(k) ?? 0,
      });
    }

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
        daily: days,
      },
    });
  } catch (e) {
    console.error("[GET /api/stats]", e);
    return NextResponse.json({ ok: false, error: "统计获取失败" }, { status: 500 });
  }
}
