import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/sky/[id]/click —— 观天博客点击 +1（点击率排序依据）
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await db.blogSky.update({
      where: { id },
      data: { clicks: { increment: 1 } },
      select: { id: true, url: true, clicks: true },
    });
    return NextResponse.json({ ok: true, url: item.url, clicks: item.clicks });
  } catch (e) {
    console.error("[POST /api/sky/:id/click]", e);
    return NextResponse.json({ ok: false, error: "记录点击失败" }, { status: 500 });
  }
}
