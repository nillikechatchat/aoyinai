/**
 * 「先生速览」批量预热脚本：对全站文章逐篇 POST /api/articles/[slug]/tldr，
 * 让每张文章卡片的 hover 速览都能秒出（接口幂等：已有缓存直接返回）。
 * 用法：bun run tldr:preheat [limit]（默认 30，需 dev 服务器运行中）
 */
export {};


const API = process.env.PREHEAT_API ?? "http://localhost:3000";
const LIMIT = Number(process.argv[2] ?? 30);

interface ArticleRow {
  slug: string;
  title: string;
}

async function preheat(slug: string): Promise<{ ok: boolean; tldr?: string; cached?: boolean }> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const r = await fetch(`${API}/api/articles/${encodeURIComponent(slug)}/tldr`, {
        method: "POST",
      });
      if (r.ok) return (await r.json()) as { ok: boolean; tldr?: string; cached?: boolean };
      if (r.status === 502 && attempt === 1) continue; // LLM 未成，重试一次
      return { ok: false };
    } catch {
      if (attempt === 2) return { ok: false };
    }
  }
  return { ok: false };
}

async function main() {
  console.log(`— 先生速览预热：全站文章（上限 ${LIMIT} 篇）→`);
  const res = await fetch(`${API}/api/articles?limit=${LIMIT}`);
  const data = (await res.json()) as { ok: boolean; articles: ArticleRow[]; total?: number };
  if (!data.ok || !Array.isArray(data.articles)) {
    console.error("拉取文章失败", data);
    process.exit(1);
  }

  let fresh = 0;
  let cached = 0;
  let failed = 0;
  for (const a of data.articles) {
    const t0 = Date.now();
    const r = await preheat(a.slug);
    const ms = Date.now() - t0;
    if (!r.ok || !r.tldr) {
      failed++;
      console.log(`  ✗ ${a.slug}（${ms}ms）`);
      continue;
    }
    if (r.cached) {
      cached++;
      console.log(`  ✓ ${a.slug} [已有] ${ms}ms`);
    } else {
      fresh++;
      console.log(`  ✓ ${a.slug} [新撰] ${ms}ms ${r.tldr}`);
    }
  }
  console.log(`— 预热完成：新撰 ${fresh} · 已有 ${cached} · 失败 ${failed}（共 ${data.articles.length} 篇）`);
  if (failed > 0) process.exitCode = 1;
}

main();
