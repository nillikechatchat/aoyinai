"use client";

import { Search, X, ChevronDown, Flame, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArticleCard } from "./article-card";
import type { Article, Category } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ArticlesViewProps {
  categories: Category[];
  activeCategory: string; // "all" 或栏目 key
  onCategoryChange: (key: string) => void;
  onOpen: (article: Article) => void;
}

const PAGE_SIZE = 9;

type SortKey = "new" | "top";

const SORTS: Array<{ key: SortKey; label: string; hint: string }> = [
  { key: "new", label: "最新", hint: "按刊行时序" },
  { key: "top", label: "最热", hint: "按读者火候" },
];

export function ArticlesView({
  categories,
  activeCategory,
  onCategoryChange,
  onOpen,
}: ArticlesViewProps) {
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState<SortKey>("new");
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* 首屏 / 筛选 / 搜索 / 排序变化 → 重载第一页 */
  useEffect(() => {
    let cancelled = false;
    const load = async (search: string, sortKey: SortKey) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: "0" });
        if (activeCategory !== "all") params.set("category", activeCategory);
        if (search.trim()) params.set("search", search.trim());
        if (sortKey === "top") params.set("sort", "top");
        const res = await fetch(`/api/articles?${params.toString()}`);
        const data = await res.json();
        if (!cancelled && data.ok) {
          setArticles(data.articles);
          setTotal(data.total);
        }
      } catch {
        // 静默失败
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (keyword) {
      debounceRef.current = setTimeout(() => load(keyword, sort), 350);
    } else {
      load("", sort);
    }
    return () => {
      cancelled = true;
    };
  }, [activeCategory, keyword, sort]);

  /* 加载更多：追加下一页 */
  const loadMore = useCallback(async () => {
    if (loadingMore || articles.length >= total) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(articles.length),
      });
      if (activeCategory !== "all") params.set("category", activeCategory);
      if (keyword.trim()) params.set("search", keyword.trim());
      if (sort === "top") params.set("sort", "top");
      const res = await fetch(`/api/articles?${params.toString()}`);
      const data = await res.json();
      if (data.ok) {
        // 简单去重（防并发竞态）
        setArticles((prev) => {
          const seen = new Set(prev.map((a) => a.id));
          return [...prev, ...data.articles.filter((a: Article) => !seen.has(a.id))];
        });
        setTotal(data.total);
      }
    } catch {
      // 静默失败
    } finally {
      setLoadingMore(false);
    }
  }, [activeCategory, articles.length, keyword, loadingMore, sort, total]);

  const activeName =
    activeCategory === "all"
      ? "全部"
      : categories.find((c) => c.key === activeCategory)?.name ?? "全部";

  const remaining = Math.max(total - articles.length, 0);
  const hasMore = articles.length < total;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6" aria-label="文章列表">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="heading-bar font-kai text-2xl font-bold tracking-[0.15em] text-ink md:text-[1.7rem]">
            文章 {activeName !== "全部" && <span className="text-vermillion">· {activeName}</span>}
          </h2>
          <p className="mt-2 pl-3.5 font-song text-sm tracking-[0.2em] text-ink-soft">
            文以载道 · 字字经心
          </p>
        </div>

        {/* 搜索 */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="检索标题、摘要、标签…"
            className="h-10 rounded-full border-frame bg-paper-card pl-9 pr-9 font-song text-sm placeholder:text-ink-faint/70 focus-visible:ring-vermillion/40"
            aria-label="搜索文章"
          />
          {keyword && (
            <button
              onClick={() => setKeyword("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint transition-colors hover:text-vermillion"
              aria-label="清空搜索"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 分类筛选 + 排序签条 */}
      <div className="mt-6 flex flex-wrap items-center gap-2" role="tablist" aria-label="栏目筛选">
        <Button
          variant={activeCategory === "all" ? "default" : "outline"}
          onClick={() => onCategoryChange("all")}
          className={`h-9 rounded-full px-4 font-kai text-sm tracking-[0.2em] ${
            activeCategory === "all"
              ? "bg-ink text-paper hover:bg-ink/90"
              : "border-frame bg-paper-card text-ink-soft hover:bg-paper-deep hover:text-ink"
          }`}
        >
          全部
        </Button>
        {categories.map((c) => (
          <Button
            key={c.key}
            variant={activeCategory === c.key ? "default" : "outline"}
            onClick={() => onCategoryChange(c.key)}
            className={`h-9 gap-1.5 rounded-full px-4 font-kai text-sm tracking-[0.15em] ${
              activeCategory === c.key
                ? "bg-ink text-paper hover:bg-ink/90"
                : "border-frame bg-paper-card text-ink-soft hover:bg-paper-deep hover:text-ink"
            }`}
          >
            <span className={activeCategory === c.key ? "text-paper" : "text-vermillion"}>{c.seal}</span>
            {c.name}
          </Button>
        ))}

        {/* 排序签条（最新/最热） */}
        <div
          className="ml-auto flex items-center gap-0.5 rounded-full border border-frame bg-paper-deep/60 p-0.5"
          role="group"
          aria-label="排序方式"
        >
          {SORTS.map((s) => {
            const active = sort === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                aria-pressed={active}
                title={s.hint}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 font-kai text-[0.8rem] tracking-[0.2em] transition-all duration-300",
                  active
                    ? "bg-vermillion text-[#f8f3e7] shadow-sm"
                    : "text-ink-soft hover:text-vermillion"
                )}
              >
                {s.key === "top" ? (
                  <Flame className={cn("h-3.5 w-3.5", active && "text-[#f8f3e7]")} aria-hidden />
                ) : (
                  <Sparkles className={cn("h-3.5 w-3.5", active && "text-[#f8f3e7]")} aria-hidden />
                )}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="ink-divider mt-6" />

      {/* 列表 */}
      {loading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-md border border-frame/70 bg-paper-card">
              <div className="aspect-[16/10] animate-pulse bg-paper-deep" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-3/4 animate-pulse rounded bg-paper-deep" />
                <div className="h-4 w-full animate-pulse rounded bg-paper-deep/80" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-paper-deep/60" />
              </div>
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <span className="seal-outline h-12 w-12 text-base">空</span>
          <p className="font-kai text-base tracking-[0.25em] text-ink-soft">检索无果</p>
          <p className="font-song text-xs tracking-[0.15em] text-ink-faint">
            换一个关键词，或换一炷香再来
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {articles.map((a, i) => (
              <ArticleCard key={a.id} article={a} onOpen={onOpen} index={i % PAGE_SIZE} />
            ))}
          </div>

          {/* 加载更多 / 尽览 */}
          <div className="mt-10 flex flex-col items-center gap-3">
            {hasMore ? (
              <Button
                onClick={loadMore}
                disabled={loadingMore}
                variant="outline"
                className="group h-11 gap-2.5 rounded-full border-gilt/60 bg-paper-card px-7 font-kai text-sm tracking-[0.25em] text-ink shadow-sm transition-all hover:border-gilt hover:bg-paper-deep hover:shadow-md disabled:opacity-60"
              >
                {loadingMore ? (
                  <>
                    <span className="seal-stamp h-5 w-5 animate-pulse text-[0.6rem]">展</span>
                    展卷中…
                  </>
                ) : (
                  <>
                    再展一卷
                    <span className="font-song text-xs tracking-normal text-ink-faint">
                      （余 {remaining} 篇）
                    </span>
                    <ChevronDown className="h-4 w-4 text-gilt transition-transform group-hover:translate-y-0.5" aria-hidden />
                  </>
                )}
              </Button>
            ) : (
              <p className="flex items-center gap-3 font-song text-xs tracking-[0.25em] text-ink-faint">
                <span className="h-px w-8 bg-frame" aria-hidden />
                共 {total} 篇 · 尽览于此
                <span className="h-px w-8 bg-frame" aria-hidden />
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
