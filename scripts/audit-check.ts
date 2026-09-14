/** 终态审计：围栏感知地检查 21 篇结构（图数/h1回显/字段回显/字数/小节数）
 *  运行: bun run scripts/audit-check.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const FENCE = /```[\s\S]*?```/g;

async function main() {
  const arts = await db.article.findMany({
    select: { slug: true, content: true, readMinutes: true },
  });
  let issues = 0;
  for (const a of arts) {
    const masked = a.content.replace(FENCE, "");
    const imgs = (masked.match(/!\[[^\]]*\]\([^)]*\)/g) || []).length;
    const hasH1 = /^#\s/m.test(masked);
    const hasEcho = /^(摘要|标题)：/m.test(masked);
    const chars = masked.replace(/\s/g, "").length;
    const h2s = [...masked.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1]);
    if (imgs !== 1 || hasH1 || hasEcho || chars < 1000 || h2s.length < 2) {
      issues++;
      console.log("仍异常:", a.slug, "图" + imgs, "h1" + hasH1, "echo" + hasEcho, chars + "字", "h2×" + h2s.length);
    }
  }
  const lens = arts.map((a) => a.content.replace(/\s/g, "").length);
  console.log(issues === 0 ? "✓ 21 篇全部干净" : issues + " 篇仍异常");
  console.log(
    "终态: 篇均",
    Math.round(lens.reduce((s, l) => s + l, 0) / lens.length),
    "字 | 范围",
    Math.min(...lens),
    "-",
    Math.max(...lens)
  );
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
