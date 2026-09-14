import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/articles/[slug]/like —— 点赞（+1）
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const article = await db.article.update({
      where: { slug },
      data: { likes: { increment: 1 } },
      select: { slug: true, likes: true },
    });
    return NextResponse.json({ ok: true, likes: article.likes });
  } catch (e) {
    console.error("[POST /api/articles/:slug/like]", e);
    return NextResponse.json({ ok: false, error: "点赞失败" }, { status: 500 });
  }
}
