#!/usr/bin/env node
/**
 * 构建期同步：运行在 Vercel 构建阶段，把 content/posts/*.md 同步到本地打包 SQLite。
 * 脚本路径: scripts/build-sync.mjs
 * 用法: node scripts/build-sync.mjs
 *
 * 依赖（全局）: gray-matter
 * 依赖（本地）: @prisma/client（由 postinstall 生成）
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "path";
import { fileURLToPath } from "node:url";
import grayMatter from "/usr/local/lib/node_modules/gray-matter/index.js";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.resolve(__dirname, "../content/posts");

const CATEGORIES = {
  tutorials: "AI 教程",
  market: "市场分析",
  majors: "高校专业",
  events: "赛事活动",
  hackathons: "黑客松",
  "cloud-deals": "云厂商优惠",
  "t-agent": "T-agent",
};

function parseDate(dateStr) {
  const d = new Date(dateStr);
  if (!Number.isNaN(d.getTime())) return d;
  return new Date();
}

function parseMatter(content) {
  const { data, content: body } = grayMatter(content);
  const title = String(data.title ?? "").trim();
  const date = String(data.date ?? "");
  const draft = Boolean(data.draft ?? false);
  const description = String(data.description ?? "").trim();
  const categories = Array.isArray(data.categories)
    ? data.categories.map((c) => String(c).trim()).filter(Boolean)
    : [];
  const tags = Array.isArray(data.tags)
    ? data.tags.map((t) => String(t).trim()).filter(Boolean)
    : [];
  const cover = String(data.cover ?? "/images/cover-tutorials.png");
  return { title, date, draft, description, categories, tags, cover, body };
}

function resolveSlug(title, filename) {
  // filename (without .md) is the authoritative slug — never regenerate from title to avoid breaking Chinese-title articles
  if (!filename) return undefined;
  return filename.replace(/\.md$/i, "");
}

async function main() {
  if (!existsSync(POSTS_DIR)) {
    console.log("[build-sync] content/posts/ not found，跳过");
    return;
  }
  const db = new PrismaClient({ datasourceUrl: `file:${path.join(process.cwd(), "db", "custom.db")}` });
  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  console.log(`[build-sync] found ${files.length} md files`);
  for (const f of files) {
    try {
      const raw = readFileSync(path.join(POSTS_DIR, f), "utf8");
      const { title, draft, description, categories, tags, cover, body } = parseMatter(raw);
      if (!title || !body) continue;
      const cat = categories[0] || "tutorials";
      if (!CATEGORIES[cat]) continue;
      const published = !draft;
      const publishedAt = parseDate(parseMatter(raw).date || new Date().toISOString());
      const readMinutes = Math.max(1, Math.round(body.replace(/\s/g, "").length / 250));
      const slug = resolveSlug(title, f);
      const existing = await db.article.findUnique({ where: { slug } });
      if (existing) {
        await db.article.update({ where: { slug }, data: { title, excerpt: description, content: body, category: cat, tags: tags.join(","), cover, published, publishedAt, readMinutes } });
      } else {
        await db.article.create({ data: { slug, title, excerpt: description, content: body, category: cat, tags: tags.join(","), cover, published, publishedAt, readMinutes } });
      }
      console.log(`[build-sync] synced ${slug}`);
    } catch (e) {
      console.error(`[build-sync] fail ${f}: ${e.message}`);
    }
  }
  // soft-delete removed articles
  const allArticles = await db.article.findMany({ select: { slug: true, published: true } });
  const knownSlugs = new Set(files.map((f) => f.replace(".md", "")));
  for (const a of allArticles) {
    if (!knownSlugs.has(a.slug) && a.published) {
      await db.article.update({ where: { slug: a.slug }, data: { published: false } });
      console.log(`[build-sync] soft-deleted ${a.slug}`);
    }
  }
  await db.$disconnect();
  console.log("[build-sync] done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
