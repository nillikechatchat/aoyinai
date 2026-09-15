"use client";

import { useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { MoonStar, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  className?: string;
  /** 展示文字标签（移动抽屉等场景） */
  showLabel?: boolean;
}

/** 水合安全挂载标记：服务端 false / 客户端 true，避免 SSR 不一致 */
const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * 夜读模式切换：白天（宣纸）/ 夜读（墨蓝夜纸）
 */
export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const [switching, setSwitching] = useState(false);

  const isDark = mounted && resolvedTheme === "dark";

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    // 平滑过渡：短暂加类，结束后移除
    document.documentElement.classList.add("theme-switching");
    setSwitching(true);
    setTheme(next);
    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-switching");
      setSwitching(false);
    }, 420);
  };

  return (
    <Button
      variant="outline"
      onClick={toggle}
      disabled={switching}
      aria-label={isDark ? "切换到日间模式" : "切换到夜读模式"}
      title={isDark ? "回到日间" : "夜读模式"}
      className={`h-10 gap-2 rounded-full border-frame bg-paper-card font-kai text-ink-soft shadow-sm transition-colors hover:border-vermillion/50 hover:bg-paper-deep hover:text-vermillion ${className}`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
      {showLabel && <span className="tracking-[0.2em]">{isDark ? "日间" : "夜读"}</span>}
      {!mounted && <span className="sr-only">切换主题</span>}
    </Button>
  );
}
