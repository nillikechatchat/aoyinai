import Link from 'next/link'
import { siteConfig } from '@/lib/site'
import { HongjianLogo } from './HongjianLogo'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ink-200/30 bg-rice-warm/50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <HongjianLogo className="size-5" compact />
            <span className="font-serif text-sm font-bold text-ink-700">
              {siteConfig.name}
            </span>
          </div>

          <p className="max-w-md text-xs text-ink-600">
            聚焦人工智能的中文博客 — AI 入门实战 · 行业动态 · 升学就业 · 竞赛活动 · 灵感 · 黑客松 · 算力优惠 · T-agent
          </p>

          <div className="flex gap-4 text-xs text-ink-600">
            <Link href="/blog" className="hover:text-vermilion">文章</Link>
            <Link href="/archives" className="hover:text-vermilion">归档</Link>
            <Link href="/tags" className="hover:text-vermilion">标签</Link>
            <Link href="/about" className="hover:text-vermilion">关于</Link>
            <a href="/rss.xml" className="hover:text-vermilion">RSS</a>
          </div>

          <div className="bamboo-divider w-24" />

          <div className="flex items-center gap-4 text-[10px] text-ink-600">
            <span id="busuanzi_container_site_pv">
              本站总访问量 <span id="busuanzi_value_site_pv" className="font-medium text-ink-700"></span> 次
            </span>
            <span id="busuanzi_container_site_uv">
              总访客 <span id="busuanzi_value_site_uv" className="font-medium text-ink-700"></span> 人
            </span>
          </div>

          <p className="text-[10px] text-ink-600">
            {'\u00A9'} {new Date().getFullYear()} 鸿渐Space · 渐行，渐远，渐见天地
          </p>
          <p className="text-[10px] text-ink-600">
            由{' '}
            <a
              href="https://monkeycode-ai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-700 hover:text-vermilion hover:underline"
            >
              Monkeycode
            </a>{' '}
            驱动开发
          </p>
        </div>
      </div>
    </footer>
  )
}
