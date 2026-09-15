/**
 * 重算存量文章的阅读时长（按正文字数估算，中文技术文精读约 250 字/分钟，下限 1）
 * 只 UPDATE readMinutes 一列，不触碰其他数据（签筒/留言/浏览量均保留）。
 * 运行: bun run scripts/recalc-reading.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function estimateReadingMinutes(content: string): number {
  const chars = content.replace(/\s/g, "").length;
  return Math.max(1, Math.round(chars / 250));
}

async function main() {
  const articles = await db.article.findMany({
    select: { id: true, slug: true, title: true, content: true, readMinutes: true },
  });
  let changed = 0;
  for (const a of articles) {
    const next = estimateReadingMinutes(a.content);
    if (next !== a.readMinutes) {
      await db.article.update({ where: { id: a.id }, data: { readMinutes: next } });
      console.log(`${a.slug}: ${a.readMinutes} → ${next} 分钟（${a.title}）`);
      changed += 1;
    }
  }
  console.log(`共 ${articles.length} 篇，修正 ${changed} 篇阅读时长 ✅`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
