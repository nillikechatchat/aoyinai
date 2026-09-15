"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, ExternalLink, Github, Loader2, RefreshCw, Telescope, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface SkyBlog {
  id: string;
  issueNumber: number;
  title: string;
  url: string;
  description: string;
  author: string;
  avatar: string;
  ogImage: string;
  clicks: number;
  createdAt: string;
}

interface SkyViewProps {
  onOpenQiantong?: () => void;
}

export function SkyView(_props: SkyViewProps) {
  const [items, setItems] = useState<SkyBlog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [sort, setSort] = useState<"clicks" | "new">("clicks");

  const load = useCallback(async (s: "clicks" | "new" = sort) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sky?sort=${s}&limit=60`);
      const d = await res.json();
      if (d.ok) {
        setItems(d.items || []);
        setTotal(d.total || 0);
      } else {
        toast.error(d.error || "观天数据获取失败");
      }
    } catch {
      toast.error("网络异常，观天数据获取失败");
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    load(sort);
  }, [sort]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/sky/sync", { method: "POST" });
      const d = await res.json();
      if (d.ok) {
        toast.success(
          d.skipped ? "同步进行中，稍候片刻" : `同步完成：新增 ${d.added ?? 0} · 更新 ${d.updated ?? 0} · 预览抓取 ${d.ogFetched ?? 0}`
        );
        await load();
      } else {
        toast.error(d.error || "同步失败，请稍后再试");
      }
    } catch {
      toast.error("网络异常，同步失败");
    } finally {
      setSyncing(false);
    }
  };

  const openBlog = (b: SkyBlog) => {
    // 点击率 +1（乐观更新，失败静默）
    setItems((prev) => prev.map((it) => (it.id === b.id ? { ...it, clicks: it.clicks + 1 } : it)));
    fetch(`/api/sky/${b.id}/click`, { method: "POST", keepalive: true }).catch(() => {});
    window.open(b.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14">
      {/* 标题区 */}
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="flex items-center gap-4">
          <h1 className="font-kai text-4xl font-bold tracking-[0.25em] text-ink md:text-5xl">观天</h1>
          <span className="seal-stamp h-10 w-10 text-base">天</span>
        </div>
        <p className="mt-4 font-song text-sm tracking-[0.3em] text-ink-soft md:text-base">
          仰观宇宙之大 · 俯察博文之盛
        </p>
        <p className="mt-2 max-w-xl font-song text-xs leading-relaxed text-ink-faint">
          天下博客，如繁星列宿。去 GitHub 提一个 Issue，你的博客便在此列宿之中；
          被观览越多，星辰越亮（按点击率排序）。
        </p>
      </div>

      {/* 工具栏 */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-full border border-frame bg-paper-card p-1">
          <button
            onClick={() => setSort("clicks")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-kai text-sm tracking-[0.15em] transition-colors ${
              sort === "clicks" ? "bg-pine text-[#f3efdf]" : "text-ink-soft hover:text-ink"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            观星榜
          </button>
          <button
            onClick={() => setSort("new")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-kai text-sm tracking-[0.15em] transition-colors ${
              sort === "new" ? "bg-pine text-[#f3efdf]" : "text-ink-soft hover:text-ink"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            最新收录
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={syncing}
            className="h-10 gap-2 rounded-full border-frame bg-paper-card font-kai tracking-[0.12em] text-ink hover:bg-paper-deep"
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            重新同步
          </Button>
          <Button
            asChild
            className="h-10 gap-2 rounded-full bg-vermillion font-kai tracking-[0.12em] text-[#f7f2e7] shadow-md hover:bg-vermillion/90"
          >
            <a href={NEW_ISSUE_URL} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" />
              收录我的博客
            </a>
          </Button>
        </div>
      </div>

      {/* 统计 */}
      <p className="mb-6 text-right font-song text-xs tracking-[0.2em] text-ink-faint">
        已收录 <span className="text-vermillion">{total}</span> 篇博文
      </p>

      {/* 列表 */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-frame bg-paper-card">
              <div className="h-40 animate-pulse bg-paper-deep" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded bg-paper-deep" />
                <div className="h-4 w-full animate-pulse rounded bg-paper-deep" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-paper-deep" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="paper-frame mx-auto max-w-xl px-8 py-16 text-center">
          <Telescope className="mx-auto h-12 w-12 text-ink-faint" />
          <h2 className="mt-4 font-kai text-xl tracking-[0.2em] text-ink">天幕初开，星辰待收</h2>
          <p className="mt-3 font-song text-sm leading-relaxed text-ink-soft">
            尚未有博客被收录。去 GitHub 提一个 Issue，写下博客地址与介绍，
            点「重新同步」，你的博客便会在观天中升起。
          </p>
          <Button asChild className="mt-6 gap-2 rounded-full bg-vermillion font-kai tracking-[0.15em] text-[#f7f2e7] hover:bg-vermillion/90">
            <a href={NEW_ISSUE_URL} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" />
              去开第一个 Issue
            </a>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b, idx) => (
            <BlogCard key={b.id} blog={b} rank={sort === "clicks" ? idx + 1 : undefined} onOpen={() => openBlog(b)} />
          ))}
        </div>
      )}
    </div>
  );
}

const NEW_ISSUE_URL =
  "https://github.com/nillikechatchat/aoyinai/issues/new?title=" +
  encodeURIComponent("博客名：你的博客标题") +
  "&body=" +
  encodeURIComponent("博客地址：https://your-blog.example.com\n介绍：用一两句话介绍你的博客，让同好一眼看懂。");

/** 预览图三级兑底：库内抓取图 → mshots 实时截图 → 水墨字样 */
export function SkyCover({ blog: b, className }: { blog: SkyBlog; className?: string }) {
  const [stage, setStage] = useState<0 | 1 | 2>(b.ogImage.trim() ? 0 : 1);
  const src =
    stage === 0
      ? b.ogImage.trim()
      : `https://s0.wp.com/mshots/v1/${encodeURIComponent(b.url)}?w=800&h=500`;
  if (stage === 2) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-paper-deep via-paper-card to-paper-deep ${className || ""}`}>
        <span className="font-kai text-4xl tracking-[0.4em] text-ink-faint/60">博 文</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={`${b.title} 预览图`}
      loading="lazy"
      className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${className || ""}`}
      onError={() => setStage((s) => (s === 0 ? 1 : 2))}
    />
  );
}

