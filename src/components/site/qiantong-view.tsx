"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Compass,
  Eye,
  LayoutGrid,
  Loader2,
  ScrollText,
  Stamp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadInsightCard } from "@/lib/share-card";
import { getSessionId } from "@/lib/session";
import { formatDate } from "@/lib/types";
import { cn } from "@/lib/utils";

interface InsightRecordItem {
  id: string;
  question: string;
  name: string;
  oracle: string;
  interpret: string;
  advice: string;
  createdAt: string;
}

interface QiantongViewProps {
  onAsk: () => void;
  /** 变化时重新拉取签筒记录（新增问签后自动刷新） */
  refreshKey?: number;
}

type ViewMode = "cards" | "calendar";

/** 本地日期键：2026-9-14 */
function dayKeyOf(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function QiantongView({ onAsk, refreshKey = 0 }: QiantongViewProps) {
  const [records, setRecords] = useState<InsightRecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stampingId, setStampingId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("cards");

  const stampOne = async (r: InsightRecordItem) => {
    if (stampingId) return;
    setStampingId(r.id);
    try {
      await downloadInsightCard({
        name: r.name,
        oracle: r.oracle,
        interpret: r.interpret,
        question: r.question || undefined,
        createdAt: r.createdAt,
      });
    } catch {
      // 静默：拓印失败不影响浏览
    } finally {
      setStampingId(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const sid = getSessionId();
        const res = await fetch(
          `/api/insight?limit=60${sid ? `&sessionId=${encodeURIComponent(sid)}` : ""}`
        );
        const data = await res.json();
        if (!cancelled && data.ok) setRecords(data.records);
      } catch {
        // 静默
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6" aria-label="我的签筒">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="heading-bar font-kai text-2xl font-bold tracking-[0.15em] text-ink md:text-[1.7rem]">
            我的签筒
          </h2>
          <p className="mt-2 pl-3.5 font-song text-sm tracking-[0.2em] text-ink-soft">
            一念一签 · 皆有回响
          </p>
          <p className="mt-1 flex items-center gap-1 pl-3.5 font-song text-[0.68rem] tracking-[0.12em] text-ink-faint">
            <Eye className="h-3 w-3" aria-hidden />
            签筒随访客留存，仅你可见
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* 视图切换：签卡 / 签历 */}
          {!loading && records.length > 0 && (
            <div
              className="inline-flex h-9 items-center rounded-full border border-frame bg-paper-card p-1"
              role="group"
              aria-label="签筒视图切换"
            >
              <button
                onClick={() => setView("cards")}
                aria-pressed={view === "cards"}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-full px-3 font-kai text-xs tracking-[0.15em] transition-colors",
                  view === "cards"
                    ? "bg-vermillion text-[#f8f3e7] shadow-sm"
                    : "text-ink-faint hover:text-vermillion"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
                签卡
              </button>
              <button
                onClick={() => setView("calendar")}
                aria-pressed={view === "calendar"}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-full px-3 font-kai text-xs tracking-[0.15em] transition-colors",
                  view === "calendar"
                    ? "bg-vermillion text-[#f8f3e7] shadow-sm"
                    : "text-ink-faint hover:text-vermillion"
                )}
              >
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                签历
              </button>
            </div>
          )}
          <Button
            onClick={onAsk}
            className="h-10 gap-2 rounded-full bg-pine px-5 font-kai text-sm tracking-[0.2em] text-[#f3efdf] shadow-md transition-colors hover:bg-pine-deep"
          >
            <Compass className="h-4 w-4" aria-hidden />
            再问一事
          </Button>
        </div>
      </div>

      <div className="ink-divider mt-6" />

      {loading ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="paper-frame h-52 animate-pulse rounded-md" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <span className="seal-outline h-14 w-14 text-lg">筒</span>
          <p className="font-kai text-lg tracking-[0.25em] text-ink-soft">签筒尚空</p>
          <p className="max-w-xs font-song text-xs leading-6 tracking-[0.12em] text-ink-faint">
            心中所惑，皆可叩问。摇动司南，抽得第一支签。
          </p>
          <Button
            onClick={onAsk}
            className="mt-1 h-11 gap-2 rounded-full bg-pine px-6 font-kai tracking-[0.25em] text-[#f3efdf] shadow-md hover:bg-pine-deep"
          >
            <Compass className="h-4 w-4" aria-hidden />
            去司南问一事
          </Button>
        </div>
      ) : view === "cards" ? (
        <CardsBoard records={records} onStamp={stampOne} stampingId={stampingId} />
      ) : (
        <QianCalendar records={records} onAsk={onAsk} />
      )}
    </section>
  );
}

