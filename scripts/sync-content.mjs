/**
 * 内容同步：把 content/posts/*.md 反向上推到 Prisma 文章表（按 slug upsert）。
 * 仅更新已入库字段：title/excerpt/content/tags/cover/published/publishedAt；不碰 views/likes/tldr/comments。
 * 新增 md 即新增文章，删掉 md 会把该文章软删（published=false）；重跑幂等。
 *
 * 运行（本地开发）:
 *   DATABASE_URL=file:./db/custom.db node scripts/sync-content.mjs
 * 运行（Vercel 构建期）:
 *   DATABASE_URL=file:./db/custom.db node scripts/sync-content.mjs  # 写本地打包 SQLite（快照，运行时读它）
 *
 * 注意：
 *   - 本脚本只写本地 SQLite，不直连 Turso。要同步远端请在 CI 里单独调用 migrate-to-turso.ts。
 *   - 依赖 gray-matter（已全局安装）；如需要本地安装请在 package.json 里加并重新 bun install。
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

function resolveDb() {
  const rawUrl = process.env.DATABASE_URL?.trim() || "";
  if (rawUrl.startsWith("file:")) {
    return new PrismaClient({ datasourceUrl: rawUrl, log: ["query"] });
  }
  // fallback local bundled sqlite (Vercel snapshot)
  return new PrismaClient({ datasourceUrl: `file:${path.join(process.cwd(), "db", "custom.db")}`, log: ["query"] });
}

function slugify(title, existingSlug) {
  if (existingSlug) return existingSlug;
  const base = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "untitled";
}

function parseDate(dateStr) {
  const d = new Date(dateStr);
  if (!Number.isNaN(d.getTime())) return d;
  return new Date();
}

async function main() {
  const db = resolveDb();
  console.log(`DB: ${process.env.DATABASE_URL?.slice(0, 30) || "local"}`);

  if (!existsSync(POSTS_DIR)) {
    console.log(`posts dir not found: ${POSTS_DIR}，跳过同步`);
    await db.$disconnect();
    return;
  }

  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  console.log(`found ${files.length} .md files`);

  const existing = await db.article.findMany({
    select: { id: true, slug: true, published: true, publishedAt: true },
  });
  const slugById = new Map(existing.map((a) => [a.slug, a]));

  let upserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const f of files) {
    const fp = path.join(POSTS_DIR, f);
    try {
      const raw = readFileSync(fp, "utf8");
      const { title, draft, description, categories, tags, cover, body } = parseMatter(raw);
      const dateStr = parseMatter(raw).date;

      if (!title || !body) {
        console.log(`skip empty: ${f}`);
        skipped++;
        continue;
      }

      const cat = categories[0] || "tutorials";
      if (!CATEGORIES[cat]) {
        console.log(`skip unknown category ${cat}: ${f}`);
        skipped++;
        continue;
      }

      const tagStr = tags.join(",");
      const published = !draft;
      const publishedAt = parseDate(dateStr || new Date().toISOString());
      const readMinutes = Math.max(1, Math.round(body.replace(/\s/g, "").length / 250));
      const slug = slugify(title, slugById.get(f.replace(".md", ""))?.slug ?? undefined);

      const where = { slug };
      const existingById = slugById.get(slug);
      if (existingById) {
        await db.article.update({
          where,
          data: { title, excerpt: description, content: body, category: cat, tags: tagStr, cover, published, publishedAt, readMinutes },
        });
      } else {
        await db.article.create({
          data: { slug, title, excerpt: description, content: body, category: cat, tags: tagStr, cover, published, publishedAt, readMinutes },
        });
      }
      slugById.set(slug, { id: "new", slug, published, publishedAt });
      upserted++;
      console.log(`upserted ${slug} (published=${published})`);
    } catch (e) {
      console.error(`fail ${f}: ${e.message}`);
      failed++;
    }
  }

  // soft-remove articles whose md no longer exists and are published
  for (const [slug, rec] of slugById) {
    const fp = path.join(POSTS_DIR, `${slug}.md`);
    if (!existsSync(fp) && rec.published) {
      await db.article.update({ where: { slug }, data: { published: false } });
      console.log(`soft-deleted ${slug} (md missing)`);
    }
  }

  console.log(`sync done: upserted ${upserted}, skipped ${skipped}, failed ${failed}`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
