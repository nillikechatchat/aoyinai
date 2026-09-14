import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/articles?category=&search=&limit=&random=&exclude=&sort=top
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
    const random = searchParams.get("random") === "1";
    const sortTop = searchParams.get("sort") === "top";
    const exclude = searchParams.get("exclude") || undefined;

    const where: Record<string, unknown> = { published: true };
    if (category && category !== "all") where.category = category;
    if (exclude) where.slug = { notIn: exclude.split(",").filter(Boolean) };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    const total = await db.article.count({ where });

    let articles = await db.article.findMany({
      where,
      orderBy: sortTop
        ? [{ views: "desc" }, { likes: "desc" }]
        : random
          ? undefined
          : { publishedAt: "desc" },
      take: limit,
    });

    if (random) {
      // 洗牌
      articles = articles.sort(() => Math.random() - 0.5);
    }

    return NextResponse.json({ ok: true, total, articles });
  } catch (e) {
    console.error("[GET /api/articles]", e);
    return NextResponse.json({ ok: false, error: "获取文章失败" }, { status: 500 });
  }
}
