import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="ink-gradient font-serif text-7xl font-bold">404</span>
      <p className="mt-4 font-serif text-lg text-ink-600 dark:text-ink-400">
        此页不知所踪
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-vermilion hover:underline"
      >
        返回首页
      </Link>
    </div>
  )
}
