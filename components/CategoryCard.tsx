'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface CategoryCardProps {
  slug: string
  label: string
  desc: string
  color: string
  emoji: string
  index?: number
}

export function CategoryCard({ slug, label, desc, color, emoji, index = 0 }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/categories/${slug}`}>
        <div
          className="card-hover group relative overflow-hidden rounded-2xl border border-border bg-card p-6"
          style={{ borderColor: `${color}30` }}
        >
          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `linear-gradient(135deg, ${color}10 0%, transparent 100%)`
            }}
          />

          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-3xl">{emoji}</span>
              <ArrowRight
                className="size-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-foreground"
              />
            </div>

            <h3 className="mb-2 text-lg font-semibold" style={{ color }}>
              {label}
            </h3>

            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
