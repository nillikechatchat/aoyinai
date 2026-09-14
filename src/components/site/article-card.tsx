"use client";

import Image from "next/image";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { useSyncExternalStore } from "react";
import type { Article } from "@/lib/types";
import { CATEGORY_META, formatDate } from "@/lib/types";
import { coverFilter } from "@/lib/utils";
import { isRead, subscribeReads } from "@/lib/read-history";

interface ArticleCardProps {
  article: Article;
  onOpen: (article: Article) => void;
  /** 页内序号：用于错开入场动画（可选） */
  index?: number;
}

export function ArticleCard({ article, onOpen, index = 0 }: ArticleCardProps) {
  const meta = CATEGORY_META[article.category];
  // 「读毕」印记：订阅读书记忆，服务端快照恒为未读（避免水合不一致）
  const read = useSyncExternalStore(
    subscribeReads,
    () => isRead(article.slug),
    () => false
  );

  return (
    <article
      onClick={() => onOpen(article)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen(article);
      }}
      tabIndex={0}
      role="button"
      aria-label={`阅读文章：${article.title}`}
      style={{
        animation: `fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) ${Math.min(index * 0.06, 0.42)}s both`,
      }}
      className={`hover-lift group cursor-pointer overflow-hidden rounded-md border border-frame/80 bg-paper-card shadow-[0_2px_10px_-6px_rgba(80,60,20,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermillion/50${article.tldr ? " card-tldr" : ""}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={article.cover || meta?.cover || "/images/cover-tutorials.png"}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ filter: coverFilter(article.slug) }}
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-ink/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {/* 展卷阅读提示 */}
        <div className="cover-reveal pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <span className="cover-reveal-inner flex translate-y-2 items-center gap-2 rounded-full bg-paper/92 px-4 py-2 font-kai text-sm tracking-[0.25em] text-vermillion shadow-lg backdrop-blur-sm transition-transform duration-500 group-hover:translate-y-0">
            <BookOpen className="h-4 w-4" aria-hidden />
            展卷阅读
          </span>
        </div>
        {/* 读毕印记（曾开卷者，右上角斜盖小印） */}
        {read && (
          <span
            className="seal-outline pointer-events-none absolute right-2.5 top-2.5 -rotate-6 bg-paper/85 text-[0.6rem] tracking-[0.15em] text-vermillion shadow-sm backdrop-blur-sm"
            aria-label="已读过此篇"
          >
            读毕
          </span>
        )}
        {meta && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-sm bg-paper/90 px-2 py-1 font-kai text-[0.7rem] tracking-[0.15em] text-ink shadow-sm backdrop-blur-sm">
            <span className="seal-stamp h-4 w-4 text-[0.55rem]">{meta.seal}</span>
            {meta.name}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="card-title line-clamp-2 font-kai text-[1.1rem] font-bold leading-snug tracking-wide text-ink transition-colors group-hover:text-vermillion">
          {article.title}
        </h3>
        {/* 摘要区：有「先生速览」时 hover 换装——摘要渐隐、速览同位渐入（grid 叠放不跳动） */}
        {article.tldr ? (
          <div className="tldr-zone relative mt-2">
            <p className="tldr-brief line-clamp-2 font-song text-[0.85rem] leading-relaxed text-ink-soft">
              {article.excerpt}
            </p>
            <div
              className="tldr-view absolute inset-0 flex items-start gap-2 rounded-sm border-l-2 border-vermillion/70 bg-gilt/[0.07] px-2.5 py-1.5"
              aria-hidden
            >
              <span className="tldr-seal seal-stamp mt-0.5 h-5 w-5 shrink-0 text-[0.6rem]">
                览
              </span>
              <p className="line-clamp-2 font-kai text-[0.82rem] leading-relaxed tracking-wide text-ink">
                {article.tldr}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-2 line-clamp-2 font-song text-[0.85rem] leading-relaxed text-ink-soft">
            {article.excerpt}
          </p>
        )}
        <div className="mt-3.5 flex items-center justify-between border-t border-frame/60 pt-3">
          <span className="font-song text-xs tracking-wider text-ink-faint">
            {formatDate(article.publishedAt)}
            <span className="mx-1.5 text-frame">·</span>
            <Clock className="mr-0.5 inline h-3 w-3 align-[-1px]" />
            {article.readMinutes} 分钟
          </span>
          <span className="flex items-center gap-1.5">
            {article.tldr && (
              <span
                className="seal-stamp tldr-foot h-4 w-4 text-[0.55rem] text-gilt"
                title="悬停可见先生速览"
                aria-hidden
              >
                览
              </span>
            )}
            <ArrowRight
              className="card-arrow h-4 w-4 text-ink-faint transition-all duration-300 group-hover:translate-x-1 group-hover:text-vermillion"
              aria-hidden
            />
          </span>
        </div>
      </div>
    </article>
  );
}
