"use client";

import Image from "next/image";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Article } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";

interface TodayReadCardProps {
  article: Article | null;
  loading: boolean;
  onRefresh: () => void;
  onOpen: (article: Article) => void;
}

export function TodayReadCard({ article, loading, onRefresh, onOpen }: TodayReadCardProps) {
  const meta = article ? CATEGORY_META[article.category] : undefined;

  return (
    <aside className="paper-frame relative flex h-fit flex-col rounded-md p-6" aria-label="今日一读">
      {/* 角部装饰 */}
      <span className="absolute left-2 top-2 h-4 w-4 border-l border-t border-gilt/60" aria-hidden />
      <span className="absolute right-2 top-2 h-4 w-4 border-r border-t border-gilt/60" aria-hidden />
      <span className="absolute bottom-2 left-2 h-4 w-4 border-b border-l border-gilt/60" aria-hidden />
      <span className="absolute bottom-2 right-2 h-4 w-4 border-b border-r border-gilt/60" aria-hidden />

      {/* 标题行 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-5 w-[3px] rounded bg-gilt" aria-hidden />
          <h2 className="font-kai text-xl font-bold tracking-[0.2em] text-ink">今日一读</h2>
        </div>
        <span className="font-song text-xs tracking-[0.2em] text-ink-faint">一念起 · 万象生</span>
      </div>

      {loading && !article ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-ink-faint">
          <Loader2 className="h-6 w-6 animate-spin text-gilt" />
          <p className="font-kai text-sm tracking-[0.3em]">翻检文卷中…</p>
        </div>
      ) : article ? (
        <>
          <div className="mt-5 flex items-start gap-4">
            {/* 模拟卦符的栏目印章 */}
            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <span className="seal-stamp h-12 w-12 text-lg">{meta?.seal ?? "读"}</span>
              <span className="font-song text-[0.62rem] tracking-[0.2em] text-ink-faint">
                {meta?.name ?? ""}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <button
                onClick={() => onOpen(article)}
                className="block text-left focus-visible:outline-none"
              >
                <h3 className="font-kai text-[1.35rem] font-bold leading-snug tracking-wide text-ink transition-colors hover:text-vermillion">
                  {article.title}
                </h3>
              </button>
              <p className="mt-1 font-song text-xs tracking-[0.15em] text-ink-faint">
                {article.readMinutes} 分钟 · 读完如晤
              </p>
            </div>
          </div>

          <div className="ink-divider my-4" />

          <p className="line-clamp-4 font-song text-[0.9rem] leading-8 text-ink-soft">
            {article.excerpt}
          </p>

          <Button
            onClick={onRefresh}
            disabled={loading}
            className="mt-5 h-11 w-full gap-2 rounded-full bg-pine font-kai text-[0.95rem] tracking-[0.3em] text-[#f3efdf] shadow-md transition-colors hover:bg-pine-deep disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            换一篇
          </Button>
        </>
      ) : (
        <p className="mt-6 text-center font-song text-sm text-ink-faint">暂无推荐文章</p>
      )}
    </aside>
  );
}
