/**
 * 文章正文扩充：LLM 将 21 篇正文扩写至 1200~1800 字（保留 h2 结构与文风），
 * 并在首个小节后插入栏目水墨插图 markdown；直接更新 DB（保留 views/likes/comments）。
 * 运行: bun run scripts/expand-articles.ts
 */
import { PrismaClient } from "@prisma/client";
import ZAI from "z-ai-web-dev-sdk";

const db = new PrismaClient();

/** 每栏目插图图注（按文章在同栏目内的序号轮换，避免雷同） */
const CAPTIONS: Record<string, string[]> = {
  tutorials: ["案头展卷，灯火可亲", "格物致知，学而时习", "一卷在手，思潮如萤"],
  market: ["山道盘桓，问路于跬步", "云际识途，步步为营", "行者问津，路在脚下"],
  majors: ["庠序之内，薪火相传", "银杏庭前，问学少年", "名师指卷，星河作答"],
  events: ["山门既开，诸君鱼贯", "秋叶为笺，名比为约", "石阶之上，皆是赶路人"],
  hackathons: ["夜营灯火，四十八时", "帐内运筹，刻漏为师", "烛照方寸，智涌八方"],
  "cloud-deals": ["桥上市易，锱铢必较", "货栈云屯，价比三家", "江船待发，薄利多载"],
  "t-agent": ["执纲振纪，众偶同台", "丝线所系，八方相应", "一曲既出，百偶齐舞"],
};

const ILLUS_SRC: Record<string, string> = {
  tutorials: "/images/illu-tutorials.png",
  market: "/images/illu-market.png",
  majors: "/images/illu-majors.png",
  events: "/images/illu-events.png",
  hackathons: "/images/illu-hackathons.png",
  "cloud-deals": "/images/illu-cloud-deals.png",
  "t-agent": "/images/illu-t-agent.png",
};

const SYSTEM = `你是中文科技博客「敖胤AI」的执笔人敖胤先生。文风：干练的中文科技写作，间或引用一句古籍（论语、大学、道德经等）点题，用「」引号，冷静克制，观点具体，不说空话套话。博客正文用 markdown，小节标题一律用 ## 开头。`;

function buildPrompt(title: string, excerpt: string, content: string): string {
  return `请把下面这篇博客文章扩写为 1300~1800 字（不含空白字符，上限 2200 字，宁可精炼也不要注水）的完整文章。

要求：
1. 保留原文的全部 ## 小节标题，一字不改、顺序不变（这是目录锚点，极其重要）；
2. 在每个小节内补充：具体的例子、数字、步骤、坑点、实践经验，让内容扎实可读；
3. 保持原文的文风与观点立场，可以新增 1~2 个 ## 小节放在合适位置；
4. 结尾保留「---」分隔线与一句斜体收束语；
5. 只输出 markdown 正文本身，不要代码块包裹，不要任何解释。

标题：${title}
摘要：${excerpt}

原文：
${content}`;
}

const HARD_LIMIT = 3200; // 超过则智能截断
const MIN_CHARS = 900;

/** 超长时在小节/段落边界截断，并补回结尾的 --- 落款块 */
function smartTruncate(t: string): string {
  const chars = t.replace(/\s/g, "");
  if (chars.length <= HARD_LIMIT) return t;
  // 目标截断点（按非空白字符数近似换算）
  let budget = HARD_LIMIT - 200;
  const paras = t.split(/\n\n+/);
  const kept: string[] = [];
  let used = 0;
  for (const p of paras) {
    const len = p.replace(/\s/g, "").length;
    if (used + len > budget && kept.length > 0) break;
    kept.push(p);
    used += len;
  }
  let out = kept.join("\n\n");
  // 若原文有 --- 落款块（最后一段以 --- 开头），补回
  const tail = t.split(/\n\n+/).filter((p) => p.trim().startsWith("---"));
  if (tail.length > 0) out += "\n\n" + tail[tail.length - 1];
  return out.trim();
}

