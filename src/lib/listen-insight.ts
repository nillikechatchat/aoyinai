/** 听签/听文：TTS 语音播放（走后端 /api/tts），模块级缓存与单例播放器；
 *  支持多段文本顺序播放队列（长文分段合成，逐段续播，播前预取下一段）。 */

const cache = new Map<string, string>(); // 诵读文本 -> blob URL
let audio: HTMLAudioElement | null = null;
/** 队列令牌：新播放请求使旧队列静默失效 */
let queueToken = 0;

/** 停止当前诵读（含未播完的队列） */
export function stopListening() {
  queueToken++;
  if (audio) {
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch {
      // ignore
    }
  }
}

/** 拉取（或命中缓存）一段文本的语音 blob URL */
async function fetchAudioUrl(text: string): Promise<string | null> {
  const hit = cache.get(text);
  if (hit) return hit;
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    cache.set(text, url);
    // 缓存上限：超过 24 条时回收最早的
    if (cache.size > 24) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) {
        const oldUrl = cache.get(oldest);
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        cache.delete(oldest);
      }
    }
    return url;
  } catch {
    return null;
  }
}

/** 播放一段 blob，自然结束时 resolve；出错 reject；可选回传播放进度百分比 */
function playUrl(url: string, onProgress?: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const player = new Audio(url);
    audio = player;
    player.onended = () => {
      if (audio === player) audio = null;
      resolve();
    };
    player.onerror = () => {
      if (audio === player) audio = null;
      reject(new Error("audio_error"));
    };
    if (onProgress) {
      player.ontimeupdate = () => {
        const d = player.duration;
        if (Number.isFinite(d) && d > 0) {
          onProgress(Math.min(100, Math.max(0, (player.currentTime / d) * 100)));
        }
      };
    }
    player.play().catch((e) => {
      if (audio === player) audio = null;
      reject(e);
    });
  });
}

/**
 * 诵读一段文本（同文本命中缓存即秒开）
 * @param onEnded 播放自然结束时的回调
 * @returns "started" 已开始播放 | "error" 生成或播放失败
 */
export async function listenToText(
  text: string,
  onEnded?: () => void
): Promise<"started" | "error"> {
  stopListening();
  const token = ++queueToken;
  try {
    const url = await fetchAudioUrl(text);
    if (!url || token !== queueToken) return "error";
    await playUrl(url);
    if (token === queueToken) onEnded?.();
    return "started";
  } catch {
    return "error";
  }
}

export interface ChunkListenOptions {
  /** 每段开始播放时回调（i 从 0 起） */
  onChunk?: (i: number, total: number) => void;
  /** 当前段播放进度（0~100，随 timeupdate 更新） */
  onProgress?: (pct: number, i: number, total: number) => void;
  /** 整个队列自然播完时回调 */
  onEnded?: () => void;
}

/**
 * 顺序诵读多段文本：逐段合成、播完续播下一段，播放当前段时预取下一段。
 * 任一新播放请求（listenToText/listenToChunks/stopListening）会使本队列静默终止。
 * @returns "started" 已开始 | "error" 首段即失败
 */
export async function listenToChunks(
  chunks: string[],
  opts?: ChunkListenOptions
): Promise<"started" | "error"> {
  stopListening();
  const token = ++queueToken;
  const list = chunks.map((c) => c.trim()).filter(Boolean);
  if (list.length === 0) return "error";

  const firstUrl = await fetchAudioUrl(list[0]);
  if (!firstUrl || token !== queueToken) return "error";

  // 整条队列异步推进，函数立刻返回 "started"（首段已开始播放）
  void (async () => {
    for (let i = 0; i < list.length; i++) {
      if (token !== queueToken) return;
      opts?.onChunk?.(i, list.length);
      let url = i === 0 ? firstUrl : await fetchAudioUrl(list[i]);
      if (token !== queueToken) return;
      if (!url) return; // 后续段合成失败：静默结束
      // 预取下一段（不影响当前播放）
      const next = list[i + 1];
      if (next && !cache.has(next)) void fetchAudioUrl(next);
      try {
        await playUrl(url, (pct) => {
          if (token === queueToken) opts?.onProgress?.(pct, i, list.length);
        });
      } catch {
        return; // 被停止或播放出错
      }
    }
    if (token === queueToken) opts?.onEnded?.();
  })();

  return "started";
}
