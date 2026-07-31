'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { categoryMeta } from '@/lib/categories'

interface CategoryCardProps {
  slug: string
  index?: number
  count: number
}

export function CategoryCard({ slug, index = 0, count }: CategoryCardProps) {
  const meta = categoryMeta[slug]
  if (!meta) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.055, ease: [0.16, 1, 0.3, 1] }}
      style={{ transition: 'transform var(--dur-hover) var(--ease-ink)' }}
    >
      <Link href={`/categories/${slug}`} className="category-card-item group">
        <div className="flex items-start justify-between">
          <span className="font-mono text-[10px] tracking-[0.16em] text-ink-300">
            0{index + 1}
          </span>
          <ArrowUpRight className="size-4 text-ink-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-vermilion" />
        </div>
        <div className="mt-auto">
          <span className="text-xs font-medium tracking-[0.16em]" style={{ color: meta.color }}>
            {meta.seal}
          </span>
          <h3 className="mt-2 font-serif text-lg font-semibold tracking-wide text-ink-900">
            {meta.label}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-ink-500">
            {meta.desc}
          </p>
          <p className="mt-5 border-t border-ink-900/10 pt-2 text-[10px] tracking-[0.12em] text-ink-400">
            {count} 篇文章
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
