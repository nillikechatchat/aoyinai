"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { CN_NUM, type Category } from "@/lib/types";

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

interface CategoriesSectionProps {
  categories: Category[];
  onPick: (categoryKey: string) => void;
  totalArticles: number;
}

export function CategoriesSection({ categories, onPick, totalArticles }: CategoriesSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-18" aria-label="七大栏目">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="heading-bar font-kai text-2xl font-bold tracking-[0.15em] text-ink md:text-[1.7rem]">
            七大栏目
          </h2>
          <p className="mt-2 pl-3.5 font-song text-sm tracking-[0.2em] text-ink-soft">
            闻道有先后 · 术业有专攻
          </p>
        </div>
        <p className="font-song text-xs tracking-[0.25em] text-ink-faint">
          共 {totalArticles} 篇 · 周而复新
        </p>
      </div>

      <motion.div variants={gridVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((c, i) => (
          <motion.button
            key={c.key}
            variants={cardVariants}
            whileHover={{ y: -3 }}
            onClick={() => onPick(c.key)}
            className="hover-lift group relative overflow-hidden rounded-md border border-frame/80 bg-paper-card p-5 text-left shadow-[0_2px_10px_-6px_rgba(80,60,20,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermillion/50"
            aria-label={`进入栏目：${c.name}`}
          >
            {/* 淡数字水印 */}
            <span
              className="pointer-events-none absolute -right-2 -top-4 font-kai text-[4.5rem] leading-none text-frame/45 transition-colors duration-500 group-hover:text-vermillion/15"
              aria-hidden
            >
              {CN_NUM[i] ?? "拾"}
            </span>

            <div className="relative">
              <div className="flex items-center gap-2.5">
                <span className="seal-stamp h-8 w-8 text-sm transition-transform duration-300 group-hover:-rotate-6">
                  {c.seal}
                </span>
                <div>
                  <h3 className="font-kai text-lg font-bold tracking-wider text-ink transition-colors group-hover:text-vermillion">
                    {c.name}
                  </h3>
                  <p className="font-song text-[0.65rem] uppercase tracking-[0.25em] text-ink-faint">
                    {c.en}
                  </p>
                </div>
              </div>

              <p className="mt-3 line-clamp-2 min-h-[2.6rem] font-song text-[0.82rem] leading-relaxed text-ink-soft">
                {c.description}
              </p>

              <div className="mt-3.5 flex items-center justify-between border-t border-frame/60 pt-2.5">
                <span className="font-song text-xs tracking-wider text-ink-faint">
                  {c.count ?? 0} 篇
                </span>
                <ArrowUpRight
                  className="h-4 w-4 text-ink-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-vermillion"
                  aria-hidden
                />
              </div>
            </div>
          </motion.button>
        ))}

        {/* 第八格：站训 */}
        <motion.div
          variants={cardVariants}
          className="paper-frame flex flex-col items-center justify-center rounded-md p-5 text-center"
        >
          <p className="font-kai text-lg tracking-[0.3em] text-vermillion">知止不殆</p>
          <p className="mt-2 font-song text-xs leading-6 tracking-[0.15em] text-ink-soft">
            智能有常 · 人文有时
          </p>
          <span className="seal-outline mt-3 h-7 w-7 text-[0.62rem]">守</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
