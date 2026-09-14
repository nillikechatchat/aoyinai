/**
 * TTS 预热脚本：为最热门的前 N 篇文章预合成「摘要档」语音（标题+导语），
 * 落盘于 .tts-cache/，听众首次点击「听文（摘要）」即秒开。
 * 用法：bun run scripts/preheat-tts.ts [topN]（默认 5，需 dev 服务器运行中）
 */
export {};


const API = process.env.PREHEAT_API ?? "http://localhost:3000";
const TOP_N = Number(process.argv[2] ?? 5);

interface ArticleRow {
  slug: string;
  title: string;
  excerpt: string;
  views: number;
}

async function main() {
  console.log(`— TTS 预热：取最热 ${TOP_N} 篇 →`);
  const res = await fetch(`${API}/api/articles?sort=top&limit=${TOP_N}`);
  const data = (await res.json()) as { ok: boolean; articles: ArticleRow[] };
  if (!data.ok || !Array.isArray(data.articles)) {
    console.error("拉取文章失败", data);
    process.exit(1);
  }

  for (const a of data.articles) {
    // 与 article-dialog speechChunks.brief 保持一致
    const brief = `${a.title}。敖胤AI。${a.excerpt}`;
    const t0 = Date.now();
    try {
      const r = await fetch(`${API}/api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: brief }),
      });
      const hit = r.headers.get("X-TTS-Cache");
      const ms = Date.now() - t0;
      console.log(
        `  ${r.ok ? "✓" : "✗"} ${a.slug}（views=${a.views}）${ms}ms ${
          hit === "hit" ? "[缓存命中]" : "[新合成落盘]"
        }`
      );
    } catch (e) {
      console.error(`  ✗ ${a.slug}`, e);
    }
  }
  console.log("— 预热完成");
}

main();
