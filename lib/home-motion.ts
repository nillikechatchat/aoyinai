export interface HeroParallax {
  titleY: number
  titleOpacity: number
  subtitleY: number
  logoScale: number
  ctaY: number
}

export function getHeroParallax(progress: number): HeroParallax {
  const normalized = Math.min(Math.max(progress, 0), 0.5) / 0.5
  const offset = (value: number) => (normalized === 0 ? 0 : value * normalized)

  return {
    titleY: offset(-60),
    titleOpacity: 1 - 0.4 * Math.min(normalized / 0.6, 1),
    subtitleY: offset(-30),
    logoScale: 1 - 0.1 * normalized,
    ctaY: offset(-20),
  }
}
