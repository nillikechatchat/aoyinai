/** 内容结构修复：剥除 LLM 输出的 h1 标题回显与「摘要：/标题：」回显段，
 *  补齐丢失的栏目插图（0 图文章），重算阅读时长。幂等可重复运行。
 *  运行: bun run scripts/audit-fix-articles.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

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

/** 在第一个 h2 小节末尾插入插图（若无任何 h2 则不动） */
function insertIllustration(content: string, category: string, variant: number): string {
  const src = ILLUS_SRC[category];
  if (!src) return content;
  const caps = CAPTIONS[category] ?? ["水墨一帧，以佐文思"];
  const caption = caps[variant % caps.length];
  const lines = content.split("\n");
  const h2Idx = lines.findIndex((l) => /^##\s+/.test(l.trim()));
  if (h2Idx === -1) return content;
  let end = lines.length;
  for (let i = h2Idx + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i].trim()) || lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  let insertAt = -1;
  for (let i = end - 1; i > h2Idx; i--) {
    if (lines[i].trim() !== "") {
      insertAt = i + 1;
      break;
    }
  }
  if (insertAt === -1) return content;
  lines.splice(insertAt, 0, "", `![${caption}](${src})`, "");
  return lines.join("\n");
}

/** 掩去 ``` 围栏内代码，避免把代码注释误判为 h1 回显 */
function maskCodeFences(t: string): string {
  return t.replace(/```[\s\S]*?```/g, "");
}

function repair(
  content: string,
  category: string,
  variant: number,
  excerpt: string
): { text: string; notes: string[] } {
  const notes: string[] = [];
  let t = content.trim();

  // 0. 剥离开头摘要回显段（首段与 excerpt 前 15 字一致则丢弃）
  const firstParas = t.split(/\n\n+/);
  if (firstParas.length > 1 && excerpt && firstParas[0].replace(/\s/g, "").slice(0, 15) === excerpt.replace(/\s/g, "").slice(0, 15)) {
    firstParas.shift();
    notes.push("剥摘要回显");
    t = firstParas.join("\n\n").trim();
  }

  // 1. 剥除开头的 h1 回显行（围栏状态机逐行判断，可连续多行）
  const lines = t.split("\n");
  let inFence = false;
  let start = 0;
  while (start < lines.length) {
    const l = lines[start].trim();
    if (l.startsWith("```")) inFence = !inFence;
    if (!inFence && /^#\s+\S/.test(l)) {
      start++;
    } else {
      break;
    }
  }
  if (start > 0) {
    lines.splice(0, start);
    notes.push(`剥h1×${start}`);
  }
  t = lines.join("\n").trim();

  // 2. 剥除「摘要：/标题：」回显段（仅独立段落开头形式，且不在代码围栏内）
  const paras = t.split(/\n\n+/);
  inFence = false;
  const kept: string[] = [];
  for (const p of paras) {
    if (!inFence && /^(摘要|标题)：/.test(p.trim())) {
      notes.push("剥回显段×1");
      // 该段内围栏状态仍需推进
    } else {
      kept.push(p);
    }
    const fences = (p.match(/```/g) || []).length;
    if (fences % 2 === 1) inFence = !inFence;
  }
  t = kept.join("\n\n").trim();

  // 3. 补插图（仅当 0 图时；围栏内的 ![]() 不计）
  const imgCount = (maskCodeFences(t).match(/!\[[^\]]*\]\([^)]*\)/g) || []).length;
  if (imgCount === 0) {
    t = insertIllustration(t, category, variant);
    notes.push("补插图");
  }

  // 4. 若第一小节前有多余空行堆积，压缩
  t = t.replace(/\n{3,}/g, "\n\n");
  return { text: t, notes };
}

async function main() {
  const arts = await db.article.findMany({
    select: { id: true, slug: true, content: true, category: true, excerpt: true },
    orderBy: [{ category: "asc" }, { publishedAt: "asc" }],
  });
  const perCat = new Map<string, number>();
  let fixed = 0;
  for (const a of arts) {
    const variant = perCat.get(a.category) ?? 0;
    perCat.set(a.category, variant + 1);
    const { text, notes } = repair(a.content, a.category, variant, a.excerpt);
    const before = a.content.replace(/\s/g, "").length;
    const after = text.replace(/\s/g, "").length;
    if (notes.length > 0 || Math.abs(before - after) > 2) {
      const readMinutes = Math.max(1, Math.round(after / 250));
      await db.article.update({
        where: { id: a.id },
        data: { content: text, readMinutes },
      });
      fixed++;
      console.log(`${a.slug}: ${notes.join(",") || "微调"} ${before}->${after}字`);
    }
  }
  console.log(`\n修复 ${fixed}/${arts.length} 篇`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
