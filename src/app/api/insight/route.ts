import { NextRequest, NextResponse } from "next/server";
import { aiChat } from "@/lib/ai";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 本地签池（16 支）：未配置任何模型时问签亦可用，同日同问抽同签
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
  {
    name: "潜渊卦",
    oracle: "潜龙在渊，待时而动。",
    interpret: "此刻不宜急躁求成。你在沉淀的能力尚未到兑现之时，继续深潜蓄势，风起自有扶摇日。",
    advice: "把想发的内容先写好存草稿，多改两稿再发，急章多悔，慢文多寿。",
  },
  {
    name: "问津卦",
    oracle: "欲渡无舟，问津而后行。",
    interpret: "前路非不明，只是尚未开口问。你所困之处，早有人走过并写下了路引，主动求问即是捷径。",
    advice: "今天就向你景仰的同行或社区提一个具体问题，问得越具体，答得越有用。",
  },
  {
    name: "磨镜卦",
    oracle: "磨镜去尘，明自内生。",
    interpret: "信息的尘埃蒙住了判断。少看一点推送，多整理一点已有所学，澄清的思考会自然浮现。",
    advice: "花半小时把收藏夹里落灰的文章清理一遍：精读一篇，其余放手。",
  },
  {
    name: "积薪卦",
    oracle: "曲突徙薪，绸缪未雨。",
    interpret: "眼前的安稳非永逸。行业剧变前夜，最宜提前储备：技能、作品、人脉，皆是未雨之薪。",
    advice: "列出两个你最依赖的技能，为其中较旧的那个制定一个月的更新计划。",
  },
  {
    name: "望山卦",
    oracle: "望山行路，步步皆是登临。",
    interpret: "目标虽远，不必总抬头焦虑。把目光收回脚下，眼下的每一步本身就在缩短距离。",
    advice: "把大目标切成本周可完成的三件小事，完成一件划掉一件。",
  },
  {
    name: "渡口卦",
    oracle: "舟到渡口，自有接引。",
    interpret: "你已在正确的水路上。看似停滞的日子其实是顺流，同行者与机缘正在前方渡口汇聚。",
    advice: "参加一次线上或线下同行交流，你的下一个合作者可能就在其中。",
  },
  {
    name: "燃灯卦",
    oracle: "一灯照隅，万灯照国。",
    interpret: "你所学所得，勿轻藏于己。分享出去的一点微光，会照亮他人，也会引来回声与同道。",
    advice: "把最近踩过的一个坑写成短文或笔记公开发出，帮人亦是修己。",
  },
  {
    name: "舍筏卦",
    oracle: "得鱼忘筌，过河舍筏。",
    interpret: "曾经趁手的工具与方法，如今可能成了包袱。敢舍旧筏，方登新岸；旧经验要用新方式检验。",
    advice: "检视你工作流里最旧的一环，本周试用一个新方案替代它看看。",
  },
  {
    name: "澄心卦",
    oracle: "澄心定神，乱中取直。",
    interpret: "诸声喧哗之时，最忌随波起舞。先安顿己心，再辨方向；你的直觉比算法推荐更懂你。",
    advice: "睡前十分钟不碰屏幕，用纸笔写下明天最重要的一件事。",
  },
  {
    name: "拾级卦",
    oracle: "不积跬步，无以至千里。",
    interpret: "宏图须由碎步垒成。每天固定的一小时，胜过等来的一个完美周末；积累自会给出答案。",
    advice: "设定每日三十分钟不可侵犯的学习时段，连续执行七天再评估。",
  },
  {
    name: "听雨卦",
    oracle: "夜听春雨，静候花开。",
    interpret: "种子在土里的时候，看不到变化，但生长从未停止。你埋下的努力正在生根，静候即可。",
    advice: "回看三个月前记下的笔记或代码，你会看见自己已经走了多远。",
  },
  {
    name: "乘风卦",
    oracle: "好风凭借力，送我上青云。",
    interpret: "风口不是等来的，是认出来的。顺势而为者，以四两拨千斤；此刻正有一阵顺风在你身旁。",
    advice: "找出你所在领域最近的一个平台级变化（新模型/新政策/新市场），想清楚如何借力。",
  },
];

