"use client";

import { Github, Mail, Rss } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-frame/70 bg-paper-deep/40 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* 站训 */}
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <span className="hidden h-px w-16 bg-gradient-to-r from-transparent to-frame sm:block" aria-hidden />
          <p className="font-kai text-base tracking-[0.35em] text-ink-soft sm:text-lg">
            智能有常 · 人文有时 · 知止不殆
          </p>
          <span className="hidden h-px w-16 bg-gradient-to-l from-transparent to-frame sm:block" aria-hidden />
        </div>

        {/* 印章 */}
        <div className="mt-5 flex justify-center">
          <span className="seal-stamp h-9 w-9 text-sm">敖胤</span>
        </div>

        {/* 链接与版权 */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-song text-xs tracking-[0.2em] text-ink-faint">
            © {new Date().getFullYear()} 敖胤AI · 观智能之潮，守问学之心
          </p>
          <div className="flex items-center gap-5">
            <a
              href="/rss.xml"
              className="inline-flex items-center gap-1.5 font-song text-xs tracking-[0.15em] text-ink-soft transition-colors hover:text-vermillion"
            >
              <Rss className="h-3.5 w-3.5" aria-hidden />
              RSS 订阅
            </a>
            <a
              href="https://github.com/nillikechatchat/aoyinai"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-song text-xs tracking-[0.15em] text-ink-soft transition-colors hover:text-vermillion"
            >
              <Github className="h-3.5 w-3.5" aria-hidden />
              GitHub
            </a>
            <a
              href="mailto:hi@aoyinai.com"
              className="inline-flex items-center gap-1.5 font-song text-xs tracking-[0.15em] text-ink-soft transition-colors hover:text-vermillion"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden />
              来信
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
