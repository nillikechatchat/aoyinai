"use client";

import Image from "next/image";
import { Compass, Github, Mail, ScrollText, TrendingUp, Volume2 } from "lucide-react";
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
  daily: Array<{ date: string; insights: number; comments: number }>;
  categoryDist: Array<{ category: string; count: number; views: number }>;
  tts?: {
    hits: number;
    misses: number;
    hitRate: number | null;
    files: number;
    bytes: number;
  };
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

/** 听闻应声：TTS 诵读次数与磁盘缓存命中率（双色比例条） */
function TtsEcho({
  tts,
}: {
  tts: { hits: number; misses: number; hitRate: number | null; files: number; bytes: number };
}) {
  const total = tts.hits + tts.misses;
  const mb = (tts.bytes / 1024 / 1024).toFixed(1);
  return (
    <div className="rounded-sm border border-frame/60 bg-paper-deep/40 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-song text-[0.66rem] tracking-[0.25em] text-ink-faint">
          <Volume2 className="h-3.5 w-3.5 text-gilt" aria-hidden />
          听闻应声 · 诵读与缓存
        </p>
        <p className="font-song text-[0.66rem] tracking-[0.12em] text-ink-faint">
          <span className="tabular-nums text-ink-soft">{fmt(total)}</span> 回诵读
          {tts.hitRate !== null && (
            <>
              <span className="mx-1.5 text-frame">·</span>
              缓存应声
              <span className="ml-1 font-kai tabular-nums text-vermillion">{tts.hitRate}%</span>
            </>
          )}
          <span className="mx-1.5 text-frame">·</span>
          藏音
          <span className="mx-1 tabular-nums text-ink-soft">{fmt(tts.files)}</span>
          段（{mb} MB）
        </p>
      </div>
      {total > 0 && (
        <div
          className="mt-2.5 flex h-1.5 overflow-hidden rounded-full bg-frame/50"
          role="img"
          aria-label={`缓存命中率 ${tts.hitRate ?? 0}%：${tts.hits} 次命中，${tts.misses} 次新诵`}
        >
          <span
            className="h-full bg-vermillion/80 transition-[width] duration-700"
            style={{ width: `${((tts.hits / total) * 100).toFixed(1)}%` }}
          />
          <span className="h-full flex-1 bg-gilt/40" />
        </div>
      )}
    </div>
  );
}

/** 千分位 */
function fmt(n: number): string {
  return n.toLocaleString("zh-CN");
}

