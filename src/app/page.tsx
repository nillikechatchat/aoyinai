"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { SiteHeader, type ViewKey } from "@/components/site/site-header";
import { Hero } from "@/components/site/hero";
import { RecommendSection } from "@/components/site/recommend-section";
import { WeeklyHot } from "@/components/site/weekly-hot";
import { TodayReadCard } from "@/components/site/today-read-card";
import { CategoriesSection } from "@/components/site/categories-section";
import { ArticlesView } from "@/components/site/articles-view";
import { QiantongView } from "@/components/site/qiantong-view";
import { AboutView } from "@/components/site/about-view";
import { ArticleDialog } from "@/components/site/article-dialog";
import { InsightDialog } from "@/components/site/insight-dialog";
import { SiteFooter } from "@/components/site/site-footer";
import { getSessionId } from "@/lib/session";
import type { Article, Category, Insight } from "@/lib/types";

export default function Home() {
  const [view, setView] = useState<ViewKey>("home");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const [categories, setCategories] = useState<Category[]>([]);
  const [randomArticles, setRandomArticles] = useState<Article[]>([]);
  const [recommendLoading, setRecommendLoading] = useState(true);
  const [hotArticles, setHotArticles] = useState<Article[]>([]);
  const [hotLoading, setHotLoading] = useState(true);
  const [todayArticle, setTodayArticle] = useState<Article | null>(null);
  const [todayLoading, setTodayLoading] = useState(true);

  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [articleLoading, setArticleLoading] = useState(false);
  const [allArticles, setAllArticles] = useState<Article[]>([]);

  const [insightOpen, setInsightOpen] = useState(false);
  const [asking, setAsking] = useState(false);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [insightCount, setInsightCount] = useState(0);

  const [showBackTop, setShowBackTop] = useState(false);

  const mainRef = useRef<HTMLDivElement>(null);
  const todaySlugRef = useRef<string>("");

  /* ---------- 数据加载 ---------- */

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.ok) setCategories(data.categories);
    } catch {
      // 静默
    }
  }, []);

  const loadRandomArticles = useCallback(async () => {
    setRecommendLoading(true);
    try {
      const res = await fetch("/api/articles?random=1&limit=3");
      const data = await res.json();
      if (data.ok) setRandomArticles(data.articles);
    } catch {
      // 静默
    } finally {
      setRecommendLoading(false);
    }
  }, []);

  const loadHotArticles = useCallback(async () => {
    setHotLoading(true);
    try {
      const res = await fetch("/api/articles?sort=top&limit=3");
      const data = await res.json();
      if (data.ok) setHotArticles(data.articles);
    } catch {
      // 静默
    } finally {
      setHotLoading(false);
    }
  }, []);

  const loadTodayArticle = useCallback(async () => {
    setTodayLoading(true);
    try {
      const exclude = todaySlugRef.current ? `&exclude=${todaySlugRef.current}` : "";
      const res = await fetch(`/api/articles?random=1&limit=1${exclude}`);
      const data = await res.json();
      if (data.ok && data.articles?.[0]) {
        const a: Article = data.articles[0];
        todaySlugRef.current = a.slug;
        setTodayArticle(a);
      }
    } catch {
      // 静默
    } finally {
      setTodayLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadRandomArticles();
    loadHotArticles();
    loadTodayArticle();
  }, [loadCategories, loadRandomArticles, loadHotArticles, loadTodayArticle]);

  /* ---------- 回顶按钮 ---------- */

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------- 交互 ---------- */

  const openArticle = useCallback(async (article: Article) => {
    setArticleLoading(true);
    setCurrentArticle(article); // 先展示骨架
    // 惰性拉取全量列表（用于上下篇导航），成功后缓存
    if (allArticles.length === 0) {
      try {
        const res = await fetch("/api/articles?limit=100");
        const data = await res.json();
        if (data.ok) setAllArticles(data.articles);
      } catch {
        // 静默
      }
    }
    try {
      const res = await fetch(`/api/articles/${article.slug}`);
      const data = await res.json();
      if (data.ok) setCurrentArticle(data.article);
    } catch {
      // 保留列表数据兜底
    } finally {
      setArticleLoading(false);
    }
  }, [allArticles.length]);

  const navigate = useCallback((v: ViewKey, category?: string) => {
    setView(v);
    if (category) setActiveCategory(category);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, []);

  const askInsight = useCallback(
    async (
      question: string,
      prev?: { name: string; oracle: string } | null
    ): Promise<Insight | null> => {
      setAsking(true);
      try {
        const res = await fetch("/api/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            sessionId: getSessionId(),
            prevName: prev?.name ?? "",
            prevOracle: prev?.oracle ?? "",
          }),
        });
        const data = await res.json();
        if (data.ok) {
          setInsight(data.insight);
          setInsightCount((c) => c + 1); // 通知签筒刷新
          return data.insight as Insight;
        }
        return null;
      } catch {
        return null;
      } finally {
        setAsking(false);
      }
    },
    []
  );

  const openInsightDialog = useCallback(() => {
    setInsight(null); // 重置签文，展示推演动画
    setInsightOpen(true);
    // 打开即自动起卦（从头部按钮/签筒/关于页进入均可直接得签）
    void askInsight("");
  }, [askInsight]);

  const goArticles = useCallback(() => navigate("articles", "all"), [navigate]);

  return (
    <div ref={mainRef} className="flex min-h-screen flex-col">
      <SiteHeader
        view={view}
        onNavigate={navigate}
        categories={categories}
        onTodayRead={openInsightDialog}
      />

      <main className="flex-1">
        {view === "home" && (
          <>
            <Hero
              asking={asking}
              onOpenDialog={openInsightDialog}
              onOpenQiantong={() => navigate("qiantong")}
              insightCount={insightCount}
            />

            {/* 推荐 + 今日一读 */}
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-16">
              <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
                <RecommendSection
                  articles={randomArticles}
                  loading={recommendLoading}
                  onOpen={openArticle}
                  onMore={goArticles}
                />
                <TodayReadCard
                  article={todayArticle}
                  loading={todayLoading}
                  onRefresh={loadTodayArticle}
                  onOpen={openArticle}
                />
              </div>
            </div>

            {/* 本周热门（按阅读量） */}
            <WeeklyHot
              articles={hotArticles}
              loading={hotLoading}
              onOpen={openArticle}
            />

            <div className="h-14" aria-hidden />

            <CategoriesSection
              categories={categories}
              onPick={(key) => navigate("articles", key)}
              totalArticles={categories.reduce((s, c) => s + (c.count ?? 0), 0)}
            />
          </>
        )}

        {view === "articles" && (
          <ArticlesView
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onOpen={openArticle}
          />
        )}

        {view === "qiantong" && (
          <QiantongView
            refreshKey={insightCount}
            onAsk={() => {
              openInsightDialog();
            }}
          />
        )}

        {view === "about" && <AboutView onAsk={openInsightDialog} />}
      </main>

      <SiteFooter />

      {/* 回到顶部（印章式悬浮按钮） */}
      <AnimatePresence>
        {showBackTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: -4 }}
            exit={{ opacity: 0, scale: 0.6, rotate: 4 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="回到顶部"
            title="回到顶部"
            className="seal-stamp fixed bottom-6 right-5 z-40 flex h-11 w-11 flex-col items-center justify-center gap-0 shadow-lg transition-transform hover:-translate-y-0.5 sm:right-8"
          >
            <ChevronUp className="h-4 w-4" aria-hidden />
            <span className="text-[0.5rem] leading-none">回顶</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 弹窗 */}
      <ArticleDialog
        article={currentArticle}
        loading={articleLoading}
        allArticles={allArticles}
        onOpenChange={(open) => {
          if (!open) setCurrentArticle(null);
        }}
        onNavigate={openArticle}
      />
      <InsightDialog
        open={insightOpen}
        onOpenChange={setInsightOpen}
        loading={asking}
        insight={insight}
        onAsk={askInsight}
        onOpenQiantong={() => {
          setInsightOpen(false);
          navigate("qiantong");
        }}
      />
    </div>
  );
}
