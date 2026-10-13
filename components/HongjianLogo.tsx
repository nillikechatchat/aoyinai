interface HongjianLogoProps {
  className?: string
}

export function HongjianLogo({ className }: HongjianLogoProps) {
  return (
    <span
      className={`inline-block shrink-0 overflow-hidden rounded-md bg-rice-warm ring-1 ring-ink-900/10 ${className ?? ''}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo.webp"
        alt=""
        aria-hidden="true"
        className="h-full w-full object-cover"
      />
    </span>
  )
}
