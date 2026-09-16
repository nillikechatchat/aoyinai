#!/usr/bin/env node
/**
 * 从 Prisma 数据库导出已发布文章为 content/posts/*.md。
 * 运行: node scripts/dump-articles.mjs > /tmp/articles.json
 * 然后: node scripts/export-content.mjs < /tmp/articles.json
 */
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const arts = await db.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "asc" },
    select: {
      slug: true, title: true, category: true, tags: true, cover: true, excerpt: true, content: true, publishedAt: true,
    },
  });
  const arr = arts.map((a) => ({
    slug: a.slug,
    title: a.title,
    category: a.category,
    tags: (a.tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    cover: a.cover,
    excerpt: a.excerpt,
    content: a.content,
    daysAgo: Math.floor((Date.now() - new Date(a.publishedAt).getTime()) / 86400000),
  }));
  console.log(JSON.stringify({ articles: arr }));
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
