'use client'

import { CategoryCard } from '@/components/CategoryCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

interface StarDiskItem {
  slug: string
  count: number
}

interface StarDiskLayoutProps {
  items: StarDiskItem[]
}

export function StarDiskLayout({ items }: StarDiskLayoutProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const scrollToIndex = (index: number) => {
    const nextIndex = (index + items.length) % items.length
    setActiveIndex(nextIndex)
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % items.length
        return nextIndex
      })
    }, 5200)

    return () => window.clearInterval(timer)
  }, [items.length])

  return (
    <section className="star-carousel" aria-label="探索主题轮播">
      <button
        type="button"
        onClick={() => scrollToIndex(activeIndex - 1)}
        className="star-carousel-control star-carousel-control-prev"
        aria-label="查看上一个主题"
      >
        <ChevronLeft className="size-4" />
      </button>
      <div className="star-carousel-stage" role="region" aria-live="polite">
        <div
          className="star-carousel-ring"
          style={{ '--rotation': `${-activeIndex * (360 / items.length)}deg` } as React.CSSProperties}
        >
        {items.map((item, index) => (
          <div
            key={item.slug}
            className="star-carousel-slide"
            style={{ '--angle': `${index * (360 / items.length)}deg` } as React.CSSProperties}
          >
            <CategoryCard slug={item.slug} index={index} count={item.count} />
          </div>
        ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => scrollToIndex(activeIndex + 1)}
        className="star-carousel-control star-carousel-control-next"
        aria-label="查看下一个主题"
      >
        <ChevronRight className="size-4" />
      </button>
      <div className="star-carousel-dots" aria-label="轮播位置">
        {items.map((item, index) => (
          <button
            key={item.slug}
            type="button"
            onClick={() => scrollToIndex(index)}
            className={index === activeIndex ? 'is-active' : ''}
            aria-label={`查看${index + 1}号主题：${item.slug}`}
            aria-current={index === activeIndex ? 'true' : undefined}
          />
        ))}
      </div>
    </section>
  )
}
