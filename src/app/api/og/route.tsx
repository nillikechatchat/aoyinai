import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 字体模块级缓存（首请求加载，其后秒开） */
const fontCache = new Map<string, ArrayBuffer>();

/** 字体候选路径：先读仓内 public/fonts（Vercel/本地生产），再退回沙盒系统目录 */
const FONT_FILES = {
  wenkai: [
    "public/fonts/LXGWWenKai-Light.ttf",
    "/usr/share/fonts/truetype/lxgw-wenkai/LXGWWenKai-Light.ttf",
  ],
  noto: [
    "public/fonts/NotoSerifSC-Black.ttf",
    "/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Black.ttf",
  ],
} as const;

async function resolveFont(key: keyof typeof FONT_FILES): Promise<ArrayBuffer> {
  const cached = fontCache.get(key);
  if (cached) return cached;
  for (const p of FONT_FILES[key]) {
    try {
      const abs = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
      if (!existsSync(abs)) continue;
      const buf = await readFile(abs);
      const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
      fontCache.set(key, ab);
      return ab;
    } catch {
      // 尝试下一个候选路径
    }
  }
  throw new Error(`OG 字体缺失: ${key}（请确认 public/fonts/ 内已放置字体文件）`);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = (searchParams.get("title") || "观智能之潮，守问学之心")
      .slice(0, 48);
    const category = (searchParams.get("category") || "").slice(0, 10);
    const seal = (searchParams.get("seal") || "胤").slice(0, 1);

    const [wenkai, noto] = await Promise.all([
      resolveFont("wenkai"),
      resolveFont("noto"),
    ]);

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #f6f1e2 0%, #efe7d2 55%, #e9dfc6 100%)",
            padding: "56px 64px",
            position: "relative",
          }}
        >
          {/* 双线框 */}
          <div
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              right: 24,
              bottom: 24,
              border: "3px solid rgba(154,49,34,0.85)",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 36,
              left: 36,
              right: 36,
              bottom: 36,
              border: "1px solid rgba(154,49,34,0.4)",
              display: "flex",
            }}
          />

          {/* 头部：栏目印 + 站名 */}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {category ? (
              <div
                style={{
                  width: 64,
                  height: 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#9a3122",
                  color: "#f8f3e7",
                  fontFamily: "wenkai",
                  fontSize: 34,
                  borderRadius: 6,
                  boxShadow: "0 4px 14px rgba(154,49,34,0.35)",
                }}
              >
                {seal}
              </div>
            ) : null}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: "wenkai", fontSize: 40, color: "#2c2a24", letterSpacing: 6 }}>
                敖胤AI
              </span>
              <span style={{ fontFamily: "wenkai", fontSize: 20, color: "#8a7f66", letterSpacing: 4, marginTop: 2 }}>
                {category || "观智能之潮 · 守问学之心"}
              </span>
            </div>
          </div>

          {/* 主标题 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: 8,
              marginLeft: 4,
            }}
          >
            <div
              style={{
                width: 84,
                height: 5,
                background: "linear-gradient(90deg, #9a3122, #c9a35c)",
                display: "flex",
                borderRadius: 3,
              }}
            />
            <div
              style={{
                fontFamily: "noto",
                fontSize: title.length > 18 ? 58 : 72,
                lineHeight: 1.3,
                color: "#2c2a24",
                letterSpacing: 2,
                maxWidth: 980,
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              {title}
            </div>
          </div>

          {/* 底部落款 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "wenkai", fontSize: 24, letterSpacing: 8, color: "#6f6652" }}>
              敖胤AI · 司南问事 · 笔谈以文会友
            </span>
            <div
              style={{
                width: 72,
                height: 72,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "3px solid #9a3122",
                color: "#9a3122",
                fontFamily: "wenkai",
                fontSize: 40,
                borderRadius: 6,
                transform: "rotate(-4deg)",
                opacity: 0.9,
              }}
            >
              胤
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: "wenkai", data: wenkai, weight: 300, style: "normal" },
          { name: "noto", data: noto, weight: 900, style: "normal" },
        ],
      }
    );
  } catch (e) {
    console.error("[GET /api/og]", e);
    return new Response("og 未成", { status: 500 });
  }
}
