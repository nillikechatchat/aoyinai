import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/articles/[slug]/comments/[id]/react —— 「有同感」印可此言（计数 +1）
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params;
    const found = await db.comment.findUnique({
      where: { id },
      select: { id: true, articleSlug: true, reactions: true },
    });
    if (!found || found.articleSlug !== slug) {
      return NextResponse.json({ ok: false, error: "此言已不在纸上" }, { status: 404 });
    }
    const comment = await db.comment.update({
      where: { id },
      data: { reactions: { increment: 1 } },
      select: { id: true, reactions: true },
    });
    return NextResponse.json({ ok: true, reactions: comment.reactions });
  } catch (e) {
    console.error("[POST /api/articles/:slug/comments/:id/react]", e);
    return NextResponse.json({ ok: false, error: "印可失败" }, { status: 500 });
  }
}
