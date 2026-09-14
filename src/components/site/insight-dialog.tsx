"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Copy, Loader2, PenLine, RefreshCw, ScrollText, Stamp, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadInsightCard } from "@/lib/share-card";
import { listenToText, stopListening } from "@/lib/listen-insight";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Insight } from "@/lib/types";

interface InsightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  insight: Insight | null;
  onAsk: (question: string) => Promise<Insight | null>;
  onOpenQiantong?: () => void;
}

export function InsightDialog({ open, onOpenChange, loading, insight, onAsk, onOpenQiantong }: InsightDialogProps) {
  const [question, setQuestion] = useState("");
  const [stamping, setStamping] = useState(false);
  const { toast } = useToast();

  const copyInsight = async () => {
    if (!insight) return;
    const text = `【${insight.name}】\n卦辞：${insight.oracle}\n解曰：${insight.interpret}\n宜：${insight.advice}\n—— 敖胤AI · 司南问事`;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "签文已抄录", description: "可粘贴至任意处留作今日之记。" });
    } catch {
      toast({ title: "抄录失败", description: "浏览器暂不支持剪贴板。" });
    }
  };

  const stampInsight = async () => {
    if (!insight || stamping) return;
    setStamping(true);
    try {
      const result = await downloadInsightCard({
        name: insight.name,
        oracle: insight.oracle,
        interpret: insight.interpret,
        advice: insight.advice,
        question: question || undefined,
        createdAt: new Date().toISOString(),
      });
      if (result === "shared") {
        toast({ title: "签卡已递出", description: "感君传阅，与友共签。" });
      } else if (result === "downloaded") {
        toast({ title: "签卡已拓印", description: "水墨签卡已存入下载，可留可赠。" });
      }
      // aborted：用户取消分享，不打扰
    } catch {
      toast({ title: "拓印失败", description: "当前环境暂不支持生成图片。" });
    } finally {
      setStamping(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="paper-frame max-h-[88vh] overflow-y-auto border-none p-0 sm:max-w-md custom-scrollbar"
      >
        {/* a11y：加载态也提供标题 */}
        <DialogTitle className="sr-only">{loading ? "司南推演中" : insight?.name ?? "签文"}</DialogTitle>

        {loading && (
          <div className="flex flex-col items-center gap-5 px-6 py-14 text-center">
            <div className="relative grid place-items-center">
              <div
                className="absolute h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(178,138,60,0.35),transparent_70%)]"
                aria-hidden
              />
              <Image
                src="/images/artifact-sinan.png"
                alt="司南推演中"
                width={120}
                height={120}
                unoptimized
                className="spin-slow w-24"
              />
            </div>
            <div className="space-y-1.5">
              <p className="font-kai text-lg tracking-[0.3em] text-ink">司南旋转</p>
              <p className="font-song text-sm tracking-[0.2em] text-ink-faint">天机推演中，请静候片刻</p>
            </div>
            <div className="flex items-center gap-2 text-gilt">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              <span className="font-song text-xs tracking-widest">敖胤先生正在起卦…</span>
            </div>
          </div>
        )}

        {!loading && insight && (
          <div className="px-6 py-8 sm:px-8">
            <DialogHeader className="space-y-1 text-center">
              <DialogDescription className="font-song text-xs tracking-[0.35em] text-ink-faint">
                敖胤先生 · 赐签
              </DialogDescription>
              <DialogTitle className="mt-1 flex items-center justify-center gap-3">
                <span className="font-kai text-3xl font-bold tracking-[0.12em] text-vermillion">
                  {insight.name}
                </span>
                <span className="seal-stamp h-8 w-8 text-[0.7rem]">签</span>
              </DialogTitle>
            </DialogHeader>

            {/* 卦辞 */}
            <div className="oracle-paper mt-6 rounded-sm border border-frame/80 bg-paper-card px-4 py-3 text-center">
              <p className="font-kai text-[1.05rem] leading-relaxed tracking-[0.15em] text-ink">
                「{insight.oracle}」
              </p>
            </div>

            {/* 解曰（行尾听签） */}
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="font-kai text-sm tracking-[0.25em] text-gilt">解曰</p>
              <ListenButton insight={insight} />
            </div>
            <p className="mt-2 font-song text-[0.92rem] leading-8 text-ink-soft">
              {insight.interpret}
            </p>

            {/* 宜 */}
            <div className="mt-4 rounded-sm border-l-[3px] border-pine bg-pine/5 px-4 py-3">
              <p className="font-kai text-[0.9rem] leading-relaxed tracking-wide text-ink">
                <span className="seal-outline mr-2 inline-flex h-5 w-5 align-[-2px] text-[0.62rem]">宜</span>
                {insight.advice}
              </p>
            </div>

            {/* 操作 */}
            <div className="mt-6 flex items-center gap-3">
              <Button
                onClick={() => onAsk(question)}
                className="h-11 flex-1 gap-2 rounded-full bg-pine font-kai tracking-[0.25em] text-[#f3efdf] hover:bg-pine-deep"
              >
                <RefreshCw className="h-4 w-4" />
                再问一事
              </Button>
              <Button
                variant="outline"
                onClick={copyInsight}
                className="h-11 gap-2 rounded-full border-frame bg-paper-card px-4 font-kai tracking-[0.2em] text-ink-soft hover:bg-paper-deep hover:text-ink"
              >
                <Copy className="h-4 w-4" />
                抄录
              </Button>
              <Button
                variant="outline"
                onClick={stampInsight}
                disabled={stamping}
                aria-label="拓印签卡为图片"
                title="拓印签卡（生成水墨分享图）"
                className="h-11 gap-2 rounded-full border-frame bg-paper-card px-4 font-kai tracking-[0.2em] text-gilt hover:border-gilt/60 hover:bg-gilt/10 hover:text-gilt"
              >
                {stamping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Stamp className="h-4 w-4" />}
                拓印
              </Button>
            </div>

            {/* 签筒入口 */}
            {onOpenQiantong && (
              <button
                onClick={onOpenQiantong}
                className="group mt-3 flex w-full items-center justify-center gap-1.5 font-song text-xs tracking-[0.2em] text-ink-faint transition-colors hover:text-vermillion"
              >
                <ScrollText className="h-3.5 w-3.5" aria-hidden />
                翻看签筒 · 回望旧签
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </button>
            )}

            {/* 定向叩问 */}
            <div className="mt-5">
              <div className="ink-divider" />
              <div className="mt-4 flex items-center gap-2">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onAsk(question);
                  }}
                  maxLength={60}
                  placeholder="若有具体困惑，可先写下所问（可选）"
                  className="h-10 border-frame bg-paper-card font-song text-sm placeholder:text-ink-faint/70 focus-visible:ring-vermillion/40"
                />
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="叩问"
                  onClick={() => onAsk(question)}
                  className="h-10 w-10 shrink-0 border-frame bg-paper-card text-vermillion hover:bg-vermillion hover:text-[#f8f3e7]"
                >
                  <PenLine className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-center font-song text-[0.7rem] tracking-[0.2em] text-ink-faint">
                一念起，万象生 —— 签文仅供参详，行止仍在己心
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** 听签按钮：敖胤先生诵读签文（播放中显示声波律动） */
function ListenButton({ insight }: { insight: Insight }) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const { toast } = useToast();

  const text = `${insight.name}。卦辞曰：${insight.oracle}。解曰：${insight.interpret}。宜：${insight.advice}。敖胤AI，司南问事。`;

  // 卸载（合卷/换签）时停止诵读
  useEffect(() => () => stopListening(), []);

  const toggle = async () => {
    if (state === "loading") return;
    if (state === "playing") {
      stopListening();
      setState("idle");
      return;
    }
    setState("loading");
    const result = await listenToText(text, () => setState("idle"));
    if (result === "error") {
      setState("idle");
      toast({ title: "听签未成", description: "诵签暂时未成，请稍后再试。" });
      return;
    }
    setState("playing");
  };

  return (
    <button
      onClick={toggle}
      aria-label={state === "playing" ? "停止诵读" : "听签（语音诵读签文）"}
      title={state === "playing" ? "停止诵读" : "听签 · 敖胤先生为你诵签"}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1 rounded-full border px-2 transition-colors",
        state === "playing"
          ? "border-gilt/70 bg-gilt/15 text-gilt"
          : "border-frame/70 text-ink-faint hover:border-gilt/60 hover:text-gilt"
      )}
    >
      {state === "loading" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : state === "playing" ? (
        <span className="flex h-3 items-end gap-[2px]" aria-hidden>
          <span className="sound-bar h-3 w-[2px] rounded-full bg-gilt" />
          <span className="sound-bar h-3 w-[2px] rounded-full bg-gilt" />
          <span className="sound-bar h-3 w-[2px] rounded-full bg-gilt" />
          <span className="sound-bar h-3 w-[2px] rounded-full bg-gilt" />
        </span>
      ) : (
        <Volume2 className="h-3.5 w-3.5" aria-hidden />
      )}
      <span className="font-kai text-[0.62rem] tracking-[0.15em]">
        {state === "playing" ? "止" : "听签"}
      </span>
    </button>
  );
}
