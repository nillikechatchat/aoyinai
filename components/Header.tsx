'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Search, Rss, Feather } from 'lucide-react'

const navItems = [
  { href: '/', label: '首页' },
  { href: '/blog', label: '文章' },
  { href: '/roadmap', label: '学习路线图' },
  { href: '/categories/tutorials', label: 'AI 入门实战' },
  { href: '/categories/inspiration', label: '灵感' },
  { href: '/categories/market', label: '行业动态' },
  { href: '/categories/majors', label: '升学就业' },
  { href: '/categories/events', label: '竞赛活动' },
  { href: '/categories/hackathons', label: '黑客松' },
  { href: '/categories/cloud-deals', label: '算力优惠' },
  { href: '/categories/t-agent', label: 'T-agent' }
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const dark = saved ? saved === 'dark' : true
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ink-200/30 bg-rice/80 backdrop-blur-lg dark:border-ink-800/30 dark:bg-ink-950/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Feather className="size-5 text-vermilion" />
          <span className="font-serif text-lg font-bold tracking-wide text-ink-900 dark:text-ink-100">
            敖胤AI
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 text-sm font-medium text-ink-600 transition-colors hover:text-vermilion dark:text-ink-400 dark:hover:text-vermilion-light"
            >
              {item.label}
            </Link>
          ))}
          <div className="group relative">
            <button className="px-3 py-1.5 text-sm font-medium text-ink-600 transition-colors hover:text-vermilion dark:text-ink-400">
              栏目 ▾
            </button>
            <div className="invisible absolute right-0 top-full z-50 min-w-[140px] rounded border border-ink-200/30 bg-rice-warm p-1.5 opacity-0 shadow-ink-lg transition-all group-hover:visible group-hover:opacity-100 dark:border-ink-800/30 dark:bg-ink-900">
              {navItems.slice(4).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-sm px-3 py-1.5 text-sm text-ink-600 transition-colors hover:bg-vermilion/10 hover:text-vermilion dark:text-ink-400"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/search"
            className="rounded p-1.5 text-ink-500 transition-colors hover:text-vermilion dark:text-ink-500"
          >
            <Search className="size-4" />
          </Link>
          <a
            href="/rss.xml"
            className="rounded p-1.5 text-ink-500 transition-colors hover:text-vermilion dark:text-ink-500"
          >
            <Rss className="size-4" />
          </a>
          <button
            onClick={toggleTheme}
            className="rounded p-1.5 text-ink-500 transition-colors hover:text-vermilion dark:text-ink-500"
            aria-label="切换主题"
          >
            {isDark ? '☀' : '🌙'}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded p-1.5 text-ink-500 transition-colors hover:text-vermilion md:hidden dark:text-ink-500"
          >
            {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-ink-200/30 bg-rice-warm px-4 py-3 md:hidden dark:border-ink-800/30 dark:bg-ink-900">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-sm px-3 py-2 text-sm text-ink-600 hover:bg-vermilion/10 hover:text-vermilion dark:text-ink-400"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
