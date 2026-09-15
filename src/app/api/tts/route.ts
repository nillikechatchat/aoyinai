import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from "fs";
import path from "path";
import { aiTts, hasTtsCompat } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** TTS 磁盘缓存目录：同文本+音色+语速命中即秒开（首段合成 3~50s → 二次 <10ms）
 *  Vercel 等只读文件系统平台请设 TTS_CACHE_DIR=/tmp/tts-cache（实例内缓存，重启即失） */
const CACHE_DIR =
  process.env.TTS_CACHE_DIR || path.join(process.cwd(), ".tts-cache");
const CACHE_MAX_FILES = 80;
const STATS_FILE = path.join(CACHE_DIR, "stats.json");

/** 命中/未中计数（持久化于 .tts-cache/stats.json，供 /api/stats 展示） */
function bumpTtsStat(kind: "hits" | "misses") {
  try {
    if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
    let stats: { hits: number; misses: number } = { hits: 0, misses: 0 };
    if (existsSync(STATS_FILE)) {
      try {
        const parsed = JSON.parse(readFileSync(STATS_FILE, "utf-8")) as Partial<{
          hits: number;
          misses: number;
        }>;
        stats.hits = Number(parsed.hits) || 0;
        stats.misses = Number(parsed.misses) || 0;
      } catch {
        // 损坏则重置
      }
    }
    stats[kind] += 1;
    writeFileSync(STATS_FILE, JSON.stringify(stats), "utf-8");
  } catch {
    // 统计失败不影响诵读
  }
}

function cacheKey(text: string, voice: string, speed: number): string {
  return createHash("sha256").update(`${voice}|${speed}|${text}`).digest("hex");
}

/** 回收最旧的缓存文件，保持上限 */
function pruneCache() {
  try {
    if (!existsSync(CACHE_DIR)) return;
    const files = readdirSync(CACHE_DIR)
      .filter((f) => f.endsWith(".wav"))
      .map((f) => {
        const p = path.join(CACHE_DIR, f);
        return { p, mtime: statSync(p).mtimeMs };
      })
      .sort((a, b) => a.mtime - b.mtime);
    for (const f of files.slice(0, Math.max(0, files.length - CACHE_MAX_FILES))) {
      try {
        unlinkSync(f.p);
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
}

// POST /api/tts —— 「听签」：签文转语音（z-ai-web-dev-sdk，仅后端；带磁盘缓存）
export async function POST(req: NextRequest) {
  try {
    const { text, voice = "xiaochen", speed = 0.9 } = await req
      .json()
      .catch(() => ({}));

    const content = String(text ?? "").trim();
    if (!content) {
      return NextResponse.json({ ok: false, error: "无可诵之文" }, { status: 400 });
    }
    if (content.length > 1024) {
      return NextResponse.json(
        { ok: false, error: "签文过长，不可成诵" },
        { status: 400 }
      );
    }

    const clampedSpeed = Math.min(Math.max(Number(speed) || 0.9, 0.5), 2.0);
    const key = cacheKey(content, voice, clampedSpeed);

    // 磁盘缓存命中：直接回放
    const cachedPath = path.join(CACHE_DIR, `${key}.wav`);
    if (existsSync(cachedPath)) {
      try {
        const buf = readFileSync(cachedPath);
        if (buf.length > 100) {
          bumpTtsStat("hits");
          return new NextResponse(buf, {
            status: 200,
            headers: {
              "Content-Type": "audio/wav",
              "Content-Length": buf.length.toString(),
              "Cache-Control": "no-cache",
              "X-TTS-Cache": "hit",
            },
          });
        }
      } catch {
        // 缓存读失败则走合成
      }
    }

    // 统一 AI 层：沙盒 SDK → OpenAI 兼容 TTS 通道
    const buffer = await aiTts({ input: content, voice, speed: clampedSpeed });

    if (!buffer) {
      return NextResponse.json(
        {
          ok: false,
          error: hasTtsCompat()
            ? "诵签未成，请稍后再试"
            : "语音服务未配置（部署时需设置 TTS_API_KEY / TTS_BASE_URL）",
        },
        { status: hasTtsCompat() ? 502 : 503 }
      );
    }

    // 落盘缓存（失败不影响返回）
    try {
      if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
      writeFileSync(cachedPath, buffer);
      pruneCache();
    } catch {
      // ignore
    }
    bumpTtsStat("misses");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-cache",
        "X-TTS-Cache": "miss",
      },
    });
  } catch (e) {
    console.error("[POST /api/tts]", e);
    return NextResponse.json({ ok: false, error: "诵签未成，请稍后再试" }, { status: 500 });
  }
}