function validate(orig: string, out: string): string | null {
  let t = (out || "").trim();
  // 去掉可能的代码块包裹
  t = t.replace(/^```(?:markdown|md)?\s*/i, "").replace(/```\s*$/, "");
  if (t.replace(/\s/g, "").length < MIN_CHARS) return "too_short";
  // 原有 h2 必须全部保留（目录锚点不丢）；比对时忽略空白与全半角标点差异
  const norm = (s: string) => s.replace(/\s/g, "").replace(/[：:，,。.、]/g, "");
  const tNorm = norm(t);
  const origH2 = [...orig.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
  for (const h of origH2) {
    if (!tNorm.includes(norm(h))) return `missing_h2:${h}`;
  }
  if (!t.startsWith("#")) {
    // 允许以正文开头，但不应以 ## 以外的奇怪标记开头
    if (t.startsWith("!") || t.startsWith("<")) return "bad_start";
  }
  return null;
}

/** 在第 idx 个小节（## 之后）的段落末尾插入插图 markdown */
function insertIllustration(content: string, category: string, variant: number): string {
  const src = ILLUS_SRC[category];
  if (!src) return content;
  const caps = CAPTIONS[category] ?? ["水墨一帧，以佐文思"];
  const caption = caps[variant % caps.length];
  const lines = content.split("\n");
  // 找到第一个 h2 小节：从第一个 "## " 行开始，到下一个 "## " 行或 "---" 之前的最后非空行
  let h2Idx = lines.findIndex((l) => /^##\s+/.test(l.trim()));
  if (h2Idx === -1) return content;
  let end = lines.length;
  for (let i = h2Idx + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i].trim()) || lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  // 在小节末尾向前找最后一个非空行
  let insertAt = -1;
  for (let i = end - 1; i > h2Idx; i--) {
    if (lines[i].trim() !== "") {
      insertAt = i + 1;
      break;
    }
  }
  if (insertAt === -1) return content;
  const imgBlock = ["", `![${caption}](${src})`, ""];
  lines.splice(insertAt, 0, ...imgBlock);
  return lines.join("\n");
}

async function main() {
  const arts = await db.article.findMany({
    select: { id: true, slug: true, title: true, excerpt: true, content: true, category: true },
    orderBy: [{ category: "asc" }, { publishedAt: "asc" }],
  });
  console.log(`共 ${arts.length} 篇待扩写`);

  const perCatCount = new Map<string, number>();
  const zai = await ZAI.create();
  let ok = 0;
  let fallback = 0;

  for (const a of arts) {
    const curLen = a.content.replace(/\s/g, "").length;
    if (curLen >= 1000) {
      console.log(`skip ${a.slug} (${curLen}字 已达标)`);
      continue;
    }
    const variant = perCatCount.get(a.category) ?? 0;
    perCatCount.set(a.category, variant + 1);

    let finalContent = "";
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const completion = await zai.chat.completions.create({
          messages: [
            { role: "assistant", content: SYSTEM },
            { role: "user", content: buildPrompt(a.title, a.excerpt, a.content) },
          ],
          thinking: { type: "disabled" },
        });
        const raw = completion.choices[0]?.message?.content || "";
        const err = validate(a.content, raw);
        if (!err) {
          finalContent = smartTruncate(raw.trim());
          break;
        }
        console.log(`  [${a.slug}] attempt${attempt} invalid: ${err}`);
      } catch (e) {
        console.log(`  [${a.slug}] attempt${attempt} error: ${(e as Error).message}`);
      }
      await new Promise((r) => setTimeout(r, 3000));
    }

    if (!finalContent) {
      // 兜底：原文 + 插图，字数不足也至少把图插进去
      finalContent = a.content;
      fallback++;
      console.log(`  [${a.slug}] 兜底保留原文`);
    }

    const withImg = insertIllustration(finalContent, a.category, variant);
    const charCount = withImg.replace(/\s/g, "").length;
    const readMinutes = Math.max(1, Math.round(charCount / 250));

    await db.article.update({
      where: { id: a.id },
      data: { content: withImg, readMinutes },
    });
    ok++;
    console.log(`done ${a.slug}: ${curLen} -> ${charCount} 字 / ${readMinutes} 分钟`);
    await new Promise((r) => setTimeout(r, 1200));
  }

  console.log(`\n完成：扩写 ${ok} 篇（其中兜底 ${fallback} 篇）`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
