import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/articles/[slug]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const article = await db.article.findUnique({ where: { slug } });
    if (!article) {
      return NextResponse.json({ ok: false, error: "文章不存在" }, { status: 404 });
    }
    // 浏览量 +1（不阻塞返回）
    db.article
      .update({ where: { slug }, data: { views: { increment: 1 } } })
      .catch(() => {});
    return NextResponse.json({ ok: true, article });
  } catch (e) {
    console.error("[GET /api/articles/:slug]", e);
    return NextResponse.json({ ok: false, error: "获取文章失败" }, { status: 500 });
  }
}
