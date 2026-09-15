"use client";

import { useEffect, useState } from "react";
import { Eye, Telescope } from "lucide-react";
import { SkyCover, type SkyBlog } from "@/components/site/sky-view";

/**
 * 首页观天精选 —— 点击率最高的三篇社区博文
 * 数据为空时整块不渲染（不占版面）
 */
export function SkyPick({ onMore }: { onMore?: () => void }) {
  const [items, setItems] = useState<SkyBlog[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/sky?sort=clicks&limit=3")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setItems(d.items || []);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || items.length === 0) return null;

  const open = (b: SkyBlog) => {
    setItems((prev) => prev.map((it) => (it.id === b.id ? { ...it, clicks: it.clicks + 1 } : it)));
    fetch(`/api/sky/${b.id}/click`, { method: "POST", keepalive: true }).catch(() => {});
    window.open(b.url, "_blank", "noopener,noreferrer");
  };

  return (
    <section aria-label="观天精选" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
      <div className="paper-frame bg-paper-card/60 p-6 md:p-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-3 font-kai text-2xl font-bold tracking-[0.2em] text-ink md:text-3xl">
              <Telescope className="h-6 w-6 text-vermillion" />
              观天精选
              <span className="seal-stamp h-7 w-7 text-xs">天</span>
            </h2>
            <p className="mt-2 font-song text-xs tracking-[0.25em] text-ink-faint">
              社区博文 · 观览者众者为魁
            </p>
          </div>
          {onMore && (
            <button
              onClick={onMore}
              className="font-kai text-sm tracking-[0.2em] text-ink-soft underline-offset-4 transition-colors hover:text-vermillion hover:underline"
            >
              观天全览 →
            </button>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {items.map((b, i) => (
            <article
              key={b.id}
              onClick={() => open(b)}
              className="group cursor-pointer overflow-hidden rounded-lg border border-frame bg-paper-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative h-28 overflow-hidden bg-paper-deep">
                <SkyCover blog={b} />
                <span className="seal-stamp absolute left-2 top-2 h-7 w-7 bg-vermillion/90 text-xs text-[#f7f2e7]">
                  {["魁", "亚", "季"][i]}
                </span>
              </div>
              <div className="p-4">
                <h3 className="truncate font-kai text-base font-bold text-ink transition-colors group-hover:text-vermillion">
                  {b.title}
                </h3>
                <p className="mt-2 flex items-center justify-between font-song text-xs text-ink-faint">
                  <span className="truncate">{b.author ? `@${b.author}` : "无名氏"}</span>
                  <span className="inline-flex shrink-0 items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {b.clicks}
                  </span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
