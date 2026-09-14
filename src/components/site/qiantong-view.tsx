"use client";

import { useEffect, useState } from "react";
import { Compass, Eye, Loader2, ScrollText, Stamp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadInsightCard } from "@/lib/share-card";
import { getSessionId } from "@/lib/session";
import { formatDate } from "@/lib/types";

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

export function QiantongView({ onAsk, refreshKey = 0 }: QiantongViewProps) {
  const [records, setRecords] = useState<InsightRecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stampingId, setStampingId] = useState<string | null>(null);

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
          `/api/insight?limit=24${sid ? `&sessionId=${encodeURIComponent(sid)}` : ""}`
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
        <Button
          onClick={onAsk}
          className="h-10 gap-2 rounded-full bg-pine px-5 font-kai text-sm tracking-[0.2em] text-[#f3efdf] shadow-md transition-colors hover:bg-pine-deep"
        >
          <Compass className="h-4 w-4" aria-hidden />
          再问一事
        </Button>
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
      ) : (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {records.map((r, i) => (
              <article
                key={r.id}
                className="paper-frame hover-lift relative flex flex-col rounded-md p-5"
                style={{ animation: `fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) ${Math.min(i * 0.06, 0.5)}s both` }}
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
                      onClick={() => stampOne(r)}
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
      )}
    </section>
  );
}
