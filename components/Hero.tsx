'use client'

import { motion } from 'framer-motion'
import { ArrowDownRight, BookOpen } from 'lucide-react'
import { HongjianLogo } from './HongjianLogo'
import { getHeroParallax } from '@/lib/home-motion'

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.85, ease },
  }),
}

interface HeroProps {
  scrollProgress?: number
}

export function Hero({ scrollProgress = 0 }: HeroProps) {
  const parallax = getHeroParallax(scrollProgress)

  return (
    <section className="hero-home relative isolate overflow-hidden flex items-center justify-center h-full">
      <div className="hero-home-vignette absolute inset-0 z-[1]" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col justify-between px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
        <motion.div style={{ y: parallax.titleY, opacity: parallax.titleOpacity }} className="text-[10px] font-medium tracking-[0.22em] text-ink-500">
          <motion.span custom={0.12} initial="hidden" animate="visible" variants={reveal}>
            鸿渐SPACE / 二〇二六
          </motion.span>
        </motion.div>

        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <motion.div custom={0.24} initial="hidden" animate="visible" variants={reveal} className="mb-6 flex items-center gap-3">
              <motion.div style={{ scale: parallax.logoScale }}>
                <HongjianLogo className="size-6" compact />
              </motion.div>
              <span className="text-[10px] font-medium tracking-[0.2em] text-ink-500">
                渐于木，进于学，成于思
              </span>
            </motion.div>

            <motion.div style={{ y: parallax.titleY }}>
              <motion.h1
                custom={0.32}
                initial="hidden"
                animate="visible"
                variants={reveal}
                className="hero-home-title max-w-4xl font-serif text-[clamp(3.2rem,7.5vw,8rem)] font-semibold leading-[0.84] tracking-[-0.065em] text-ink-900"
              >
                学问向前，<br />
                思想<span className="text-[#e0444b]">生长</span>。
              </motion.h1>
            </motion.div>

            <motion.div style={{ y: parallax.subtitleY }}>
              <motion.p
                custom={0.44}
                initial="hidden"
                animate="visible"
                variants={reveal}
                className="mt-8 max-w-sm text-sm leading-7 text-ink-500 sm:text-base"
              >
                AI 学习、创作与技术思考的长期空间。把每一次阅读，变成下一步的能力。
              </motion.p>
            </motion.div>

            <motion.div style={{ y: parallax.ctaY }}>
              <motion.div custom={0.56} initial="hidden" animate="visible" variants={reveal} className="mt-9 flex flex-wrap items-center gap-3">
                <a href="/blog" className="hero-home-cta group">
                  <BookOpen className="size-4" />
                  进入阅读
                  <ArrowDownRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
                </a>
                <a href="/explore" className="hero-home-cta-secondary">
                  探索主题
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <motion.div
          custom={0.66}
          initial="hidden"
          animate="visible"
          variants={reveal}
          className="flex items-end justify-between border-t border-ink-900/15 pt-4 text-[10px] uppercase tracking-[0.16em] text-ink-500"
        >
          <span>鸿渐于陆，其羽可用为仪</span>
          <span className="hidden sm:block">向下阅览</span>
          <span className="text-[#c53d43]">↓</span>
        </motion.div>
      </div>
    </section>
  )
}
