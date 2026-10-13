'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowRight, ArrowUpRight, BookOpen, Code2, Compass, GraduationCap, Trophy, Zap, Cloud, Bot } from 'lucide-react'
import { categoryMeta } from '@/lib/categories'
import { calculateReadingTime } from '@/lib/reading'
import type { Post } from '@/lib/posts'

interface HomeEditorialProps { posts: Post[]; categories: string[]; tagCount: number }
const categoryIcons = [BookOpen, Compass, Code2, GraduationCap, Trophy, Zap, Cloud, Bot]

function ArticleStep({ post, index }: { post: Post; index: number }) {
  const raw = post.cover?.image || post.image
  const cover = raw ? (raw.startsWith('/') ? raw : `/${raw}`) : null
  const date = new Date(post.date)
  const dateLabel = `${date.getUTCFullYear()}.${String(date.getUTCMonth() + 1).padStart(2, '0')}.${String(date.getUTCDate()).padStart(2, '0')}`
  return (
    <li className="step-post">
      <Link href={`/blog/${post.id}`} className="step-post-link">
        <span className="step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <span className="step-cover">{cover ? <img src={cover} alt="" loading={index < 2 ? 'eager' : 'lazy'} width={88} height={68} /> : <span className="cover-fallback">鸿</span>}</span>
        <span className="step-copy">
          <span className="step-meta"><time dateTime={post.date}>{dateLabel}</time><span>{categoryMeta[post.categories[0]]?.label || '文章'}</span></span>
          <b>{post.title}</b><small>{post.description}</small>
          <span className="step-tags">{post.tags.slice(0, 3).map(tag => `#${tag}`).join('  ')}</span>
        </span>
        <span className="step-reading-time">{calculateReadingTime(post.content)} 分钟<ArrowUpRight size={16} /></span>
      </Link>
    </li>
  )
}

export function HomeEditorial({ posts, categories, tagCount }: HomeEditorialProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [visibleCount, setVisibleCount] = useState(6)
  const filteredPosts = useMemo(() => activeCategory === 'all' ? posts : posts.filter(post => post.categories.includes(activeCategory)), [activeCategory, posts])
  const yearCount = new Set(posts.map(p => new Date(p.date).getUTCFullYear())).size
  function chooseCategory(category: string) { setActiveCategory(category); setVisibleCount(6) }

  return (
    <div className="immersive-home">
      <div className="immersive-stars" aria-hidden="true" />
      <div className="immersive-mist immersive-mist-one" aria-hidden="true" />
      <div className="immersive-mist immersive-mist-two" aria-hidden="true" />
      <section className="immersive-hero" aria-label="鸿渐Space 首页">
        <div className="immersive-scene" aria-hidden="true">
          <div className="scene-glow" /><div className="scene-mountain scene-mountain-back" /><div className="scene-mountain scene-mountain-front" />
          <div className="scene-waterfall" /><div className="scene-arch"><span>鸿渐Space</span><small>AI 学习、创作与技术思考</small></div>
          <div className="scene-stair scene-stair-one" /><div className="scene-stair scene-stair-two" /><div className="scene-stair scene-stair-three" />
          <div className="scene-tree scene-tree-one" /><div className="scene-tree scene-tree-two" />
          <div className="scene-lantern scene-lantern-one" /><div className="scene-lantern scene-lantern-two" />
        </div>
        <div className="immersive-intro">
          <p className="immersive-eyebrow"><span className="eyebrow-dot" />鸿渐SPACE · 二〇二六</p>
          <h1>把每一次阅读，<br />变成<em>下一步的能力</em>。</h1>
          <p className="immersive-lede">AI 学习、创作与技术思考的长期空间。以专题沉淀信息密度，用可持续的知识结构，代替短暂的资讯洪流。</p>
          <div className="immersive-stats">
            <div><strong>{posts.length}</strong><span>篇文章</span></div><div><strong>{categories.length}</strong><span>个栏目</span></div>
            <div><strong>{tagCount}</strong><span>个标签</span></div><div><strong>{yearCount}</strong><span>年记录</span></div>
          </div>
          <div className="intro-actions"><Link href="/blog" className="immersive-cta">进入阅读 <ArrowRight size={16} /></Link><Link href="/explore" className="section-link">探索主题 <ArrowUpRight size={14} /></Link></div>
        </div>
        <aside className="scene-category-panel" aria-label="主题路径">
          <div className="category-panel-heading"><h2>主题路径</h2><button type="button" aria-pressed={activeCategory === 'all'} onClick={() => chooseCategory('all')}>全部</button></div>
          <div className="scene-category-stack">
            {categories.map((slug, index) => {
              const meta = categoryMeta[slug]
              if (!meta) return null
              const Icon = categoryIcons[index % categoryIcons.length]
              return <div key={slug} className={`scene-category-card ${activeCategory === slug ? 'is-selected' : ''}`}>
                <button type="button" aria-label={`筛选${meta.label}`} aria-pressed={activeCategory === slug} aria-controls="home-articles" onClick={() => chooseCategory(slug)}><Icon size={18} /><span><b>{meta.label}</b><small>{meta.desc}</small></span></button>
                <Link href={`/categories/${slug}`} aria-label={`进入${meta.label}栏目`}><ArrowUpRight size={16} /></Link>
              </div>
            })}
          </div>
        </aside>
        <section className="hero-articles" id="home-articles" aria-label="最新阅读">
          <div className="hero-articles-heading"><h2>最新阅读</h2><p role="status">{activeCategory === 'all' ? '全部' : categoryMeta[activeCategory]?.label} · {filteredPosts.length} 篇</p></div>
          <ol className="step-posts hero-step-posts">{filteredPosts.slice(0, 6).map((post, index) => <ArticleStep key={post.id} post={post} index={index} />)}</ol>
          {filteredPosts.length === 0 && <p className="empty-posts">暂无文章</p>}
        </section>
      </section>
      <section className="immersive-reading" aria-label="更多文章">
        {visibleCount > 6 && <ol start={7} className="step-posts additional-posts">{filteredPosts.slice(6, visibleCount).map((post, index) => <ArticleStep key={post.id} post={post} index={index + 6} />)}</ol>}
        {visibleCount < filteredPosts.length ? <button type="button" className="load-more" onClick={() => setVisibleCount(count => count + 6)}>加载更多文章 <ArrowRight size={15} /></button> : <p className="all-posts-loaded" role="status">已展示全部 {filteredPosts.length} 篇文章</p>}
        <Link href="/blog" className="all-articles-link section-link">全部文章 <ArrowUpRight size={14} /></Link>
      </section>
      <section className="immersive-band">
        <div><span className="section-kicker">03 / 赛事日历</span><h2>把热爱，变成作品。</h2><p>持续核验的 AI 竞赛与黑客松日历，标注报名状态与截止日期，帮你把机会落到日程上。</p></div>
        <Link href="/stats" className="immersive-cta">查看赛事统计 <ArrowUpRight size={16} /></Link>
      </section>
    </div>
  )
}
