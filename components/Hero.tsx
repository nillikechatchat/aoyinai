'use client'

import { motion } from 'framer-motion'
import { Github, Rss, Zap } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      {/* 背景特效 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/20 via-accent-cyan/20 to-accent-purple/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-accent-pink/10 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="relative mx-auto mb-6 h-24 w-24 overflow-hidden rounded-full border-2 border-primary/30 p-1">
              <div className="h-full w-full rounded-full bg-gradient-to-br from-primary via-accent-cyan to-accent-purple" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="size-10 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="ai-gradient-text mb-6 text-4xl font-bold sm:text-6xl"
          >
            AI 探索者
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            聚焦人工智能的中文博客 — <span className="ai-gradient-text font-semibold">7 大主题</span>、
            <span className="ai-gradient-text font-semibold">动效拉满</span>、
            <span className="ai-gradient-text font-semibold">持续更新</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              持续更新
            </div>
            <span className="text-muted-foreground">·</span>
            <a
              href="https://github.com/nillikechatchat/aoyinai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Github className="size-4" />
              GitHub
            </a>
            <span className="text-muted-foreground">·</span>
            <a href="/rss.xml" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <Rss className="size-4" />
              RSS
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 flex flex-wrap justify-center gap-8"
          >
            {[
              { label: '主题分类', value: '7+' },
              { label: '精选文章', value: '8' },
              { label: '持续更新', value: '100%' },
              { label: '实战导向', value: 'AI' }
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="ai-gradient-text text-3xl font-bold">{stat.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