/** 签卡墙（原视图） */
function CardsBoard({
  records,
  onStamp,
  stampingId,
}: {
  records: InsightRecordItem[];
  onStamp: (r: InsightRecordItem) => void;
  stampingId: string | null;
}) {
  return (
    <>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {records.map((r, i) => (
          <article
            key={r.id}
            className="paper-frame hover-lift relative flex flex-col rounded-md p-5"
            style={{
              animation: `fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) ${Math.min(i * 0.06, 0.5)}s both`,
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-kai text-xl font-bold tracking-[0.1em] text-vermillion">
                {r.name}
              </h3>
              <span className="seal-stamp h-7 w-7 shrink-0 text-[0.65rem]">
                {r.name.replace("卦", "").slice(-1) || "签"}
              </span>
            </div>

            <div className="mt-3 rounded-sm border border-frame/70 bg-paper-card/80 px-3 py-2.5 text-center">
              <p className="font-kai text-[0.92rem] leading-relaxed tracking-[0.08em] text-ink">
                「{r.oracle}」
              </p>
            </div>

            {r.question ? (
              <p className="mt-3 flex items-start gap-1.5 font-song text-xs leading-6 text-ink-faint">
                <ScrollText className="mt-1 h-3 w-3 shrink-0 text-gilt" aria-hidden />
                <span className="line-clamp-1">所问：{r.question}</span>
              </p>
            ) : (
              <p className="mt-3 flex items-start gap-1.5 font-song text-xs leading-6 text-ink-faint">
                <ScrollText className="mt-1 h-3 w-3 shrink-0 text-gilt" aria-hidden />
                <span className="line-clamp-1">解曰：{r.interpret}</span>
              </p>
            )}

            <div className="mt-auto flex items-center justify-between border-t border-frame/60 pt-3">
              <span className="font-song text-[0.7rem] tracking-[0.15em] text-ink-faint">
                {formatDate(r.createdAt)}
              </span>
              <span className="flex items-center gap-2">
                <button
                  onClick={() => onStamp(r)}
                  disabled={stampingId === r.id}
                  aria-label={`拓印「${r.name}」签卡为图片`}
                  title="拓印签卡（生成水墨分享图）"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-gilt transition-colors hover:bg-gilt/10 hover:text-vermillion disabled:opacity-50"
                >
                  {stampingId === r.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Stamp className="h-3.5 w-3.5" aria-hidden />
                  )}
                </button>
                <span className="font-kai text-[0.7rem] tracking-[0.3em] text-gilt">敖胤 赐</span>
              </span>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-8 text-center font-song text-xs tracking-[0.25em] text-ink-faint">
        共 {records.length} 支签 · 签文仅供参详，行止仍在己心
      </p>
    </>
  );
}

/** 签历：按月历视图回望问签的日子 */
function QianCalendar({
  records,
  onAsk,
}: {
  records: InsightRecordItem[];
  onAsk: () => void;
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0 起
  const [selected, setSelected] = useState<string | null>(null);

  // 按日聚合（同日按时间倒序）
  const byDay = useMemo(() => {
    const map = new Map<string, InsightRecordItem[]>();
    for (const r of records) {
      const d = new Date(r.createdAt);
      const key = dayKeyOf(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return map;
  }, [records]);

  const shiftMonth = (delta: number) => {
    setSelected(null);
    let m = month + delta;
    let y = year;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setYear(y);
    setMonth(m);
  };

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstDay.getDay(); // 周日=0
  const todayKey = dayKeyOf(now);
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const monthRecords = useMemo(() => {
    return records.filter((r) => {
      const d = new Date(r.createdAt);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [records, year, month]);

  const selectedRecords = selected ? byDay.get(selected) ?? [] : [];
  const daysWithRecords = [...byDay.keys()].filter((k) => {
    const [y, m] = k.split("-").map(Number);
    return y === year && m - 1 === month;
  }).length;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* 月历 */}
      <div className="paper-frame rounded-md p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => shiftMonth(-1)}
            aria-label="上一月"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-frame/70 text-ink-faint transition-colors hover:border-vermillion/50 hover:text-vermillion"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <div className="text-center">
            <p className="font-kai text-lg font-bold tracking-[0.25em] text-ink">
              {year} 年 {month + 1} 月
            </p>
            <p className="mt-0.5 font-song text-[0.68rem] tracking-[0.2em] text-ink-faint">
              本月 {monthRecords.length} 签{isCurrentMonth ? " · 今月之迹" : ""}
            </p>
          </div>
          <button
            onClick={() => shiftMonth(1)}
            aria-label="下一月"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-frame/70 text-ink-faint transition-colors hover:border-vermillion/50 hover:text-vermillion"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* 星期表头 */}
        <div className="mt-5 grid grid-cols-7 gap-1.5 text-center" aria-hidden>
          {["日", "一", "二", "三", "四", "五", "六"].map((w) => (
            <span key={w} className="font-kai text-[0.7rem] tracking-widest text-ink-faint">
              {w}
            </span>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="mt-2 grid grid-cols-7 gap-1.5">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <span key={`blank-${i}`} aria-hidden />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const key = `${year}-${month + 1}-${day}`;
            const dayRecords = byDay.get(key) ?? [];
            const hasRecords = dayRecords.length > 0;
            const isToday = key === todayKey;
            const isSelected = key === selected;
            const sealChar = hasRecords
              ? dayRecords[0].name.replace("卦", "").slice(-1) || "签"
              : "";
            return (
              <button
                key={key}
                onClick={() => setSelected(hasRecords ? (isSelected ? null : key) : null)}
                disabled={!hasRecords}
                aria-label={
                  hasRecords
                    ? `${month + 1}月${day}日，${dayRecords.length} 支签，点击查看`
                    : `${month + 1}月${day}日`
                }
                aria-pressed={isSelected}
                className={cn(
                  "relative flex aspect-square flex-col items-center justify-center rounded-sm border font-song text-[0.78rem] transition-all",
                  hasRecords
                    ? "cursor-pointer border-vermillion/35 bg-vermillion/[0.06] text-ink hover:border-vermillion hover:bg-vermillion/10"
                    : "border-transparent text-ink-faint/60",
                  isToday && !isSelected && "border-gilt/60",
                  isSelected && "border-vermillion bg-vermillion text-[#f8f3e7] shadow-md"
                )}
              >
                <span className={cn("leading-none", isSelected && "text-[#f8f3e7]")}>{day}</span>
                {hasRecords && !isSelected && (
                  <span className="seal-stamp mt-1 h-3.5 w-3.5 text-[0.42rem] leading-none">
                    {sealChar}
                  </span>
                )}
                {hasRecords && !isSelected && dayRecords.length > 1 && (
                  <span className="absolute right-0.5 top-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-vermillion font-song text-[0.5rem] leading-none text-[#f8f3e7]">
                    {dayRecords.length}
                  </span>
                )}
                {isSelected && (
                  <span className="mt-1 font-kai text-[0.55rem] tracking-widest text-[#f8f3e7]/90">
                    {dayRecords.length} 签
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p className="mt-5 border-t border-frame/60 pt-3 text-center font-song text-[0.7rem] tracking-[0.2em] text-ink-faint">
          朱印之日 · 皆有问签
        </p>
      </div>

      {/* 当日签文详情 */}
      <div className="paper-frame flex flex-col rounded-md p-5 sm:p-6">
        {selected ? (
          selectedRecords.length > 0 ? (
            <>
              <div className="flex items-baseline justify-between">
                <h3 className="font-kai text-base font-bold tracking-[0.2em] text-ink">
                  {selected.replace(/-/g, " / ")}
                </h3>
                <span className="font-song text-[0.66rem] tracking-[0.15em] text-ink-faint">
                  {selectedRecords.length} 支
                </span>
              </div>
              <div className="ink-divider mt-3" />
              <div className="custom-scrollbar mt-3 max-h-[26rem] space-y-3.5 overflow-y-auto pr-1">
                {selectedRecords.map((r) => (
                  <article key={r.id} className="rounded-sm border border-frame/60 bg-paper-deep/40 p-3.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-kai text-[1.02rem] font-bold tracking-[0.1em] text-vermillion">
                        {r.name}
                      </h4>
                      <span className="seal-stamp h-6 w-6 text-[0.55rem]">
                        {r.name.replace("卦", "").slice(-1) || "签"}
                      </span>
                    </div>
                    <p className="mt-2 text-center font-kai text-[0.85rem] leading-relaxed tracking-[0.05em] text-ink">
                      「{r.oracle}」
                    </p>
                    {r.question && (
                      <p className="mt-2 flex items-start gap-1 font-song text-[0.7rem] leading-5 text-ink-faint">
                        <ScrollText className="mt-0.5 h-3 w-3 shrink-0 text-gilt" aria-hidden />
                        所问：{r.question}
                      </p>
                    )}
                    <p className="mt-1.5 text-right font-song text-[0.62rem] tracking-wider text-ink-faint/80">
                      {new Date(r.createdAt).toLocaleTimeString("zh-CN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      · 敖胤 赐
                    </p>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <EmptyDayPanel />
          )
        ) : (
          <EmptyDayPanel>
            <p className="font-song text-[0.72rem] leading-6 text-ink-faint">
              {daysWithRecords > 0
                ? `此月 ${daysWithRecords} 个朱印之日，点选任一日可回望当日签文。`
                : "此月尚无问签之迹，摇动司南，为今日落下一枚朱印。"}
            </p>
          </EmptyDayPanel>
        )}

        <div className="mt-auto pt-4">
          <Button
            onClick={onAsk}
            variant="outline"
            className="h-10 w-full gap-2 rounded-full border-frame bg-paper-card font-kai tracking-[0.2em] text-ink-soft hover:bg-paper-deep hover:text-ink"
          >
            <Compass className="h-4 w-4 text-vermillion" aria-hidden />
            今日未问 · 再问一事
          </Button>
        </div>
      </div>
    </div>
  );
}

function EmptyDayPanel({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
      <span className="seal-outline h-11 w-11 text-sm">历</span>
      <p className="font-kai text-sm tracking-[0.25em] text-ink-soft">点选朱印之日</p>
      {children}
    </div>
  );
}
