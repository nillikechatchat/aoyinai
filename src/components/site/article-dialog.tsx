"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Eye, Heart, ListTree } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Article } from "@/lib/types";
import { CATEGORY_META, formatDate } from "@/lib/types";
import { ArticleComments } from "@/components/site/article-comments";

interface ArticleDialogProps {
  article: Article | null;
  loading: boolean;
  /** 全量文章列表（用于同栏目上一篇/下一篇导航） */
  allArticles: Article[];
  onOpenChange: (open: boolean) => void;
  /** 点击上一篇/下一篇时切换文章 */
  onNavigate: (article: Article) => void;
}

/** 从 markdown 提取 h2 标题作为目录 */
function extractToc(content: string): string[] {
  const out: string[] = [];
  const re = /^##\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null && out.length < 12) {
    out.push(m[1].replace(/[*`~\[\]]/g, "").trim());
  }
  return out;
}

const LIKED_KEY = "aoyin_liked_slugs";

function getLikedSlugs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LIKED_KEY) || "[]");
  } catch {
    return [];
  }
}

export function ArticleDialog({
  article,
  loading,
  allArticles,
  onOpenChange,
  onNavigate,
}: ArticleDialogProps) {
  return (
    <Dialog open={!!article || loading} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="flex max-h-[88vh] flex-col gap-0 overflow-hidden border-frame bg-paper-card p-0 sm:max-w-2xl"
      >
        {/* a11y：加载态也提供标题 */}
        <DialogTitle className="sr-only">
          {loading ? "文章加载中" : article?.title ?? "文章"}
        </DialogTitle>

        {loading || !article ? (
          <div className="flex flex-col items-center justify-center gap-4 px-8 py-20">
            <span className="seal-stamp h-12 w-12 animate-pulse text-lg">阅</span>
            <p className="font-kai text-sm tracking-[0.3em] text-ink-faint">展卷中…</p>
          </div>
        ) : (
          <ArticleBody
            key={article.slug}
            article={article}
            allArticles={allArticles}
            onNavigate={onNavigate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

/** 正文体：key 重挂载隔离状态（切换文章时自动重置进度/点赞/目录） */
function ArticleBody({
  article,
  allArticles,
  onNavigate,
}: {
  article: Article;
  allArticles: Article[];
  onNavigate: (article: Article) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [activeToc, setActiveToc] = useState(-1);
  const [liked, setLiked] = useState(() => getLikedSlugs().includes(article.slug));
  const [likeCount, setLikeCount] = useState(article.likes);

  const meta = CATEGORY_META[article.category];
  const toc = useMemo(() => extractToc(article.content), [article]);
  const wordCount = useMemo(
    () => article.content.replace(/\s/g, "").length,
    [article]
  );

  /* 同栏目上一篇/下一篇（首尾循环） */
  const { prev, next } = useMemo(() => {
    const siblings = allArticles.filter((a) => a.category === article.category && a.slug !== article.slug);
    if (siblings.length === 0) return { prev: null, next: null };
    // 以全量列表中的相对顺序为准
    const idxInAll = allArticles.findIndex((a) => a.slug === article.slug);
    const sameCat = allArticles.filter((a) => a.category === article.category);
    const pos = sameCat.findIndex((a) => a.slug === article.slug);
    void idxInAll;
    const p = sameCat[(pos - 1 + sameCat.length) % sameCat.length];
    const n = sameCat[(pos + 1) % sameCat.length];
    return {
      prev: p && p.slug !== article.slug ? p : (siblings[siblings.length - 1] ?? null),
      next: n && n.slug !== article.slug ? n : (siblings[0] ?? null),
    };
  }, [article, allArticles]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(el.scrollTop / max, 1) : 0);

    // TOC scroll-spy：取视口上沿 +120px 之前最近的小节
    const headings = el.querySelectorAll<HTMLElement>("[data-h2]");
    if (headings.length > 0) {
      const line = el.scrollTop + 140;
      let active = -1;
      headings.forEach((h) => {
        if (h.offsetTop <= line) active = Number(h.dataset.h2);
      });
      // 滚动到底部时强制最后一节
      if (max > 0 && el.scrollTop / max > 0.92) active = toc.length - 1;
      setActiveToc(active);
    }
  };

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikeCount((c) => c + 1);
    try {
      localStorage.setItem(
        LIKED_KEY,
        JSON.stringify([...getLikedSlugs(), article.slug].slice(-200))
      );
      await fetch(`/api/articles/${article.slug}/like`, { method: "POST" });
    } catch {
      // 本地已生效，接口失败静默
    }
  };

  const scrollToHeading = (index: number) => {
    const el = scrollRef.current?.querySelector(`[data-h2="${index}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* 阅读进度条（flex 列顶部固定行） */}
      <div className="relative z-20 h-[3px] shrink-0 bg-frame/40">
        <div
          className="reading-progress absolute inset-y-0 left-0"
          style={{ width: `${Math.round(progress * 100)}%` }}
          aria-hidden
        />
      </div>

      {/* 目录 chips（含 scroll-spy 高亮） */}
      {toc.length >= 3 && (
        <div className="border-b border-frame/70 bg-paper-deep/40 px-5 py-2.5 sm:px-8">
          <button
            onClick={() => setShowToc((v) => !v)}
            className="inline-flex items-center gap-1.5 font-kai text-xs tracking-[0.2em] text-ink-soft transition-colors hover:text-vermillion"
            aria-expanded={showToc}
          >
            <ListTree className="h-3.5 w-3.5" aria-hidden />
            目录（{toc.length}）
            {activeToc >= 0 && !showToc && (
              <span className="ml-1 max-w-[10rem] truncate font-song normal-case tracking-normal text-vermillion/80">
                {toc[activeToc]}
              </span>
            )}
            <span className="text-[0.6rem]">{showToc ? "▲" : "▼"}</span>
          </button>
          {showToc && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {toc.map((t, i) => (
                <button
                  key={i}
                  onClick={() => scrollToHeading(i)}
                  aria-current={activeToc === i ? "true" : undefined}
                  className={cn(
                    "rounded-full border px-2.5 py-1 font-song text-[0.7rem] transition-colors",
                    activeToc === i
                      ? "border-vermillion bg-vermillion/10 text-vermillion"
                      : "border-frame bg-paper-card text-ink-soft hover:border-vermillion/50 hover:text-vermillion"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 可滚动正文 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto custom-scrollbar"
      >
        <div className="relative aspect-[21/9] w-full overflow-hidden">
          <Image
            src={article.cover || meta?.cover || "/images/cover-tutorials.png"}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 672px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            {meta && (
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-paper/90 px-2 py-1 font-kai text-[0.72rem] tracking-[0.15em] text-ink">
                <span className="seal-stamp h-4 w-4 text-[0.55rem]">{meta.seal}</span>
                {meta.name}
              </span>
            )}
          </div>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <DialogHeader className="space-y-3 text-left">
            <DialogTitle className="font-kai text-2xl font-bold leading-snug tracking-wide text-ink sm:text-[1.7rem]">
              {article.title}
            </DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 font-song text-xs tracking-wider text-ink-faint">
              <span>{formatDate(article.publishedAt)}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {article.readMinutes} 分钟
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3 w-3" /> {article.views} 人读过
              </span>
              <span className="inline-flex items-center gap-1">约 {wordCount} 字</span>
            </DialogDescription>
          </DialogHeader>

          <p className="mt-5 rounded-sm border-l-[3px] border-gilt bg-paper-deep/60 px-4 py-3 font-kai text-[0.92rem] leading-relaxed text-ink-soft">
            {article.excerpt}
          </p>

          <div className="prose-guofeng mt-6">
            <ReactMarkdown
              components={{
                h2: ({ children, ...props }) => {
                  const text = String(children).replace(/[*`~\[\]]/g, "").trim();
                  const idx = toc.findIndex((t) => t === text);
                  return (
                    <h2 data-h2={idx >= 0 ? idx : undefined} {...props}>
                      {children}
                    </h2>
                  );
                },
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>

          {/* 标签 + 点赞 */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {article.tags
                .split(",")
                .filter(Boolean)
                .map((t) => (
                  <span
                    key={t}
                    className="seal-outline px-2 py-0.5 text-[0.68rem] tracking-[0.1em]"
                  >
                    {t}
                  </span>
                ))}
            </div>

            <button
              onClick={handleLike}
              disabled={liked}
              aria-pressed={liked}
              className={cn(
                "group inline-flex h-10 items-center gap-2 rounded-full border px-4 font-kai text-sm tracking-[0.15em] transition-all",
                liked
                  ? "border-vermillion bg-vermillion text-[#f8f3e7] shadow-md"
                  : "border-frame bg-paper-card text-ink-soft hover:border-vermillion/60 hover:text-vermillion"
              )}
            >
              <Heart
                className={cn("h-4 w-4 transition-transform", liked && "fill-current scale-110")}
                aria-hidden
              />
              {liked ? "已心许" : "心许"}
              <span className="font-song text-xs opacity-80">{likeCount}</span>
            </button>
          </div>

          <div className="ink-divider mt-8" />

          {/* 同栏目上一篇 / 下一篇 */}
          {(prev || next) && (
            <nav aria-label="上下篇" className="mt-6 grid gap-3 sm:grid-cols-2">
              {prev ? (
                <button
                  onClick={() => onNavigate(prev)}
                  className="group flex items-center gap-3 rounded-md border border-frame/70 bg-paper-card px-4 py-3 text-left transition-all hover:border-vermillion/40 hover:bg-paper-deep/50"
                >
                  <ChevronLeft
                    className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-hover:-translate-x-0.5 group-hover:text-vermillion"
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className="block font-kai text-[0.68rem] tracking-[0.3em] text-ink-faint">
                      前一篇
                    </span>
                    <span className="mt-0.5 block truncate font-kai text-[0.86rem] text-ink transition-colors group-hover:text-vermillion">
                      {prev.title}
                    </span>
                  </span>
                </button>
              ) : (
                <span aria-hidden />
              )}
              {next ? (
                <button
                  onClick={() => onNavigate(next)}
                  className="group flex items-center justify-end gap-3 rounded-md border border-frame/70 bg-paper-card px-4 py-3 text-right transition-all hover:border-vermillion/40 hover:bg-paper-deep/50"
                >
                  <span className="min-w-0">
                    <span className="block font-kai text-[0.68rem] tracking-[0.3em] text-ink-faint">
                      后一篇
                    </span>
                    <span className="mt-0.5 block truncate font-kai text-[0.86rem] text-ink transition-colors group-hover:text-vermillion">
                      {next.title}
                    </span>
                  </span>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-vermillion"
                    aria-hidden
                  />
                </button>
              ) : (
                <span aria-hidden />
              )}
            </nav>
          )}

          {/* 笔谈（匿名留言板） */}
          <ArticleComments slug={article.slug} />

          <div className="ink-divider mt-8" />
          <p className="mt-4 flex items-center justify-between font-song text-xs tracking-[0.25em] text-ink-faint">
            <span>敖胤AI · 观智能之潮</span>
            <span className="seal-stamp h-6 w-6 text-[0.62rem]">胤</span>
          </p>
        </div>
      </div>
    </>
  );
}
