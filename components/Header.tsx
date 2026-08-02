'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Search, Rss } from 'lucide-react'
import { HongjianLogo } from './HongjianLogo'

const mainNav = [
  { href: '/', label: '首页' },
  { href: '/explore', label: '探索' },
  { href: '/blog', label: '文章' },
  { href: '/stats', label: '赛事统计' },
  { href: '/archives', label: '归档' },
  { href: '/tags', label: '标签' },
  { href: '/about', label: '关于' },
]

const subNav = [
  { href: '/categories/tutorials', label: 'AI 入门实战' },
  { href: '/categories/inspiration', label: '灵感' },
  { href: '/categories/market', label: '行业动态' },
  { href: '/categories/majors', label: '升学就业' },
  { href: '/categories/events', label: '竞赛活动' },
  { href: '/categories/hackathons', label: '黑客松' },
  { href: '/categories/cloud-deals', label: '算力优惠' },
  { href: '/categories/t-agent', label: 'T-agent' },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ink-200/30 bg-rice/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <HongjianLogo className="size-8 shrink-0" />
          <span className="font-serif text-base font-bold text-ink-900 tracking-wide">
            鸿渐Space
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-2.5 py-1.5 text-sm font-medium text-ink-600 transition-colors hover:text-vermilion"
            >
              {item.label}
            </Link>
          ))}
          <div className="group relative">
            <button className="px-2.5 py-1.5 text-sm font-medium text-ink-600 transition-colors hover:text-vermilion">
              栏目 ▾
            </button>
            <div className="invisible absolute right-0 top-full z-50 min-w-[140px] rounded border border-ink-200/30 bg-rice-warm p-1.5 opacity-0 shadow-ink-lg transition-all group-hover:visible group-hover:opacity-100">
              {subNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-sm px-3 py-1.5 text-sm text-ink-600 transition-colors hover:bg-vermilion/10 hover:text-vermilion"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-1">
          <Link href="/search" aria-label="搜索文章" className="rounded p-1.5 text-ink-500 transition-colors hover:text-vermilion">
            <Search className="size-4" />
          </Link>
          <a href="/rss.xml" aria-label="RSS 订阅" className="rounded p-1.5 text-ink-500 transition-colors hover:text-vermilion">
            <Rss className="size-4" />
          </a>
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? '关闭导航菜单' : '打开导航菜单'}
            aria-expanded={isOpen}
            className="rounded p-1.5 text-ink-500 transition-colors hover:text-vermilion lg:hidden"
          >
            {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-ink-200/30 bg-rice-warm px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {[...mainNav, ...subNav].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-sm px-3 py-2 text-sm text-ink-600 hover:bg-vermilion/10 hover:text-vermilion"
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
