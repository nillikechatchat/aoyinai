import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { PostCard } from '@/components/PostCard'
import { CategoryCard } from '@/components/CategoryCard'
import { categoryMeta } from '@/lib/categories'
import type { Post } from '@/lib/posts'

interface HomeEditorialProps {
  posts: Post[]
  categories: string[]
  tagCount: number
}

function coverOf(post: Post): string | null {
  const raw = post.cover?.image || post.image
  if (!raw) return null
  return raw.startsWith('/') ? raw : `/${raw}`
}

function dateLabel(date: string): string {
  const d = new Date(date)
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, '0'),
    String(d.getUTCDate()).padStart(2, '0'),
  ].join('.')
}

export function HomeEditorial({ posts, categories, tagCount }: HomeEditorialProps) {
  const [feature, ...rest] = posts
  const recent = rest.slice(0, 5)
  const yearCount = new Set(posts.map((p) => new Date(p.date).getUTCFullYear())).size
  const featureCategory = feature?.categories[0] ? categoryMeta[feature.categories[0]] : null
  const featureCover = feature ? coverOf(feature) : null

  return (
    <div className="home-editorial">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="home-hero-kicker">鸿渐SPACE · 二〇二六</p>
          <h1 className="home-hero-title">
            把每一次阅读，
            <br />
            变成<span>下一步的能力</span>。
          </h1>
          <p className="home-hero-sub">
            AI 学习、创作与技术思考的长期空间。以专题沉淀信息密度，用可持续的知识结构，代替短暂的资讯洪流。
          </p>
          <div className="home-hero-stats">
            <div>
              <b>{posts.length}</b>
              <span>篇文章</span>
            </div>
            <div>
              <b>{categories.length}</b>
              <span>个栏目</span>
            </div>
            <div>
              <b>{tagCount}</b>
              <span>个标签</span>
            </div>
            <div>
              <b>{yearCount}</b>
              <span>年记录</span>
            </div>
          </div>
          <div className="home-hero-actions">
            <Link href="/blog" className="home-btn-primary">
              进入阅读 <ArrowRight className="size-4" />
            </Link>
            <Link href="/explore" className="home-btn-ghost">
              探索主题
            </Link>
          </div>
        </div>

        {feature && (
          <Link href={`/blog/${feature.id}`} className="home-hero-feature">
            {featureCover ? (
              <img src={featureCover} alt="" />
            ) : (
              <span className="home-hero-feature-fallback">鸿</span>
            )}
            <div className="home-hero-feature-body">
              <span className="home-hero-feature-seal">
                本期推荐 · {featureCategory?.label || '文章'}
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <span className="home-hero-feature-date">{dateLabel(feature.date)}</span>
            </div>
          </Link>
        )}
      </section>

      <section className="home-block">
        <header className="home-block-head">
          <span className="home-block-index">01 / 最新阅读</span>
          <Link href="/blog" className="home-block-more">
            全部文章 ↗
          </Link>
        </header>
        <div className="home-recent">
          {recent.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      </section>

      <section className="home-block">
        <header className="home-block-head">
          <span className="home-block-index">02 / 主题路径</span>
          <Link href="/explore" className="home-block-more">
            浏览全部主题 ↗
          </Link>
        </header>
        <h2 className="home-block-title">
          从复杂中，
          <br />
          提炼方向。
        </h2>
        <div className="home-cats">
          {categories.map((cat, i) => (
            <CategoryCard
              key={cat}
              slug={cat}
              index={i}
              count={posts.filter((p) => p.categories.includes(cat)).length}
            />
          ))}
        </div>
      </section>

      <section className="home-band">
        <div className="home-band-copy">
          <span className="home-block-index">03 / 赛事日历</span>
          <h2>把热爱，变成作品。</h2>
          <p>
            持续核验的 AI 竞赛与黑客松日历，标注报名状态与截止日期，帮你把机会落到日程上。
          </p>
        </div>
        <Link href="/stats" className="home-btn-primary">
          查看赛事统计 <ArrowUpRight className="size-4" />
        </Link>
      </section>
    </div>
  )
}
