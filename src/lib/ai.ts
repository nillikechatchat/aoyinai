/**
 * 统一 AI 访问层 —— 双通道设计，保证沙盒与 Vercel 均可运行：
 *
 * 通道 1（沙盒/自有网关）：z-ai-web-dev-sdk
 *   - 依赖 .z-ai-config（./、~ 或 /etc），沙盒内天然存在；
 *   - Vercel 上不存在该配置文件，SDK 初始化会抛错 → 自动跳过。
 *
 * 通道 2（生产环境兜底）：OpenAI 兼容 Chat API
 *   - 环境变量 AI_API_KEY / AI_BASE_URL / AI_MODEL（部署时在 Vercel 配置）；
 *   - 兼容 OpenAI、DeepSeek、智谱开放平台、SiliconFlow 等 OpenAI 格式服务。
 *
 * 两通道皆不可用时返回 null，由调用方自行降级：
 *   - 问签：本地兜底签池（FALLBACK_INSIGHTS）
 *   - 速览：返回明确错误，前端 toast 提示
 *   - TTS：返回明确错误，前端提示「暂不可用」
 */

export interface ChatMessage {
  role: "system" | "assistant" | "user";
  content: string;
}

interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
}

/** 是否已配置 OpenAI 兼容兜底通道 */
export function hasOpenAICompat(): boolean {
  return Boolean(process.env.AI_API_KEY && process.env.AI_BASE_URL);
}

/** 通道 1：z-ai-web-dev-sdk（动态 import，避免无配置环境构建期报错） */
async function tryZaiChat(messages: ChatMessage[], opts?: ChatOptions): Promise<string | null> {
  try {
    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: "disabled" },
      ...(opts?.temperature !== undefined ? { temperature: opts.temperature } : {}),
      ...(opts?.maxTokens !== undefined ? { maxTokens: opts.maxTokens } : {}),
    });
    const text = completion.choices[0]?.message?.content || "";
    return text.trim() ? text : null;
  } catch (e) {
    console.warn("[ai] z-ai-web-dev-sdk 不可用（沙盒外属预期）:", (e as Error)?.message);
    return null;
  }
}

/** 通道 2：OpenAI 兼容 Chat Completions */
async function tryOpenAICompatChat(
  messages: ChatMessage[],
  opts?: ChatOptions
): Promise<string | null> {
  if (!hasOpenAICompat()) return null;
  try {
    const base = (process.env.AI_BASE_URL || "").replace(/\/+$/, "");
    const model = process.env.AI_MODEL || "gpt-4o-mini";
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        ...(opts?.temperature !== undefined ? { temperature: opts.temperature } : {}),
        ...(opts?.maxTokens !== undefined ? { max_tokens: opts.maxTokens } : {}),
      }),
      signal: AbortSignal.timeout(50_000),
    });
    if (!res.ok) {
      console.warn("[ai] OpenAI 兼容通道失败:", res.status, (await res.text()).slice(0, 200));
      return null;
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content || "";
    return text.trim() ? text : null;
  } catch (e) {
    console.warn("[ai] OpenAI 兼容通道异常:", (e as Error)?.message);
    return null;
  }
}

/**
 * 文本生成：先走沙盒 SDK，失败自动切换 OpenAI 兼容通道。
 * @returns 生成的文本；两通道皆失败返回 null
 */
export async function aiChat(
  messages: ChatMessage[],
  opts?: ChatOptions
): Promise<string | null> {
  const viaSdk = await tryZaiChat(messages, opts);
  if (viaSdk) return viaSdk;
  return tryOpenAICompatChat(messages, opts);
}

/* ------------------------------ TTS ------------------------------ */

const OPENAI_TTS_VOICES = new Set([
  "alloy",
  "echo",
  "fable",
  "onyx",
  "nova",
  "shimmer",
]);

/** 是否已配置 OpenAI 兼容 TTS 兜底通道 */
export function hasTtsCompat(): boolean {
  return Boolean(
    (process.env.TTS_API_KEY || process.env.AI_API_KEY) &&
      (process.env.TTS_BASE_URL || process.env.AI_BASE_URL)
  );
}

/**
 * 语音合成：先走沙盒 SDK，失败自动切换 OpenAI 兼容 /audio/speech。
 * @returns wav 音频 Buffer；两通道皆失败返回 null
 */
export async function aiTts(params: {
  input: string;
  voice: string;
  speed: number;
}): Promise<Buffer | null> {
  // 通道 1：z-ai-web-dev-sdk
  try {
    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();
    const response = await zai.audio.tts.create({
      input: params.input,
      voice: params.voice,
      speed: params.speed,
      response_format: "wav",
      stream: false,
    });
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));
    if (buffer.length > 100) return buffer;
  } catch (e) {
    console.warn("[ai:tts] z-ai-web-dev-sdk 不可用（沙盒外属预期）:", (e as Error)?.message);
  }

  // 通道 2：OpenAI 兼容 TTS
  if (!hasTtsCompat()) return null;
  try {
    const base = (process.env.TTS_BASE_URL || process.env.AI_BASE_URL || "").replace(/\/+$/, "");
    const model = process.env.TTS_MODEL || "tts-1";
    // 前端传入的音色（如 xiaochen）在 OpenAI 列表外时回退默认音色
    const voice =
      process.env.TTS_VOICE || (OPENAI_TTS_VOICES.has(params.voice) ? params.voice : "alloy");
    const res = await fetch(`${base}/audio/speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TTS_API_KEY || process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        input: params.input,
        voice,
        speed: params.speed,
        response_format: "wav",
      }),
      signal: AbortSignal.timeout(55_000),
    });
    if (!res.ok) {
      console.warn("[ai:tts] OpenAI 兼容通道失败:", res.status, (await res.text()).slice(0, 200));
      return null;
    }
    const buffer = Buffer.from(new Uint8Array(await res.arrayBuffer()));
    return buffer.length > 100 ? buffer : null;
  } catch (e) {
    console.warn("[ai:tts] OpenAI 兼容通道异常:", (e as Error)?.message);
    return null;
  }
}
