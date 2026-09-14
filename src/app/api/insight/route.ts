import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FALLBACK_INSIGHTS = [
  {
    name: "观澜卦",
    oracle: "临渊观澜，不争先而自远。",
    interpret: "AI 浪潮正急，但真正的高手不追每一朵浪花。此刻宜静观行业趋势，选定一条赛道深耕，胜过四处观望。",
    advice: "本周选定一个 AI 领域（如 Agent 或 RAG），精读一篇深度文章，胜过刷十条快讯。",
  },
  {
    name: "启明卦",
    oracle: "启明于东，其道大光。",
    interpret: "旧的问题即将出现新的解法。你所犹豫的事情，其实已有成熟工具可以借力，只是尚未察觉。",
    advice: "把你正在做的事拆成三步，找出最费时的一步，搜索是否有 AI 工具可以代劳。",
  },
  {
    name: "守拙卦",
    oracle: "大巧若拙，大辩若讷。",
    interpret: "技术喧嚣之时，基本功才是护城河。模型会迭代，框架会更替，唯数学与工程直觉历久弥坚。",
    advice: "放下新工具清单，今晚复习一遍概率论或把一段旧代码重构，是更好的投资。",
  },
  {
    name: "结网卦",
    oracle: "临渊羡鱼，不如退而结网。",
    interpret: "与其羡慕他人的成果与机遇，不如着手搭建自己的工具与作品。AI 时代，动手者得天下。",
    advice: "选一个小而完整的项目（如一个自动化脚本），本周内完成并公开分享。",
  },
];

function extractJson(text: string): Record<string, string> | null {
  if (!text) return null;
  let t = text.trim();
  // 去掉 markdown 代码块包裹
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(t.slice(start, end + 1));
  } catch {
    return null;
  }
}

// GET /api/insight?limit=&sessionId= —— 最近问签记录（签筒；带 sessionId 时仅返回本人记录）
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 24, 60);
    const sessionId = (searchParams.get("sessionId") || "").trim();
    const records = await db.insightRecord.findMany({
      where: sessionId ? { sessionId } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        question: true,
        name: true,
        oracle: true,
        interpret: true,
        advice: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ ok: true, records, total: records.length });
  } catch (e) {
    console.error("[GET /api/insight]", e);
    return NextResponse.json({ ok: false, error: "获取签筒失败" }, { status: 500 });
  }
}

// POST /api/insight  —— 司南问签：AI 生成签文
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const question: string = (body?.question || "").toString().slice(0, 200).trim();
    const sessionId: string = (body?.sessionId || "").toString().slice(0, 64).trim();

    const zai = await ZAI.create();

    const system = `你是一位精通古典文言与 AI 行业的智者「敖胤先生」。求问者会敲响司南问一事，你以抽签形式作答。

要求：
1. 生成一支出自你门的签文，输出严格的 JSON，字段如下：
   - "name": 卦名，两到三个汉字加「卦」字，如「青云卦」「观澜卦」「破晓卦」，要有意境，避开常见重复；
   - "oracle": 卦辞，一句文言（10~18 字），凝练如古籍；
   - "interpret": 解曰，用白话 2~3 句（60~110 字），将卦意与当下 AI 时代的学习、职业、技术抉择相联系，语气温暖而有定力；
   - "advice": 建议，一句可直接执行的小行动（20~40 字），具体可操作。
2. 若求问者写下了具体问题，解曰须贴题而答，但保持含蓄与智慧，不做绝对断言。
3. 只输出 JSON，不要任何其他文字。`;

    const user = question
      ? `求问者心念一动，问曰：「${question}」。请赐签。`
      : `求问者静默叩问，心无所指，唯愿见一卦以明今日之势。请赐签。`;

    let insight: { name: string; oracle: string; interpret: string; advice: string } | null = null;

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "assistant", content: system },
          { role: "user", content: user },
        ],
        thinking: { type: "disabled" },
      });
      const raw = completion.choices[0]?.message?.content || "";
      const parsed = extractJson(raw);
      if (parsed && parsed.name && parsed.oracle && parsed.interpret && parsed.advice) {
        insight = {
          name: String(parsed.name).slice(0, 12),
          oracle: String(parsed.oracle).slice(0, 60),
          interpret: String(parsed.interpret).slice(0, 300),
          advice: String(parsed.advice).slice(0, 120),
        };
      }
    } catch (e) {
      console.error("[POST /api/insight] LLM error:", e);
    }

    // 兜底：LLM 失败时用本地签池
    if (!insight) {
      insight = FALLBACK_INSIGHTS[Math.floor(Math.random() * FALLBACK_INSIGHTS.length)];
    }

    // 记录入库（不阻塞）
    db.insightRecord
      .create({ data: { question, sessionId, ...insight } })
      .catch(() => {});

    return NextResponse.json({ ok: true, insight });
  } catch (e) {
    console.error("[POST /api/insight]", e);
    return NextResponse.json({ ok: false, error: "问签失败，请稍后再试" }, { status: 500 });
  }
}
