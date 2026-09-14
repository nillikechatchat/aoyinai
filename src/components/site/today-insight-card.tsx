"use client";

import { Compass, ScrollText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getSessionId } from "@/lib/session";
import type { Insight } from "@/lib/types";

interface TodayInsightCardProps {
  /** 打开问签弹窗（无签时引导） */
  onAsk: () => void;
  /** 前往签筒（有签时翻看） */
  onOpenQiantong: () => void;
  /** 问签次数变化时重新拉取今日签 */
  refreshKey: number;
}

/** 本地今日零点（ISO），确保「今日」按访客时区计算 */
function localMidnightIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

interface TodayRecord extends Insight {
  id: string;
  name: string;
  oracle: string;
  question?: string;
  createdAt: string;
}

/**
 * 首页「今日签运」小卡：
 * 当日已问 → 展示卦名与卦辞，引去签筒翻看；
 * 当日未问 → 一行引语，直接叩问司南。
 */
export function TodayInsightCard({ onAsk, onOpenQiantong, refreshKey }: TodayInsightCardProps) {
  const [record, setRecord] = useState<TodayRecord | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        sessionId: getSessionId(),
        limit: "1",
        since: localMidnightIso(),
      });
      const res = await fetch(`/api/insight?${params.toString()}`);
      const data = await res.json();
      if (data.ok && data.records?.[0]) {
        setRecord(data.records[0] as TodayRecord);
      } else {
        setRecord(null);
      }
    } catch {
      // 静默：小卡拉取失败不干扰主视觉
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  return (
    <div
      className="paper-frame relative mx-auto mt-8 w-full max-w-md rounded-md px-5 py-4 sm:max-w-lg"
      style={{
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.15s both" : undefined,
      }}
      aria-label="今日签运"
    >
      {/* 角饰 */}
      <span className="pointer-events-none absolute -left-1.5 -top-1.5 h-3 w-3 border-l-2 border-t-2 border-gilt/70" aria-hidden />
      <span className="pointer-events-none absolute -right-1.5 -top-1.5 h-3 w-3 border-r-2 border-t-2 border-gilt/70" aria-hidden />
      <span className="pointer-events-none absolute -bottom-1.5 -left-1.5 h-3 w-3 border-b-2 border-l-2 border-gilt/70" aria-hidden />
      <span className="pointer-events-none absolute -bottom-1.5 -right-1.5 h-3 w-3 border-b-2 border-r-2 border-gilt/70" aria-hidden />

      {loaded && record ? (
        <div className="flex items-center gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3.5">
            <span className="seal-stamp h-10 w-10 shrink-0 text-[0.72rem] leading-tight">
              {record.name.replace("卦", "").slice(-1) || "签"}
            </span>
            <div className="min-w-0">
              <p className="flex items-baseline gap-2">
                <span className="font-song text-[0.62rem] tracking-[0.3em] text-ink-faint">
                  今日签运
                </span>
                <span className="font-kai text-[1.02rem] font-bold tracking-[0.12em] text-vermillion">
                  {record.name}
                </span>
              </p>
              <p className="mt-0.5 truncate font-song text-xs tracking-wider text-ink-soft">
                「{record.oracle}」
              </p>
            </div>
          </div>
          <button
            onClick={onOpenQiantong}
            className="group inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-frame bg-paper px-3.5 font-kai text-xs tracking-[0.18em] text-ink-soft transition-colors hover:border-gilt/60 hover:text-vermillion"
          >
            <ScrollText className="h-3.5 w-3.5 text-gilt transition-colors group-hover:text-vermillion" aria-hidden />
            翻看签筒
          </button>
        </div>
      ) : loaded ? (
        <div className="flex items-center gap-4">
          <p className="min-w-0 flex-1">
            <span className="font-song text-[0.62rem] tracking-[0.3em] text-ink-faint">
              今日签运
            </span>
            <span className="mt-0.5 block truncate font-kai text-sm tracking-[0.2em] text-ink-soft">
              今日未问 · 一念起，可问一事
            </span>
          </p>
          <button
            onClick={onAsk}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-pine px-4 font-kai text-xs tracking-[0.2em] text-[#f3efdf] shadow-sm transition-colors hover:bg-pine-deep"
          >
            <Compass className="h-3.5 w-3.5" aria-hidden />
            去问一卦
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 py-1.5">
          <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-paper-deep" aria-hidden />
          <span className="font-song text-xs tracking-[0.3em] text-ink-faint">签筒轻摇中…</span>
        </div>
      )}
    </div>
  );
}
