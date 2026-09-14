"use client";

import Image from "next/image";
import { Clock, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Article } from "@/lib/types";
import { CATEGORY_META, formatDate } from "@/lib/types";

interface ArticleDialogProps {
  article: Article | null;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArticleDialog({ article, loading, onOpenChange }: ArticleDialogProps) {
  const meta = article ? CATEGORY_META[article.category] : undefined;

  return (
    <Dialog open={!!article || loading} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto border-frame bg-paper-card p-0 sm:max-w-2xl custom-scrollbar">
        {loading || !article ? (
          <div className="flex flex-col items-center justify-center gap-4 px-8 py-20">
            <span className="seal-stamp h-12 w-12 animate-pulse text-lg">阅</span>
            <p className="font-kai text-sm tracking-[0.3em] text-ink-faint">展卷中…</p>
          </div>
        ) : (
          <article>
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
                </DialogDescription>
              </DialogHeader>

              <p className="mt-5 rounded-sm border-l-[3px] border-gilt bg-paper-deep/60 px-4 py-3 font-kai text-[0.92rem] leading-relaxed text-ink-soft">
                {article.excerpt}
              </p>

              <div className="prose-guofeng mt-6 custom-scrollbar">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </div>

              {/* 标签 */}
              {article.tags && (
                <div className="mt-8 flex flex-wrap items-center gap-2">
                  {article.tags.split(",").filter(Boolean).map((t) => (
                    <span
                      key={t}
                      className="seal-outline px-2 py-0.5 text-[0.68rem] tracking-[0.1em]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="ink-divider mt-8" />
              <p className="mt-4 flex items-center justify-between font-song text-xs tracking-[0.25em] text-ink-faint">
                <span>敖胤AI · 观智能之潮</span>
                <span className="seal-stamp h-6 w-6 text-[0.62rem]">胤</span>
              </p>
            </div>
          </article>
        )}
      </DialogContent>
    </Dialog>
  );
}
