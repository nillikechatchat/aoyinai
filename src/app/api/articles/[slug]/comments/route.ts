import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// 简易敏感词表：命中即以「※」掩去（保持留言可用，又不失雅观）
const SENSITIVE_WORDS = [
  "赌博", "博彩", "诈骗", "色情", "裸聊", "代开发票", "办证",
  "加微信赚钱", "刷单", "兼职日结", "网贷", "高利贷", "反动",
  "法轮", "枪支", "毒品", "代考", "外挂", "私服",
];

/** 将留言中的敏感词掩为「※」，返回（净化后文本, 命中数） */
function maskSensitive(text: string): [string, number] {
  let hits = 0;
  let out = text;
  for (const w of SENSITIVE_WORDS) {
    while (out.includes(w)) {
      out = out.replace(w, "※".repeat(w.length));
      hits += 1;
    }
  }
  return [out, hits];
}

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

    // 敏感词净化：命中掩为「※」；命中过多（≥3 处）婉拒
    const [masked, hits] = maskSensitive(text);
    if (hits >= 3) {
      return NextResponse.json(
        { ok: false, error: "笔谈清雅之地，还望另择言辞" },
        { status: 422 }
      );
    }
    const finalText = masked;

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
        body: finalText,
        createdAt: { gte: new Date(Date.now() - 60_000) },
      },
      select: { id: true },
    });
    if (recent) {
      return NextResponse.json({ ok: false, error: "此言方才已录，无须重笔" }, { status: 429 });
    }

    // 频率限制：同一作者同一文章 60 秒内至多 3 条（含复言），防连发刷屏
    const recentCount = await db.comment.count({
      where: {
        articleSlug: slug,
        author,
        createdAt: { gte: new Date(Date.now() - 60_000) },
      },
    });
    if (recentCount >= 3) {
      return NextResponse.json(
        { ok: false, error: "落笔稍密，且饮口茶，少顷再叙" },
        { status: 429 }
      );
    }

    const comment = await db.comment.create({
      data: {
        articleSlug: slug,
        author,
        body: finalText,
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
