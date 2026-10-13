import Link from 'next/link'
import { siteConfig } from '@/lib/site'
import { HongjianLogo } from './HongjianLogo'

export function Footer() {
  return (
    <footer className="site-footer mt-auto">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-5 px-4 py-10 sm:px-8">
        <div className="site-footer-top flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2"><HongjianLogo className="size-6" /><span className="site-footer-brand">{siteConfig.name}</span></div>
          <nav className="site-footer-nav flex flex-wrap gap-4 text-xs"><Link href="/blog">文章</Link><Link href="/archives">归档</Link><Link href="/tags">标签</Link><Link href="/about">关于</Link><a href="/rss.xml">RSS</a></nav>
        </div>
        <p className="site-footer-desc">聚焦人工智能的中文博客 — AI 入门实战 · 行业动态 · 升学就业 · 竞赛活动 · 灵感 · 黑客松 · 算力优惠 · T-agent</p>
        <div className="site-footer-meta flex flex-wrap gap-4 text-[10px]"><span id="busuanzi_container_site_pv">本站总访问量 <span id="busuanzi_value_site_pv">--</span> 次</span><span id="busuanzi_container_site_uv">总访客 <span id="busuanzi_value_site_uv">--</span> 人</span><span>© {new Date().getFullYear()} 鸿渐Space</span></div>
      </div>
    </footer>
  )
}
