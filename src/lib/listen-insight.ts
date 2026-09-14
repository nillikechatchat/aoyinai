/** 听签：签文语音播放（TTS 走后端 /api/tts），模块级缓存与单例播放器 */

const cache = new Map<string, string>(); // 诵读文本 -> blob URL
let audio: HTMLAudioElement | null = null;

/** 停止当前诵读 */
export function stopListening() {
  if (audio) {
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch {
      // ignore
    }
  }
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
  try {
    let url = cache.get(text);
    if (!url) {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return "error";
      const blob = await res.blob();
      url = URL.createObjectURL(blob);
      cache.set(text, url);
      // 缓存上限：超过 16 条时回收最早的
      if (cache.size > 16) {
        const oldest = cache.keys().next().value;
        if (oldest !== undefined) {
          const oldUrl = cache.get(oldest);
          if (oldUrl) URL.revokeObjectURL(oldUrl);
          cache.delete(oldest);
        }
      }
    }
    const player = new Audio(url);
    audio = player;
    player.onended = () => {
      if (audio === player) audio = null;
      onEnded?.();
    };
    await player.play();
    return "started";
  } catch {
    return "error";
  }
}