/** 本地签池抽签：sessionId+question+日期 做稳定哈希 → 同日同问抽同签，隔日或改问则换签（如真抽签，非纯随机） */
function pickLocalInsight(question: string, sessionId: string) {
  const dayKey = new Date().toISOString().slice(0, 10);
  const seedStr = `${sessionId}|${question}|${dayKey}`;
  // FNV-1a + murmur 雪崩混淆（消除低位偏置，保证 16 支签分布均匀）
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909);
  h ^= h >>> 16;
  return FALLBACK_INSIGHTS[(h >>> 0) % FALLBACK_INSIGHTS.length];
}

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

// GET /api/insight?limit=&sessionId=&since= —— 最近问签记录（签筒；带 sessionId 时仅返回本人记录；since 为 ISO 时间下限）
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 24, 200);
    const sessionId = (searchParams.get("sessionId") || "").trim();
    const sinceRaw = (searchParams.get("since") || "").trim();
    const since = sinceRaw && !Number.isNaN(new Date(sinceRaw).getTime()) ? new Date(sinceRaw) : undefined;

    const records = await db.insightRecord.findMany({
      where: {
        ...(sessionId ? { sessionId } : {}),
        ...(since ? { createdAt: { gte: since } } : {}),
      },
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

// POST /api/insight  —— 司南问签：AI 生成签文（可携带上一签上下文，保持再问连贯）
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const question: string = (body?.question || "").toString().slice(0, 200).trim();
    const sessionId: string = (body?.sessionId || "").toString().slice(0, 64).trim();
    const prevName: string = (body?.prevName || "").toString().slice(0, 16).trim();
    const prevOracle: string = (body?.prevOracle || "").toString().slice(0, 60).trim();

    const system = `你是一位精通古典文言与 AI 行业的智者「敖胤先生」。求问者会敲响司南问一事，你以抽签形式作答。

要求：
1. 生成一支出自你门的签文，输出严格的 JSON，字段如下：
   - "name": 卦名，两到三个汉字加「卦」字，如「青云卦」「观澜卦」「破晓卦」，要有意境，避开常见重复；
   - "oracle": 卦辞，一句文言（10~18 字），凝练如古籍；
   - "interpret": 解曰，用白话 2~3 句（60~110 字），将卦意与当下 AI 时代的学习、职业、技术抉择相联系，语气温暖而有定力；
   - "advice": 建议，一句可直接执行的小行动（20~40 字），具体可操作。
2. 若求问者写下了具体问题，解曰须贴题而答，但保持含蓄与智慧，不做绝对断言。
3. 若求问者先前已得一签，新签应与旧签意脉相承而不重复（如旧签言「进」，新签可言进中之守），解曰可自然呼应，但卦名不可与旧签相同。
4. 只输出 JSON，不要任何其他文字。`;

    const prevPart = prevName
      ? `求问者先前曾得一签「${prevName}」，卦辞曰：「${prevOracle}」。`
      : "";
    const user = question
      ? `${prevPart}此番心念一动，再问：「${question}」。请赐新签。`
      : prevPart
        ? `${prevPart}此番静默再叩，欲观前路变化。请赐新签。`
        : `求问者静默叩问，心无所指，唯愿见一卦以明今日之势。请赐签。`;

    let insight: { name: string; oracle: string; interpret: string; advice: string } | null = null;

    // 统一 AI 层：沙盒 SDK → OpenAI 兼容通道，皆不可用则本地兑底签池
    const raw = await aiChat(
      [
        { role: "assistant", content: system },
        { role: "user", content: user },
      ],
      { temperature: 0.8 }
    );
    if (raw) {
      const parsed = extractJson(raw);
      if (parsed && parsed.name && parsed.oracle && parsed.interpret && parsed.advice) {
        insight = {
          name: String(parsed.name).slice(0, 12),
          oracle: String(parsed.oracle).slice(0, 60),
          interpret: String(parsed.interpret).slice(0, 300),
          advice: String(parsed.advice).slice(0, 120),
        };
      }
    }

    // 兑底：未配模型或 LLM 失败时，走本地签池（同日同问抽同签）
    if (!insight) {
      insight = pickLocalInsight(question, sessionId);
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
