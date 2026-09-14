"use client";

import { useState } from "react";
import { Compass, Menu, BookOpen, Home, Info, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Category } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";

export type ViewKey = "home" | "articles" | "about";

interface SiteHeaderProps {
  view: ViewKey;
  onNavigate: (view: ViewKey, category?: string) => void;
  categories: Category[];
  onTodayRead: () => void;
}

export function SiteHeader({ view, onNavigate, categories, onTodayRead }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: Array<{ key: ViewKey; label: string; icon: React.ReactNode }> = [
    { key: "home", label: "首页", icon: <Home className="h-4 w-4" /> },
    { key: "articles", label: "文章", icon: <BookOpen className="h-4 w-4" /> },
    { key: "about", label: "关于", icon: <Info className="h-4 w-4" /> },
  ];

  const go = (v: ViewKey, category?: string) => {
    setMobileOpen(false);
    onNavigate(v, category);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-frame/70 bg-paper/85 backdrop-blur-md supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo */}
        <button
          onClick={() => go("home")}
          className="group flex items-center gap-3 focus-visible:outline-none"
          aria-label="回到首页"
        >
          <span className="font-kai text-2xl font-bold tracking-wide text-ink transition-colors group-hover:text-vermillion md:text-[1.7rem]">
            敖胤AI
          </span>
          <span className="seal-stamp h-7 w-7 text-[0.72rem] leading-none transition-transform group-hover:rotate-6">
            胤
          </span>
          <span className="hidden font-song text-xs tracking-[0.28em] text-ink-soft lg:inline">
            观智能之潮 · 守问学之心
          </span>
        </button>

        {/* 桌面导航 */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="主导航">
          {navItems.map((item) => {
            const active = view === item.key && !(item.key === "articles" && false);
            return (
              <button
                key={item.key}
                onClick={() => go(item.key)}
                className={`relative px-4 py-2 font-kai text-[0.95rem] tracking-[0.2em] transition-colors ${
                  active ? "text-vermillion" : "text-ink-soft hover:text-ink"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-4 -bottom-[13px] h-[2px] bg-vermillion" aria-hidden />
                )}
              </button>
            );
          })}

          {/* 栏目下拉 */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`relative ml-1 px-4 py-2 font-kai text-[0.95rem] tracking-[0.2em] transition-colors focus-visible:outline-none ${
                view === "articles" ? "text-vermillion" : "text-ink-soft hover:text-ink"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                栏目
                <LayoutGrid className="h-3.5 w-3.5" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-64 border-frame bg-paper-card p-2">
              <DropdownMenuLabel className="font-kai text-xs tracking-[0.3em] text-ink-faint">
                七大栏目 · 术业专攻
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-frame" />
              {categories.map((c) => (
                <DropdownMenuItem
                  key={c.key}
                  onClick={() => go("articles", c.key)}
                  className="cursor-pointer gap-3 rounded-sm px-2 py-2.5 focus:bg-paper-deep"
                >
                  <span className="seal-stamp h-6 w-6 shrink-0 text-[0.65rem]">{c.seal}</span>
                  <span className="flex-1 font-song text-sm text-ink">{c.name}</span>
                  <span className="font-song text-xs text-ink-faint">{c.count ?? ""}篇</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* 右侧：今日一读 + 移动端菜单 */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onTodayRead}
            className="hidden h-10 gap-2 rounded-full bg-pine px-5 font-kai text-[0.9rem] tracking-[0.18em] text-[#f3efdf] shadow-md transition-colors hover:bg-pine-deep sm:inline-flex"
          >
            <Compass className="h-4 w-4" />
            今日一读
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="打开菜单">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 border-frame bg-paper-card">
              <SheetHeader className="border-b border-frame pb-3">
                <SheetTitle className="font-kai text-xl tracking-[0.2em] text-ink">
                  敖胤AI
                  <span className="seal-stamp ml-2 h-6 w-6 align-middle text-[0.65rem]">胤</span>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-2 flex flex-col gap-1 px-2">
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => go(item.key)}
                    className={`flex items-center gap-3 rounded-md px-3 py-3 text-left font-kai text-base tracking-[0.2em] transition-colors ${
                      view === item.key ? "bg-paper-deep text-vermillion" : "text-ink-soft hover:bg-paper-deep"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
                <div className="ink-divider my-2" />
                <p className="px-3 font-kai text-xs tracking-[0.3em] text-ink-faint">七大栏目</p>
                {categories.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => go("articles", c.key)}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-paper-deep"
                  >
                    <span className="seal-stamp h-6 w-6 text-[0.65rem]">{c.seal}</span>
                    <span className="font-song text-sm text-ink">{c.name}</span>
                    <span className="ml-auto font-song text-xs text-ink-faint">{c.count ?? ""}篇</span>
                  </button>
                ))}
                <Button
                  onClick={() => {
                    setMobileOpen(false);
                    onTodayRead();
                  }}
                  className="mt-3 h-11 gap-2 rounded-full bg-pine font-kai tracking-[0.18em] text-[#f3efdf] hover:bg-pine-deep"
                >
                  <Compass className="h-4 w-4" />
                  今日一读
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
