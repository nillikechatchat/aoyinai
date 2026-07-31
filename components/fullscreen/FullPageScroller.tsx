'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface FullPageScrollerProps {
  children: React.ReactNode
  onScrollProgress?: (progress: number) => void
}

export function FullPageScroller({ children, onScrollProgress }: FullPageScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  const scrollToSection = useCallback((index: number) => {
    const container = containerRef.current
    if (!container) return
    const sections = container.querySelectorAll<HTMLElement>('[data-fullpage-section]')
    const clamped = Math.max(0, Math.min(index, sections.length - 1))
    const target = sections[clamped]
    if (!target) return
    const top = Math.min(target.offsetTop - container.offsetTop, container.scrollHeight - container.clientHeight)
    container.scrollTo({ top, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    document.body.classList.add('fullpage-active')
    return () => document.body.classList.remove('fullpage-active')
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const maxScroll = scrollHeight - clientHeight
      const progress = maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0
      setScrollProgress(progress)
      onScrollProgress?.(progress)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [onScrollProgress])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const container = containerRef.current
      if (!container) return
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
      const sections = Array.from(container.querySelectorAll<HTMLElement>('[data-fullpage-section]'))
      const current = sections.reduce((best, section, index) => {
        const distance = Math.abs(section.offsetTop - container.offsetTop - container.scrollTop)
        return distance < best.distance ? { index, distance } : best
      }, { index: 0, distance: Number.POSITIVE_INFINITY }).index

      if (event.key === 'End') {
        event.preventDefault()
        scrollToSection(sections.length - 1)
      }
      if (event.key === 'Home') {
        event.preventDefault()
        scrollToSection(0)
      }
      if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault()
        scrollToSection(current + 1)
      }
      if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault()
        scrollToSection(current - 1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [scrollToSection])

  return <div ref={containerRef} className="fullpage-container">{children}</div>
}