/** 墨迹七日：纯 SVG 迷你折线（问签 / 笔谈 双线，随双主题变色；从 30 日序列取末 7 日） */
function InkSparkline({ daily }: { daily: Array<{ date: string; insights: number; comments: number }> }) {
  const recent = daily.slice(-7);
  if (recent.length === 0) return null;
  const W = 560;
  const H = 118;
  const padX = 34;
  const topY = 22;
  const baseY = 84;
  const maxVal = Math.max(1, ...recent.map((d) => Math.max(d.insights, d.comments)));

  const xAt = (i: number) =>
    padX + (i * (W - padX * 2)) / Math.max(recent.length - 1, 1);
  const yAt = (v: number) => baseY - (v / maxVal) * (baseY - topY);

  const toPoints = (key: "insights" | "comments") =>
    recent.map((d, i) => `${xAt(i)},${yAt(d[key])}`).join(" ");

  return (
    <div className="rounded-sm border border-frame/60 bg-paper-deep/40 px-4 pb-2 pt-3">
      <div className="flex items-center justify-between">
        <p className="font-song text-[0.66rem] tracking-[0.25em] text-ink-faint">
          近七日 · 落墨之痕
        </p>
        <p className="flex items-center gap-4 font-song text-[0.62rem] tracking-[0.1em] text-ink-faint">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-px w-4 bg-vermillion" aria-hidden />
            问签
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-px w-4 bg-gilt" aria-hidden />
            笔谈
          </span>
        </p>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="近七日问签与笔谈数量折线图"
        className="mt-1 h-auto w-full"
      >
        {/* 基线 */}
        <line x1={padX} y1={baseY} x2={W - padX} y2={baseY} stroke="currentColor" strokeOpacity="0.18" strokeDasharray="3 4" className="text-ink" />
        {/* 问签折线 */}
        <polyline
          points={toPoints("insights")}
          fill="none"
          stroke="var(--color-vermillion, #a63c2a)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* 笔谈折线 */}
        <polyline
          points={toPoints("comments")}
          fill="none"
          stroke="var(--color-gilt, #b28a3c)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray="1 0"
        />
        {/* 数据点 + 数值 + 日期 */}
        {recent.map((d, i) => (
          <g key={d.date}>
            {d.insights > 0 && (
              <>
                <circle cx={xAt(i)} cy={yAt(d.insights)} r="3.2" fill="var(--color-vermillion, #a63c2a)" />
                <text x={xAt(i)} y={yAt(d.insights) - 7} textAnchor="middle" fontSize="11" fill="var(--color-vermillion, #a63c2a)">{d.insights}</text>
              </>
            )}
            {d.comments > 0 && (
              <>
                <circle cx={xAt(i)} cy={yAt(d.comments)} r="3.2" fill="var(--color-gilt, #b28a3c)" />
                <text x={xAt(i)} y={yAt(d.comments) - 7} textAnchor="middle" fontSize="11" fill="var(--color-gilt, #b28a3c)">{d.comments}</text>
              </>
            )}
            <text x={xAt(i)} y={H - 6} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity="0.45" className="text-ink">
              {d.date}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/** 墨迹三十日：热力格子（问签 + 笔谈 合计落墨热度，朱红深浅；6 行 × 5 列，从旧到新） */
function InkHeatmap({ daily }: { daily: Array<{ date: string; insights: number; comments: number }> }) {
  if (daily.length === 0) return null;
  const levelOf = (v: number) => (v <= 0 ? 0 : v === 1 ? 1 : v === 2 ? 2 : v <= 4 ? 3 : 4);
  const levelCls = [
    "bg-paper-deep border-frame/50",
    "bg-vermillion/20 border-vermillion/30",
    "bg-vermillion/40 border-vermillion/40",
    "bg-vermillion/65 border-vermillion/50",
    "bg-vermillion border-vermillion/60",
  ];
  const cols = 10; // 每行 10 日，共 3 行
  const rows = Math.ceil(daily.length / cols);
  const totalInk = daily.reduce((s, d) => s + d.insights + d.comments, 0);

  return (
    <div className="mt-4 rounded-sm border border-frame/60 bg-paper-deep/40 px-4 pb-3.5 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-song text-[0.66rem] tracking-[0.25em] text-ink-faint">
          近三十日 · 落墨盈尺（共 {totalInk} 笔）
        </p>
        <p className="flex items-center gap-1 font-song text-[0.62rem] tracking-[0.1em] text-ink-faint">
          淡
          {levelCls.map((c, i) => (
            <span key={i} className={`inline-block h-2.5 w-2.5 rounded-[2px] border ${c}`} aria-hidden />
          ))}
          浓
        </p>
      </div>
      <div className="mt-3 flex flex-col gap-1.5" role="img" aria-label="近三十日问签与笔谈热力图">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-1.5">
            {daily.slice(r * cols, r * cols + cols).map((d) => {
              const v = d.insights + d.comments;
              const lv = levelOf(v);
              return (
                <span
                  key={d.date}
                  title={`${d.date} · 问签 ${d.insights} · 笔谈 ${d.comments}`}
                  className={`h-4 w-4 rounded-[3px] border transition-transform duration-200 hover:scale-125 ${levelCls[lv]} ${lv === 0 ? "border-dashed" : ""}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/** 栏目分布：国风环形图（按篇数份额，中心示总卷数；右侧图例带印章） */
function CategoryDonut({ dist }: { dist: Array<{ category: string; count: number; views: number }> }) {
  if (dist.length === 0) return null;
  const total = dist.reduce((s, d) => s + d.count, 0);
  // 国风七色：朱砂 / 松绿 / 鎏金 / 赭石 / 黛青 / 绛紫 / 苔绿（夜读下自动柔化：用 CSS 变量色 + 透明度）
  const palette = [
    "var(--color-vermillion, #a63c2a)",
    "var(--color-pine, #3d5a47)",
    "var(--color-gilt, #b28a3c)",
    "color-mix(in srgb, var(--color-vermillion, #a63c2a) 55%, var(--color-gilt, #b28a3c))",
    "color-mix(in srgb, var(--color-pine, #3d5a47) 60%, var(--color-ink, #2c2a26))",
    "color-mix(in srgb, var(--color-gilt, #b28a3c) 50%, var(--color-paper, #f3efdf))",
    "color-mix(in srgb, var(--color-vermillion, #a63c2a) 35%, var(--color-pine, #3d5a47))",
  ];

  const R = 44;
  const C = 2 * Math.PI * R;
  // 纯函数式前缀和：第 i 段的起点 = 前 i 段份额之和（避免渲染期变量重赋值）
  const fracs = dist.map((d) => d.count / total);
  const segs = dist.map((d, i) => {
    const frac = fracs[i];
    const before = fracs.slice(0, i).reduce((s, f) => s + f, 0);
    return {
      color: palette[i % palette.length],
      dash: `${(frac * C).toFixed(2)} ${(C - frac * C).toFixed(2)}`,
      offset: (-before * C + C * 0.25).toFixed(2), // 起点左上（-90°）
      ...d,
      frac,
    };
  });

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 rounded-sm border border-frame/60 bg-paper-deep/40 px-4 py-4 sm:flex-row sm:gap-7">
      <svg viewBox="0 0 120 120" className="h-36 w-36 shrink-0" role="img" aria-label="栏目篇数分布环形图">
        {/* 底环 */}
        <circle cx="60" cy="60" r={R} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="15" className="text-ink" />
        {segs.map((s) => (
          <circle
            key={s.category}
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke={s.color}
            strokeWidth="15"
            strokeDasharray={s.dash}
            strokeDashoffset={s.offset}
            className="transition-all duration-700"
          >
            <title>{`${CATEGORY_META[s.category]?.name ?? s.category} ${s.count} 篇`}</title>
          </circle>
        ))}
        <text x="60" y="57" textAnchor="middle" fontSize="20" fontWeight="bold" fill="currentColor" className="text-ink">
          {total}
        </text>
        <text x="60" y="74" textAnchor="middle" fontSize="9" letterSpacing="2" fill="currentColor" fillOpacity="0.5" className="text-ink">
          卷文章
        </text>
      </svg>
      <ul className="grid w-full grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {segs.map((s) => (
          <li key={s.category} className="flex items-center gap-2 font-song text-[0.72rem] tracking-[0.1em] text-ink-soft">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: s.color }}
              aria-hidden
            />
            <span className="seal-outline inline-flex h-4 w-4 shrink-0 items-center justify-center text-[0.5rem] leading-none">
              {CATEGORY_META[s.category]?.seal ?? "文"}
            </span>
            <span className="truncate">{CATEGORY_META[s.category]?.name ?? s.category}</span>
            <span className="ml-auto shrink-0 tabular-nums text-ink-faint">
              {s.count} 篇 · {Math.round(s.frac * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
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
            {/* 趋势与分布：七日折线 + 栏目环形图并排，三十日热力格子整行 */}
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <InkSparkline daily={stats.daily ?? []} />
              <CategoryDonut dist={stats.categoryDist ?? []} />
            </div>
            <InkHeatmap daily={stats.daily ?? []} />
            {stats.tts && <TtsEcho tts={stats.tts} />}

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
