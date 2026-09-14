"use client";

import Image from "next/image";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import type { Article } from "@/lib/types";
import { CATEGORY_META, formatDate } from "@/lib/types";
import { coverFilter } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
  onOpen: (article: Article) => void;
}

export function ArticleCard({ article, onOpen }: ArticleCardProps) {
  const meta = CATEGORY_META[article.category];
  return (
    <article
      onClick={() => onOpen(article)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen(article);
      }}
      tabIndex={0}
      role="button"
      aria-label={`阅读文章：${article.title}`}
      className="hover-lift group cursor-pointer overflow-hidden rounded-md border border-frame/80 bg-paper-card shadow-[0_2px_10px_-6px_rgba(80,60,20,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermillion/50"
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
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100">
          <span className="flex translate-y-2 items-center gap-2 rounded-full bg-paper/92 px-4 py-2 font-kai text-sm tracking-[0.25em] text-vermillion shadow-lg backdrop-blur-sm transition-transform duration-500 group-hover:translate-y-0">
            <BookOpen className="h-4 w-4" aria-hidden />
            展卷阅读
          </span>
        </div>
        {meta && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-sm bg-paper/90 px-2 py-1 font-kai text-[0.7rem] tracking-[0.15em] text-ink shadow-sm backdrop-blur-sm">
            <span className="seal-stamp h-4 w-4 text-[0.55rem]">{meta.seal}</span>
            {meta.name}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="line-clamp-2 font-kai text-[1.1rem] font-bold leading-snug tracking-wide text-ink transition-colors group-hover:text-vermillion">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 font-song text-[0.85rem] leading-relaxed text-ink-soft">
          {article.excerpt}
        </p>
        <div className="mt-3.5 flex items-center justify-between border-t border-frame/60 pt-3">
          <span className="font-song text-xs tracking-wider text-ink-faint">
            {formatDate(article.publishedAt)}
            <span className="mx-1.5 text-frame">·</span>
            <Clock className="mr-0.5 inline h-3 w-3 align-[-1px]" />
            {article.readMinutes} 分钟
          </span>
          <ArrowRight
            className="h-4 w-4 text-ink-faint transition-all duration-300 group-hover:translate-x-1 group-hover:text-vermillion"
            aria-hidden
          />
        </div>
      </div>
    </article>
  );
}
