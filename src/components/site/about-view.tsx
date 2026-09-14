"use client";

import Image from "next/image";
import { Compass, Github, Mail, ScrollText, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { CATEGORY_META } from "@/lib/types";

interface AboutViewProps {
  onAsk: () => void;
}

interface SiteStats {
  articles: number;
  views: number;
  likes: number;
  comments: number;
  insights: number;
  topCategory: string | null;
  latestArticle: { title: string; publishedAt: string } | null;
}

const PRINCIPLES = [
  {
    seal: "拙",
    title: "不追风口",
    text: "热点会过时，判断力不会。每篇文章力求经得起三个月后的重读。",
  },
  {
    seal: "深",
    title: "只做深度",
    text: "宁可一周一篇写透，不愿一日十篇掠过。深度是自媒体时代的稀缺品。",
  },
  {
    seal: "人",
    title: "守住人味",
    text: "AI 可以代笔，不可以代思考。所有观点，皆出自一个具体的人。",
  },
];

/** 千分位 */
function fmt(n: number): string {
  return n.toLocaleString("zh-CN");
}

export function AboutView({ onAsk }: AboutViewProps) {
  const [stats, setStats] = useState<SiteStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (!cancelled && data.ok) setStats(data.stats as SiteStats);
      } catch {
        // 静默：看板加载失败不影响关于页
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-6" aria-label="关于本站">
      {/* 题头 */}
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="glow-ring absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(178,138,60,0.3),transparent_70%)]" aria-hidden />
          <Image
            src="/images/artifact-sinan.png"
            alt="司南"
            width={140}
            height={140}
            unoptimized
            className="relative w-24"
          />
        </div>
        <h2 className="mt-4 font-kai text-3xl font-bold tracking-[0.2em] text-ink">
          敖胤<span className="text-vermillion">AI</span>
        </h2>
        <p className="mt-3 font-song text-sm tracking-[0.35em] text-ink-soft">
          观智能之潮 · 守问学之心
        </p>
        <span className="seal-stamp mt-4 h-9 w-9 text-sm">缘起</span>
      </div>

      {/* 缘起 */}
      <div className="paper-frame mt-10 rounded-md p-6 sm:p-8">
        <p className="font-song text-[0.95rem] leading-9 text-ink-soft">
          「敖胤AI」始于一个朴素的疑问：
          <span className="font-kai text-ink">
            当机器越来越会「想」，人应当更会想什么？
          </span>
        </p>
        <p className="mt-4 font-song text-[0.95rem] leading-9 text-ink-soft">
          这里记录我对大模型、智能体与 AI 产业的观察与实践——从 RAG
          调优的深夜，到黑客松通宵的黎明；从课程表里的象牙塔，到云厂商价格战的硝烟。
          七大栏目如七面窗，窗外是同一片正在剧变的天。
        </p>
        <p className="mt-4 font-song text-[0.95rem] leading-9 text-ink-soft">
          站名取「敖」之桀骜与「胤」之承续：
          <span className="font-kai text-ink">
            以不驯服的好奇心提问，以可承续的认真作答。
          </span>
          若你也在这场浪潮里寻找自己的位置，愿这里的一灯如豆，能照你一程。
        </p>
      </div>

      {/* 三条原则 */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {PRINCIPLES.map((p) => (
          <div
            key={p.seal}
            className="rounded-md border border-frame/80 bg-paper-card p-5 text-center transition-colors hover:border-gilt/50"
          >
            <span className="seal-stamp mx-auto h-10 w-10 text-base">{p.seal}</span>
            <h3 className="mt-3 font-kai text-lg font-bold tracking-[0.2em] text-ink">{p.title}</h3>
            <p className="mt-2 font-song text-[0.82rem] leading-7 text-ink-soft">{p.text}</p>
          </div>
        ))}
      </div>

      {/* 墨迹统计（全站数据看板） */}
      <div className="paper-frame mt-8 rounded-md p-6">
        <h3 className="flex items-center gap-2 font-kai text-lg font-bold tracking-[0.2em] text-ink">
          <TrendingUp className="h-4.5 w-4.5 text-gilt" aria-hidden />
          墨迹统计
          <span className="ml-1 font-song text-[0.66rem] font-normal tracking-[0.25em] text-ink-faint">
            此站经营，笔笔有账
          </span>
        </h3>

        {!stats ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-sm border border-frame/60 bg-paper-deep/50 px-3 py-4">
                <div className="mx-auto h-6 w-12 animate-pulse rounded bg-paper-deep" />
                <div className="mx-auto mt-2 h-3 w-8 animate-pulse rounded bg-paper-deep/70" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {(
                [
                  { seal: "文", label: "刊行文章", value: stats.articles },
                  { seal: "阅", label: "累计阅读", value: stats.views },
                  { seal: "许", label: "读者心许", value: stats.likes },
                  { seal: "谈", label: "笔谈留痕", value: stats.comments },
                  { seal: "签", label: "司南问签", value: stats.insights },
                ] as const
              ).map((s, i) => (
                <div
                  key={s.seal}
                  className="group rounded-sm border border-frame/60 bg-paper-deep/50 px-3 py-4 text-center transition-colors hover:border-gilt/50"
                  style={{
                    animation: `fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 0.07}s both`,
                  }}
                >
                  <p className="font-kai text-xl font-bold tabular-nums tracking-wide text-ink transition-colors group-hover:text-vermillion">
                    {fmt(s.value)}
                  </p>
                  <p className="mt-1.5 flex items-center justify-center gap-1.5">
                    <span className="seal-outline h-4 w-4 text-[0.5rem] leading-none">{s.seal}</span>
                    <span className="font-song text-[0.66rem] tracking-[0.2em] text-ink-faint">
                      {s.label}
                    </span>
                  </p>
                </div>
              ))}
            </div>
            {/* 注脚：最热栏目 / 最近刊行 */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-frame/60 pt-3">
              <p className="flex items-center gap-2 font-song text-[0.7rem] tracking-[0.12em] text-ink-faint">
                <span className="seal-stamp h-4 w-4 text-[0.5rem]">热</span>
                最热栏目：
                <span className="text-ink-soft">
                  {stats.topCategory
                    ? CATEGORY_META[stats.topCategory]?.name ?? stats.topCategory
                    : "——"}
                </span>
              </p>
              {stats.latestArticle && (
                <p className="flex min-w-0 items-center gap-2 font-song text-[0.7rem] tracking-[0.12em] text-ink-faint">
                  <span className="shrink-0">最近刊行：</span>
                  <span className="truncate text-ink-soft">{stats.latestArticle.title}</span>
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* 栏目一览 */}
      <div className="mt-8 rounded-md border border-frame/80 bg-paper-card p-6">
        <h3 className="flex items-center gap-2 font-kai text-lg font-bold tracking-[0.2em] text-ink">
          <ScrollText className="h-4.5 w-4.5 text-gilt" aria-hidden />
          栏目一览
        </h3>
        <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <div key={key} className="flex items-start gap-3">
              <span className="seal-stamp mt-0.5 h-6 w-6 shrink-0 text-[0.65rem]">{meta.seal}</span>
              <div>
                <p className="font-kai text-sm tracking-[0.15em] text-ink">{meta.name}</p>
                <p className="mt-0.5 font-song text-xs leading-6 text-ink-faint">{meta.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 联系与问签 */}
      <div className="mt-8 flex flex-col items-center gap-4 rounded-md border border-frame/80 bg-paper-card px-6 py-8 text-center">
        <p className="font-kai text-base tracking-[0.25em] text-ink">山水有相逢，来日皆可期</p>
        <p className="font-song text-xs leading-6 tracking-[0.15em] text-ink-faint">
          合作、勘误、煮茶论道，皆可来信
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="mailto:hi@aoyinai.com"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-frame bg-paper px-5 font-kai text-sm tracking-[0.2em] text-ink-soft transition-colors hover:border-vermillion/50 hover:text-vermillion"
          >
            <Mail className="h-4 w-4" aria-hidden />
            hi@aoyinai.com
          </a>
          <a
            href="https://github.com/nillikechatchat/aoyinai"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-frame bg-paper px-5 font-kai text-sm tracking-[0.2em] text-ink-soft transition-colors hover:border-vermillion/50 hover:text-vermillion"
          >
            <Github className="h-4 w-4" aria-hidden />
            GitHub
          </a>
        </div>
        <button
          onClick={onAsk}
          className="mt-2 inline-flex h-11 items-center gap-2 rounded-full bg-pine px-6 font-kai text-sm tracking-[0.25em] text-[#f3efdf] shadow-md transition-colors hover:bg-pine-deep"
        >
          <Compass className="h-4 w-4" aria-hidden />
          去司南问一事
        </button>
      </div>
    </section>
  );
}
