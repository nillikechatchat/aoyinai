import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 封面差异化滤镜：同栏目共用封面图时，基于 slug 做明显的色相/饱和度/亮度偏移，
 * 让列表视觉上不重复。返回可直接用于 style.filter 的字符串。
 */
export function coverFilter(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  const hue = (h % 49) - 24; // -24 ~ +24 度，肉眼可辨又不失真
  const sat = 0.94 + ((h >> 3) % 21) / 100; // 0.94 ~ 1.14
  const bri = 0.96 + ((h >> 6) % 9) / 100; // 0.96 ~ 1.04
  return `hue-rotate(${hue}deg) saturate(${sat.toFixed(2)}) brightness(${bri.toFixed(2)})`;
}

