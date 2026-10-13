'use client'

import { motion } from 'framer-motion'

interface FullPageSectionProps {
  children: React.ReactNode
  id: string
  className?: string
  allowOverflow?: boolean
}

export function FullPageSection({ children, id, className = '', allowOverflow = false }: FullPageSectionProps) {
  return (
    <motion.section
      id={id}
      data-fullpage-section
      className={`fullpage-section ${allowOverflow ? 'fullpage-section-overflow' : ''} ${className}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  )
}
