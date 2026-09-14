"use client";

import Image from "next/image";
import { Clock, Eye, Flame, Heart } from "lucide-react";
import { motion } from "framer-motion";
import type { Article } from "@/lib/types";
import { CATEGORY_META, formatDate } from "@/lib/types";
import { coverFilter } from "@/lib/utils";

interface WeeklyHotProps {
  articles: Article[];
  loading: boolean;
  onOpen: (article: Article) => void;
}

const RANKS = [
  { cn: "壹", label: "榜首" },
  { cn: "贰", label: "榜眼" },
  { cn: "叁", label: "探花" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

export function WeeklyHot({ articles, loading, onOpen }: WeeklyHotProps) {
  if (loading) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 pb-4 pt-14 sm:px-6" aria-label="本周热门">
        <div className="h-8 w-40 animate-pulse rounded bg-paper-deep" />
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="paper-frame h-40 animate-pulse rounded-md" />
          ))}
        </div>
      </section>
    );
  }

  if (articles.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-14 sm:px-6" aria-label="本周热门">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="heading-bar flex items-center gap-2 font-kai text-2xl font-bold tracking-[0.15em] text-ink md:text-[1.7rem]">
            <Flame className="h-5 w-5 text-vermillion" aria-hidden />
            本周热门
          </h2>
          <p className="mt-2 pl-3.5 font-song text-sm tracking-[0.2em] text-ink-soft">
            阅者如潮 · 众望所归
          </p>
        </div>
        <span className="hidden items-center gap-2 font-song text-xs tracking-[0.2em] text-ink-faint sm:flex">
          <span className="seal-outline px-1.5 py-0.5 text-[0.62rem]">榜</span>
          以阅读量为序
        </span>
      </div>

      <motion.ol
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-6 grid gap-5 md:grid-cols-3"
      >
        {articles.map((a, i) => {
          const meta = CATEGORY_META[a.category];
          const rank = RANKS[i] ?? RANKS[RANKS.length - 1];
          return (
            <motion.li key={a.id} variants={item}>
              <article
                onClick={() => onOpen(a)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onOpen(a);
                }}
                tabIndex={0}
                role="button"
                aria-label={`阅读热门文章：${a.title}`}
                className="paper-frame hover-lift group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermillion/50"
              >
                {/* 榜次水印 */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute -right-1 -top-5 select-none font-kai text-[5.2rem] font-bold leading-none ${
                    i === 0 ? "text-vermillion/12" : "text-ink/8"
                  }`}
                >
                  {rank.cn}
                </span>

                <div className="relative flex items-center gap-3 border-b border-frame/60 bg-paper-deep/40 px-4 py-2.5">
                  {i === 0 ? (
                    <span className="seal-stamp flex h-7 w-7 items-center justify-center text-[0.7rem]">
                      {rank.cn}
                    </span>
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-[4px] border-[1.5px] border-gilt/70 font-kai text-[0.7rem] text-gilt">
                      {rank.cn}
                    </span>
                  )}
                  <span className="font-kai text-xs tracking-[0.25em] text-ink-soft">
                    {rank.label}
                  </span>
                  {meta && (
                    <span className="ml-auto font-song text-[0.68rem] tracking-[0.15em] text-ink-faint">
                      {meta.name}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 items-start gap-3 p-4">
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-sm border border-frame/60">
                    <Image
                      src={a.cover || meta?.cover || "/images/cover-tutorials.png"}
                      alt=""
                      fill
                      className="object-cover"
                      style={{ filter: coverFilter(a.slug) }}
                      sizes="80px"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 font-kai text-[1.02rem] font-bold leading-snug tracking-wide text-ink transition-colors group-hover:text-vermillion">
                      {a.title}
                    </h3>
                    <p className="mt-1 font-song text-[0.68rem] tracking-wider text-ink-faint">
                      {formatDate(a.publishedAt)}
                      <span className="mx-1.5 text-frame">·</span>
                      <Clock className="mr-0.5 inline h-3 w-3 align-[-1px]" />
                      {a.readMinutes} 分钟
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-frame/60 px-4 py-2.5">
                  <span className="flex items-center gap-1 font-song text-xs text-ink-soft">
                    <Eye className="h-3.5 w-3.5 text-gilt" aria-hidden />
                    {a.views} 人读过
                  </span>
                  <span className="flex items-center gap-1 font-song text-xs text-ink-soft">
                    <Heart className="h-3.5 w-3.5 text-vermillion/70" aria-hidden />
                    {a.likes} 人心许
                  </span>
                </div>
              </article>
            </motion.li>
          );
        })}
      </motion.ol>
    </section>
  );
}