function BlogCard({ blog: b, rank, onOpen }: { blog: SkyBlog; rank?: number; onOpen: () => void }) {
  return (
    <article
      onClick={onOpen}
      className="group cursor-pointer overflow-hidden rounded-lg border border-frame bg-paper-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      {/* 预览图 */}
      <div className="relative h-40 overflow-hidden bg-paper-deep">
        <SkyCover blog={b} />
        {rank !== undefined && rank <= 3 && (
          <span className="seal-stamp absolute left-3 top-3 h-8 w-8 bg-vermillion/90 text-sm text-[#f7f2e7]">
            {rank === 1 ? "魁" : rank === 2 ? "亚" : "季"}
          </span>
        )}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-ink/70 px-2.5 py-1 font-song text-[0.7rem] text-[#f3efdf] backdrop-blur-sm">
          <Eye className="h-3 w-3" />
          {b.clicks}
        </span>
      </div>

      {/* 文字区 */}
      <div className="p-5">
        <h3 className="truncate font-kai text-lg font-bold tracking-wide text-ink transition-colors group-hover:text-vermillion">
          {b.title}
        </h3>
        {b.description && (
          <p className="mt-2 line-clamp-2 min-h-[2.5rem] font-song text-sm leading-relaxed text-ink-soft">
            {b.description}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-frame pt-3">
          <div className="flex min-w-0 items-center gap-2">
            {b.avatar ? (
              <img src={b.avatar} alt={`${b.author} 头像`} className="h-5 w-5 rounded-full border border-frame" />
            ) : (
              <span className="seal-stamp h-5 w-5 text-[0.55rem]">友</span>
            )}
            <span className="truncate font-song text-xs text-ink-faint">
              {b.author ? `@${b.author}` : "无名氏"}
            </span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 font-song text-[0.7rem] text-ink-faint transition-colors group-hover:text-vermillion">
            <ExternalLink className="h-3 w-3" />
            造访
          </span>
        </div>
      </div>
    </article>
  );
}
