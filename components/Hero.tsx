'use client'

import { motion } from 'framer-motion'
import { Github, Rss } from 'lucide-react'
import Image from 'next/image'

export function Hero() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      {/* 墨迹背景 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-b from-ink-200/30 via-ink-100/10 to-transparent blur-3xl dark:from-ink-800/20 dark:via-ink-900/10" />
        <div className="absolute bottom-0 left-1/4 h-[200px] w-[300px] rounded-full bg-vermilion/5 blur-3xl dark:bg-vermilion/3" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 150 }}
            className="mx-auto mb-6 w-20 h-20 sm:w-24 sm:h-24"
          >
            <Image
              src="/logo.svg"
              alt="敖胤AI Logo"
              width={96}
              height={96}
              className="w-full h-full"
              priority
            />
          </motion.div>

          {/* 标题 */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="ink-gradient font-serif text-4xl font-bold tracking-wide sm:text-5xl"
          >
            敖胤AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto mt-4 max-w-xl text-base text-ink-500 sm:text-lg dark:text-ink-500"
          >
            以墨为舟，探索 AI 世界 — <span className="font-medium text-vermilion">7 大主题</span>，持续更新
          </motion.p>

          {/* 状态行 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-ink-500 dark:text-ink-600"
          >
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-jade opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-jade" />
              </span>
              持续更新
            </span>
            <span className="text-ink-300 dark:text-ink-700">·</span>
            <a
              href="https://github.com/nillikechatchat/aoyinai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-vermilion"
            >
              <Github className="size-3" /> GitHub
            </a>
            <span className="text-ink-300 dark:text-ink-700">·</span>
            <a href="/rss.xml" className="flex items-center gap-1 hover:text-vermilion">
              <Rss className="size-3" /> RSS
            </a>
          </motion.div>

          {/* 统计 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mt-10 flex justify-center gap-8"
          >
            {[
              { value: '7+', label: '主题分类' },
              { value: '8', label: '精选文章' },
              { value: '100%', label: '持续更新' }
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-serif text-2xl font-bold text-vermilion">{s.value}</div>
                <div className="mt-1 text-[10px] text-ink-500 dark:text-ink-600">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* 底部竹节分隔 */}
      <div className="bamboo-divider mx-auto mt-12 max-w-3xl" />
    </section>
  )
}