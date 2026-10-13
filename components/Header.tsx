'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Search, Rss } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { HongjianLogo } from './HongjianLogo'

const mainNav = [
  { href: '/', label: '首页' }, { href: '/explore', label: '探索' }, { href: '/blog', label: '文章' },
  { href: '/stats', label: '赛事统计' }, { href: '/archives', label: '归档' }, { href: '/tags', label: '标签' }, { href: '/about', label: '关于' },
]
const subNav = [
  { href: '/categories/tutorials', label: 'AI 入门实战' }, { href: '/categories/inspiration', label: '灵感' }, { href: '/categories/market', label: '行业动态' }, { href: '/categories/majors', label: '升学就业' },
  { href: '/categories/events', label: '竞赛活动' }, { href: '/categories/hackathons', label: '黑客松' }, { href: '/categories/cloud-deals', label: '算力优惠' }, { href: '/categories/t-agent', label: 'T-agent' },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [columnsOpen, setColumnsOpen] = useState(false)
  const pathname = usePathname()
  return (
    <header className="site-header sticky top-0 z-50 w-full">
      <div className="site-header-inner mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-8">
        <Link href="/" className="site-brand flex items-center gap-2.5">
          <HongjianLogo className="size-8 shrink-0" />
          <span className="site-brand-name">鸿渐Space</span>
        </Link>
        <nav className="site-nav hidden items-center gap-0.5 lg:flex">
          {mainNav.map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined} className="site-nav-link">{item.label}</Link>)}
          <div className="group relative">
            <button type="button" className="site-nav-link site-nav-menu" aria-expanded={columnsOpen} aria-controls="desktop-columns" onClick={() => setColumnsOpen(open => !open)} onKeyDown={event => { if (event.key === 'Escape') setColumnsOpen(false) }}>栏目⌄</button>
            <div id="desktop-columns" hidden={!columnsOpen} className="site-nav-dropdown absolute right-0 top-full z-50 min-w-[150px] p-1.5">
              {subNav.map((item) => <Link key={item.href} href={item.href} onClick={() => setColumnsOpen(false)} className="site-nav-dropdown-link block rounded-sm px-3 py-1.5 text-sm">{item.label}</Link>)}
            </div>
          </div>
        </nav>
        <div className="site-header-actions flex items-center gap-1">
          <Link href="/search" aria-label="搜索文章" className="site-icon-button"><Search size={16} /></Link>
          <a href="/rss.xml" aria-label="RSS 订阅" className="site-icon-button"><Rss size={16} /></a>
          <button onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? '关闭导航菜单' : '打开导航菜单'} aria-expanded={isOpen} className="site-icon-button lg:hidden">{isOpen ? <X size={17} /> : <Menu size={17} />}</button>
        </div>
      </div>
      {isOpen && <div className="site-mobile-nav px-4 py-3 lg:hidden"><nav className="flex flex-col gap-1">{[...mainNav, ...subNav].map((item) => <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="site-mobile-link rounded-sm px-3 py-2 text-sm">{item.label}</Link>)}</nav></div>}
    </header>
  )
}
