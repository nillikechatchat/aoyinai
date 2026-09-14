/**
 * 读书记忆（localStorage）：记录读过的文章 slug，供列表展示「读毕」印记。
 * 通过订阅机制让所有卡片实时响应（useSyncExternalStore 友好）。
 */

const READ_KEY = "aoyin_read_slugs";
const MAX = 300;

const listeners = new Set<() => void>();
let cache: string[] | null = null;

function snapshot(): string[] {
  if (cache === null) {
    try {
      const parsed = JSON.parse(localStorage.getItem(READ_KEY) || "[]");
      cache = Array.isArray(parsed) ? parsed : [];
    } catch {
      cache = [];
    }
  }
  return cache;
}

/** 读取是否已读（依赖模块缓存，供 useSyncExternalStore 的 getSnapshot 使用） */
export function isRead(slug: string): boolean {
  return snapshot().includes(slug);
}

/** 订阅读书记忆变化 */
export function subscribeReads(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** 标记已读：更新缓存 + 落盘 + 广播 */
export function markRead(slug: string): void {
  const next = [...snapshot().filter((s) => s !== slug), slug].slice(-MAX);
  cache = next;
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(next));
  } catch {
    // 隐私模式等场景静默
  }
  listeners.forEach((l) => l());
}
