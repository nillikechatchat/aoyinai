/**
 * 内容导出：把 Prisma 文章导出到 content/posts/*.md（YAML frontmatter + markdown body）。
 * 运行:
 *   DATABASE_URL=file:./db/custom.db node scripts/dump-articles.mjs | node scripts/export-content.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import path from "path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CATEGORY_SET = new Set([
  "tutorials",
  "market",
  "majors",
  "events",
  "hackathons",
  "cloud-deals",
  "t-agent",
]);

function fmtDate(daysAgo) {
  const d = new Date(Date.now() - daysAgo * 24 * 3600 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toFrontmatter(a) {
  const esc = (s) => s.replace(/"/g, '\\"');
  const lines = [
    '---',
    `title: "${esc(a.title)}"`,
    `date: ${fmtDate(a.daysAgo)}`,
    `draft: false`,
    `description: "${esc(a.excerpt)}"`,
    `categories: ["${a.category}"]`,
    `tags: [${a.tags.map((t) => `"${esc(t)}"`).join(", ")}]`,
    `cover: ${a.cover}`,
    "---",
  ];
  return lines.join("\n");
}

function main() {
  const raw = readFileSync("/dev/stdin", "utf8").trim();
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (e) {
    console.error("JSON parse failed:", e.message);
    process.exit(1);
  }

  const outDir = path.resolve(__dirname, "../content/posts");
  mkdirSync(outDir, { recursive: true });

  const existingSlugs = new Set();
  const dirFiles = existsSync(outDir) ? readdirSync(outDir) : [];
  const removed = [];

  for (const a of payload.articles) {
    const badSlug = !SLUG_RE.test(a.slug);
    const badCat = !CATEGORY_SET.has(a.category);
    if (badSlug || badCat) {
      console.warn(`skip invalid article: slug=${a.slug}, category=${a.category}`);
      continue;
    }
    const fp = path.join(outDir, `${a.slug}.md`);
    const fm = toFrontmatter(a);
    const body = a.content.replace(/\r?\n/g, "\n");
    const dest = fm + "\n\n" + body + "\n";
    writeFileSync(fp, dest, "utf8");
    existingSlugs.add(a.slug);
    console.log(`exported ${a.slug} (${a.daysAgo}d ago, ${a.content.replace(/\s/g, "").length} chars)`);
  }

  for (const f of dirFiles) {
    if (!f.endsWith(".md")) continue;
    const slug = f.slice(0, -3);
    if (!existingSlugs.has(slug)) {
      removed.push(f);
    }
  }

  if (removed.length > 0) {
    console.log(`stale md files (kept for safety): ${removed.join(", ")}`);
  }

  console.log(`done. exported ${existingSlugs.size} articles.`);
}

main();
