"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SiteHeader, type ViewKey } from "@/components/site/site-header";
import { Hero } from "@/components/site/hero";
import { RecommendSection } from "@/components/site/recommend-section";
import { TodayReadCard } from "@/components/site/today-read-card";
import { CategoriesSection } from "@/components/site/categories-section";
import { ArticlesView } from "@/components/site/articles-view";
import { AboutView } from "@/components/site/about-view";
import { ArticleDialog } from "@/components/site/article-dialog";
import { InsightDialog } from "@/components/site/insight-dialog";
import { SiteFooter } from "@/components/site/site-footer";
import type { Article, Category, Insight } from "@/lib/types";

export default function Home() {
  const [view, setView] = useState<ViewKey>("home");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const [categories, setCategories] = useState<Category[]>([]);
  const [randomArticles, setRandomArticles] = useState<Article[]>([]);
  const [recommendLoading, setRecommendLoading] = useState(true);
  const [todayArticle, setTodayArticle] = useState<Article | null>(null);
  const [todayLoading, setTodayLoading] = useState(true);

  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [articleLoading, setArticleLoading] = useState(false);

  const [insightOpen, setInsightOpen] = useState(false);
  const [asking, setAsking] = useState(false);
  const [insight, setInsight] = useState<Insight | null>(null);

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
    loadTodayArticle();
  }, [loadCategories, loadRandomArticles, loadTodayArticle]);

  /* ---------- 交互 ---------- */

  const openArticle = useCallback(async (article: Article) => {
    setArticleLoading(true);
    setCurrentArticle(article); // 先展示骨架
    try {
      const res = await fetch(`/api/articles/${article.slug}`);
      const data = await res.json();
      if (data.ok) setCurrentArticle(data.article);
    } catch {
      // 保留列表数据兜底
    } finally {
      setArticleLoading(false);
    }
  }, []);

  const navigate = useCallback((v: ViewKey, category?: string) => {
    setView(v);
    if (category) setActiveCategory(category);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, []);

  const askInsight = useCallback(async (question: string): Promise<Insight | null> => {
    setAsking(true);
    try {
      const res = await fetch("/api/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (data.ok) {
        setInsight(data.insight);
        return data.insight as Insight;
      }
      return null;
    } catch {
      return null;
    } finally {
      setAsking(false);
    }
  }, []);

  const openInsightDialog = useCallback(() => {
    setInsight(null); // 重置签文，展示推演动画
    setInsightOpen(true);
  }, []);

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
            <Hero onAsk={askInsight} asking={asking} onOpenDialog={openInsightDialog} />

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

        {view === "about" && <AboutView onAsk={openInsightDialog} />}
      </main>

      <SiteFooter />

      {/* 弹窗 */}
      <ArticleDialog
        article={currentArticle}
        loading={articleLoading}
        onOpenChange={(open) => {
          if (!open) setCurrentArticle(null);
        }}
      />
      <InsightDialog
        open={insightOpen}
        onOpenChange={setInsightOpen}
        loading={asking}
        insight={insight}
        onAsk={askInsight}
      />
    </div>
  );
}
