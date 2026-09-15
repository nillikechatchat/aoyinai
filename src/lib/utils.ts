import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 封面差异化滤镜：同栏目共用封面图时，基于 slug 做明显的色相/饱和度/亮度偏移，
 * 让列表视觉上不重复。返回可直接用于 style.filter 的字符串。
 *
 * 哈希采用 FNV-1a + murmur3 finalizer（雪崩混合）：
 * 朴素累积哈希下，仅末字符不同的 slug（如 t-agent-design-notes-01/03）
 * 哈希值几乎相同，导致滤镜雷同；雪崩后任意一位差异都会扩散到全位。
 */
export function coverFilter(slug: string): string {
  // FNV-1a 32 位
  let h = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i) & 0xff;
    // 若字符码超出单字节（中文 slug），连同高字节一起混入
    h ^= (slug.charCodeAt(i) >>> 8) & 0xff;
    h = Math.imul(h, 0x01000193);
  }
  // murmur3 finalizer：雪崩混合，让相邻输入产生截然不同的输出
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  h = h >>> 0;

  const hue = (h % 73) - 36; // -36 ~ +36 度（73 质数桶，同栏目内更不易撞色），水墨封面上仍不失真
  const sat = 0.94 + ((h >>> 8) % 21) / 100; // 0.94 ~ 1.14
  const bri = 0.96 + ((h >>> 16) % 9) / 100; // 0.96 ~ 1.04
  return `hue-rotate(${hue}deg) saturate(${sat.toFixed(2)}) brightness(${bri.toFixed(2)})`;
}

