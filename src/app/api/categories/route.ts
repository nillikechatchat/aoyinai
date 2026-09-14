import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/categories —— 栏目及文章计数
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { order: "asc" },
    });
    const counts = await db.article.groupBy({
      by: ["category"],
      where: { published: true },
      _count: { _all: true },
    });
    const countMap = new Map(counts.map((c) => [c.category, c._count._all]));
    return NextResponse.json({
      ok: true,
      categories: categories.map((c) => ({
        ...c,
        count: countMap.get(c.key) || 0,
      })),
    });
  } catch (e) {
    console.error("[GET /api/categories]", e);
    return NextResponse.json({ ok: false, error: "获取栏目失败" }, { status: 500 });
  }
}
