import { NextResponse } from "next/server";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import path from "path";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** TTS 缓存概况：命中率计数（.tts-cache/stats.json）+ 缓存文件数与体积 */
function ttsCacheStats() {
  try {
    const dir = path.join(process.cwd(), ".tts-cache");
    let hits = 0;
    let misses = 0;
    const statsFile = path.join(dir, "stats.json");
    if (existsSync(statsFile)) {
      try {
        const parsed = JSON.parse(readFileSync(statsFile, "utf-8")) as Partial<{
          hits: number;
          misses: number;
        }>;
        hits = Number(parsed.hits) || 0;
        misses = Number(parsed.misses) || 0;
      } catch {
        // ignore
      }
    }
    let files = 0;
    let bytes = 0;
    if (existsSync(dir)) {
      for (const f of readdirSync(dir)) {
        if (!f.endsWith(".wav")) continue;
        try {
          bytes += statSync(path.join(dir, f)).size;
          files += 1;
        } catch {
          // ignore
        }
      }
    }
    const total = hits + misses;
    return {
      hits,
      misses,
      hitRate: total > 0 ? Math.round((hits / total) * 100) : null,
      files,
      bytes,
    };
  } catch {
    return { hits: 0, misses: 0, hitRate: null, files: 0, bytes: 0 };
  }
}

// GET /api/stats —— 全站墨迹统计（关于页看板用）：总量 + 近 30 日趋势 + 栏目分布 + TTS 缓存
export async function GET() {
  try {
    const since30 = new Date(Date.now() - 30 * 24 * 3600 * 1000);
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
          where: { createdAt: { gte: since30 } },
          select: { createdAt: true },
        }),
        db.insightRecord.findMany({
          where: { createdAt: { gte: since30 } },
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

    // 近 30 日趋势：按服务器日期聚合（含今日）
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
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 3600 * 1000);
      const k = dayKey(d);
      days.push({
        date: k,
        insights: insightByDay.get(k) ?? 0,
        comments: commentByDay.get(k) ?? 0,
      });
    }

    // 栏目分布：篇数 + 浏览量（环形图用）
    const categoryDist = categoryCounts.map((c) => ({
      category: c.category,
      count: c._count._all,
      views: c._sum.views ?? 0,
    }));

    const tts = ttsCacheStats();

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
        categoryDist,
        tts,
      },
    });
  } catch (e) {
    console.error("[GET /api/stats]", e);
    return NextResponse.json({ ok: false, error: "统计获取失败" }, { status: 500 });
  }
}
