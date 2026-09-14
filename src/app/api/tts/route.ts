import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST /api/tts —— 「听签」：签文转语音（z-ai-web-dev-sdk，仅后端）
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

    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();

    const response = await zai.audio.tts.create({
      input: content,
      voice,
      speed: Math.min(Math.max(speed, 0.5), 2.0),
      response_format: "wav",
      stream: false,
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));

    if (buffer.length < 100) {
      return NextResponse.json({ ok: false, error: "诵签未成" }, { status: 502 });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    console.error("[POST /api/tts]", e);
    return NextResponse.json({ ok: false, error: "诵签未成，请稍后再试" }, { status: 500 });
  }
}
