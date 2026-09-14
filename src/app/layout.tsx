import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "敖胤AI · 观智能之潮，守问学之心",
  description:
    "聚焦人工智能的中文博客：AI 教程、市场分析、高校专业、赛事活动、黑客松、云厂商优惠与 T-agent 多智能体框架。以东方美学，观照 AI 时代。",
  keywords: ["AI", "人工智能", "LLM", "Agent", "AI 教程", "黑客松", "云厂商优惠", "市场分析"],
  authors: [{ name: "敖胤AI" }],
  openGraph: {
    title: "敖胤AI",
    description: "观智能之潮，守问学之心 —— AI 时代的中文观察与修行",
    siteName: "敖胤AI",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f1e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased text-foreground min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
