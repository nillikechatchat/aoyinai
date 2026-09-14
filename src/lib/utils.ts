import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 封面差异化滤镜：同栏目共用封面图时，基于 slug 做轻微色相/饱和度偏移，
 * 让列表视觉上不重复。返回可直接用于 style.filter 的字符串。
 */
export function coverFilter(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  const hue = (h % 25) - 12; // -12 ~ +12 度
  const sat = 1 + ((h >> 3) % 9) / 100; // 1.00 ~ 1.08
  const bri = 0.99 + ((h >> 6) % 5) / 100; // 0.99 ~ 1.03
  return `hue-rotate(${hue}deg) saturate(${sat.toFixed(2)}) brightness(${bri.toFixed(2)})`;
}

