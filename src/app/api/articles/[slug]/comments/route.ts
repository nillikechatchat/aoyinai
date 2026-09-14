import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/articles/[slug]/comments —— 笔谈列表（最新在前）
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const comments = await db.comment.findMany({
      where: { articleSlug: slug },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ ok: true, comments });
  } catch (e) {
    console.error("[GET /api/articles/:slug/comments]", e);
    return NextResponse.json({ ok: false, comments: [], error: "加载笔谈失败" }, { status: 500 });
  }
}

// POST /api/articles/[slug]/comments —— 落笔留言（匿名，可复他人之言）
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const payload = await req.json().catch(() => ({}));
    const text = String(payload?.body ?? "").trim();
    let author = String(payload?.author ?? "").trim();
    const parentId = String(payload?.parentId ?? "").trim();

    if (!text) {
      return NextResponse.json({ ok: false, error: "留言不可为空" }, { status: 400 });
    }
    if (text.length > 500) {
      return NextResponse.json({ ok: false, error: "留言以五百字为限" }, { status: 400 });
    }
    if (!author) author = "无名氏";
    if (author.length > 12) author = author.slice(0, 12);

    // 回复校验：父留言须存在且同属此文
    let parent: { id: string; author: string } | null = null;
    if (parentId) {
      const found = await db.comment.findUnique({
        where: { id: parentId },
        select: { id: true, author: true, articleSlug: true },
      });
      if (!found || found.articleSlug !== slug) {
        return NextResponse.json({ ok: false, error: "所复之言已不在纸上" }, { status: 400 });
      }
      parent = { id: found.id, author: found.author };
    }

    // 简易防刷：同一文章同作者同内容 60 秒内只收一条
    const recent = await db.comment.findFirst({
      where: {
        articleSlug: slug,
        author,
        body: text,
        createdAt: { gte: new Date(Date.now() - 60_000) },
      },
      select: { id: true },
    });
    if (recent) {
      return NextResponse.json({ ok: false, error: "此言方才已录，无须重笔" }, { status: 429 });
    }

    const comment = await db.comment.create({
      data: {
        articleSlug: slug,
        author,
        body: text,
        parentId: parent?.id ?? null,
        replyToAuthor: parent?.author ?? null,
      },
    });
    return NextResponse.json({ ok: true, comment });
  } catch (e) {
    console.error("[POST /api/articles/:slug/comments]", e);
    return NextResponse.json({ ok: false, error: "落笔失败" }, { status: 500 });
  }
}
