"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { ArticleCard } from "./article-card";
import type { Article } from "@/lib/types";

interface RecommendSectionProps {
  articles: Article[];
  loading: boolean;
  onOpen: (article: Article) => void;
  onMore: () => void;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

export function RecommendSection({ articles, loading, onOpen, onMore }: RecommendSectionProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6" aria-label="为你随机推荐">
      <div className="flex items-end justify-between gap-3">
        <h2 className="heading-bar font-kai text-2xl font-bold tracking-[0.15em] text-ink md:text-[1.7rem]">
          为你随机推荐
        </h2>
        <button
          onClick={onMore}
          className="group inline-flex items-center gap-1 font-song text-sm tracking-[0.15em] text-ink-soft transition-colors hover:text-vermillion focus-visible:outline-none"
        >
          查看更多文章
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden
          />
        </button>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-md border border-frame/70 bg-paper-card"
            >
              <div className="aspect-[16/10] animate-pulse bg-paper-deep" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-3/4 animate-pulse rounded bg-paper-deep" />
                <div className="h-4 w-full animate-pulse rounded bg-paper-deep/80" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-paper-deep/60" />
              </div>
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <p className="mt-10 text-center font-song text-sm text-ink-faint">
          文卷整理中，稍后再来。
        </p>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
        >
          {articles.map((a) => (
            <motion.div key={a.id} variants={item}>
              <ArticleCard article={a} onOpen={onOpen} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
