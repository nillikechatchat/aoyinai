import { NextRequest, NextResponse } from "next/server";
import { aiChat } from "@/lib/ai";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/articles/[slug]/tldr —— 取「一句话速览」（已缓存则直接返回）
 * POST /api/articles/[slug]/tldr —— 无缓存时用 LLM 生成一句 60 字内古风速览并落库
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const article = await db.article.findUnique({
      where: { slug },
      select: { tldr: true },
    });
    if (!article) {
      return NextResponse.json({ ok: false, error: "查无此文" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, tldr: article.tldr || null, cached: true });
  } catch (e) {
    console.error("[GET /api/articles/:slug/tldr]", e);
    return NextResponse.json({ ok: false, error: "速览读取失败" }, { status: 500 });
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const article = await db.article.findUnique({
      where: { slug },
      select: { title: true, excerpt: true, content: true, tldr: true },
    });
    if (!article) {
      return NextResponse.json({ ok: false, error: "查无此文" }, { status: 404 });
    }

    // 已有缓存：直接返回（幂等）
    if (article.tldr) {
      return NextResponse.json({ ok: true, tldr: article.tldr, cached: true });
    }

    // 正文取前 1200 字即可提炼
    const bodyText = article.content
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // 去插图
      .replace(/[#*`>_[\]()]/g, "")
      .replace(/\s+/g, " ")
      .slice(0, 1200);

    // 统一 AI 层：沙盒 SDK → OpenAI 兼容通道，皆不可用则明确报错（前端 toast 降级）
    const raw = await aiChat(
      [
        {
          role: "system",
          content:
            "你是「敖胤先生」，一位笔墨清雅的中文科技专栏作者。为文章写一句『一句话速览』：60 字以内、单个自然句、古风笔意但信息准确，概括全文核心观点。只输出这一句话本身，不要引号、不要前缀、不要任何解释。",
        },
        {
          role: "user",
          content: `文章标题：${article.title}\n导语：${article.excerpt}\n正文：${bodyText}`,
        },
      ],
      { temperature: 0.6, maxTokens: 120 }
    );

    if (!raw) {
      return NextResponse.json(
        { ok: false, error: "AI 服务未配置（部署时需设置 AI_API_KEY / AI_BASE_URL）" },
        { status: 503 }
      );
    }

    const tldr = String(raw)
      .replace(/^["「『]|["」』]$/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);

    if (!tldr) {
      return NextResponse.json({ ok: false, error: "速览未成" }, { status: 502 });
    }

    await db.article.update({ where: { slug }, data: { tldr } });
    return NextResponse.json({ ok: true, tldr, cached: false });
  } catch (e) {
    console.error("[POST /api/articles/:slug/tldr]", e);
    return NextResponse.json({ ok: false, error: "速览未成，请稍后再试" }, { status: 500 });
  }
}
