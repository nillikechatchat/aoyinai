'use client'

import { useEffect, useState } from 'react'

export function getReadingProgress(scrollTop: number, scrollHeight: number, clientHeight: number) {
  const scrollableHeight = scrollHeight - clientHeight
  if (scrollableHeight <= 0) return 0
  return Math.min(100, Math.max(0, (scrollTop / scrollableHeight) * 100))
}

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      setProgress(getReadingProgress(window.scrollY, document.documentElement.scrollHeight, window.innerHeight))
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  return (
    <div className="fixed inset-x-0 top-14 z-50 h-px bg-ink-900/5" aria-hidden="true">
      <div
        className="h-full origin-left bg-vermilion transition-transform duration-150"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  )
}
