import type { SVGProps } from 'react'

interface HongjianLogoProps extends SVGProps<SVGSVGElement> {
  compact?: boolean
}

export function HongjianLogo({ compact = false, className, ...props }: HongjianLogoProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className} {...props}>
      <rect x="1.5" y="1.5" width="45" height="45" rx="9" className="fill-rice stroke-ink-900" strokeWidth="1.5" />
      <path d="M12 13H36M12 19H20M28 19H36M12 25H36M12 31H20M28 31H36M12 37H36" className="stroke-vermilion" strokeWidth="2.4" strokeLinecap="square" />
      {!compact && <path d="M24 10.5V38" className="stroke-ink-900" strokeWidth="1" opacity="0.38" />}
    </svg>
  )
}
