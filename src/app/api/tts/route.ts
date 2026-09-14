import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** TTS 磁盘缓存目录：同文本+音色+语速命中即秒开（首段合成 3~50s → 二次 <10ms） */
const CACHE_DIR = path.join(process.cwd(), ".tts-cache");
const CACHE_MAX_FILES = 80;

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

    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();

    const response = await zai.audio.tts.create({
      input: content,
      voice,
      speed: clampedSpeed,
      response_format: "wav",
      stream: false,
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));

    if (buffer.length < 100) {
      return NextResponse.json({ ok: false, error: "诵签未成" }, { status: 502 });
    }

    // 落盘缓存（失败不影响返回）
    try {
      if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
      writeFileSync(cachedPath, buffer);
      pruneCache();
    } catch {
      // ignore
    }

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
