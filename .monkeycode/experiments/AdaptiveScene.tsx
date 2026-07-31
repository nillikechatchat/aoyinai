'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { HexagramFallback } from './HexagramFallback'

function isPostDetail(pathname: string) {
  return /^\/blog\/[^/]+$/.test(pathname)
}

function canUseWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

export function AdaptiveScene() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [enhanced, setEnhanced] = useState(false)
  const hidden = !mounted || isPostDetail(pathname)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const narrow = window.matchMedia('(max-width: 640px)').matches
    setEnhanced(canUseWebGL() && !reduced && !narrow)
    setMounted(true)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('site-scene-active', !hidden)
    return () => document.body.classList.remove('site-scene-active')
  }, [hidden])

  if (hidden) return null

  return <HexagramFallback enhanced={enhanced} />
}
