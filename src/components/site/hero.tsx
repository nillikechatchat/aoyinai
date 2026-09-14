"use client";

import Image from "next/image";
import { useState } from "react";
import { Pointer } from "lucide-react";

interface HeroProps {
  asking: boolean;
  onOpenDialog: () => void;
}

export function Hero({ asking, onOpenDialog }: HeroProps) {
  const [pressed, setPressed] = useState(false);

  const handleClick = () => {
    if (asking) return;
    setPressed(true);
    onOpenDialog();
    setTimeout(() => setPressed(false), 600);
  };

  return (
    <section className="relative isolate overflow-hidden" aria-label="司南问事">
      {/* 水墨背景 */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/hero-bg.png"
          alt="水墨山水"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* 与纸面融合的过渡 */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-paper/90 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-paper to-transparent" />
        <div className="absolute inset-x-0 left-0 h-full w-24 bg-gradient-to-r from-paper/60 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-paper/60 to-transparent" />
      </div>

      <div className="mx-auto flex min-h-[540px] max-w-7xl flex-col items-center justify-center px-4 py-14 sm:min-h-[600px] md:py-16">
        {/* 主标题 */}
        <h1 className="font-kai text-4xl font-bold leading-tight tracking-[0.08em] text-ink drop-shadow-[0_2px_6px_rgba(246,241,229,0.9)] sm:text-5xl md:text-6xl">
          点击司南，
          <span className="text-vermillion">问一事</span>
        </h1>
        <p className="mt-4 font-song text-sm tracking-[0.5em] text-ink-soft sm:text-base">
          让古老智慧，与智能此刻相遇
        </p>

        {/* 司南 */}
        <button
          onClick={handleClick}
          disabled={asking}
          aria-label="点击司南，问一事"
          className="group relative mt-6 grid place-items-center focus-visible:outline-none disabled:cursor-wait"
        >
          {/* 光晕 */}
          <div
            className="glow-ring absolute h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(178,138,60,0.4),rgba(178,138,60,0.08)_55%,transparent_70%)] sm:h-56 sm:w-56"
            aria-hidden
          />
          {/* 扩散圈 */}
          <div
            className="absolute h-40 w-40 rounded-full border border-gilt/40 sm:h-52 sm:w-52"
            style={{ animation: "glowPulse 3.2s ease-in-out infinite" }}
            aria-hidden
          />
          <div
            className="absolute h-28 w-28 rounded-full border border-gilt/25 sm:h-36 sm:w-36"
            style={{ animation: "glowPulse 3.2s ease-in-out 1.1s infinite" }}
            aria-hidden
          />
          <Image
            src="/images/artifact-sinan.png"
            alt="青铜司南"
            width={260}
            height={260}
            priority
            unoptimized
            className={`relative w-36 transition-all duration-500 group-hover:scale-105 group-hover:brightness-110 sm:w-44 md:w-52 ${
              pressed ? "scale-95 rotate-6" : "float-slow"
            } ${asking ? "spin-slow" : ""}`}
          />
        </button>

        {/* 点击提示 */}
        <div className="mt-4 flex items-center gap-2 text-vermillion">
          <Pointer className="h-4 w-4 animate-bounce" aria-hidden />
          <span className="font-kai text-sm tracking-[0.3em]">
            {asking ? "司南旋转，天机推演中…" : "点击司南开始"}
          </span>
        </div>
      </div>

      {/* 左侧竖排 */}
      <div className="pointer-events-none absolute left-4 top-1/2 hidden -translate-y-1/2 select-none items-start gap-3 lg:flex xl:left-10">
        <p
          className="text-vertical font-kai text-[0.82rem] leading-7 tracking-[0.35em] text-ink-soft/95"
          style={{ textShadow: "0 1px 3px rgba(246,241,229,0.95), 0 0 10px rgba(246,241,229,0.85)" }}
        >
          一签一世界 · 一问一初心 · 与AI对话 · 也与自己相遇
        </p>
        <span className="seal-stamp mt-1 h-7 w-7 text-[0.68rem]">问</span>
      </div>

      {/* 右上竖排引文 */}
      <div className="pointer-events-none absolute right-4 top-10 hidden select-none items-start gap-3 lg:flex xl:right-10">
        <p
          className="text-vertical font-kai text-[0.82rem] leading-7 tracking-[0.35em] text-ink-soft/95"
          style={{ textShadow: "0 1px 3px rgba(246,241,229,0.95), 0 0 10px rgba(246,241,229,0.85)" }}
        >
          知止而后有定 · 定而后能静 · 静而后能安
        </p>
        <span className="seal-outline mt-1 h-7 px-1 text-[0.6rem] tracking-tight">知止</span>
      </div>

      {/* 右下 */}
      <div className="pointer-events-none absolute bottom-8 right-4 hidden select-none items-start gap-3 lg:flex xl:right-10">
        <p
          className="text-vertical font-kai text-[0.82rem] leading-7 tracking-[0.35em] text-ink-soft/95"
          style={{ textShadow: "0 1px 3px rgba(246,241,229,0.95), 0 0 10px rgba(246,241,229,0.85)" }}
        >
          山水有相逢 · 一问自有一答
        </p>
        <span className="seal-stamp mt-1 h-7 w-7 text-[0.68rem]">答</span>
      </div>
    </section>
  );
}
