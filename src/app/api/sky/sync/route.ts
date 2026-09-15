import { NextRequest, NextResponse } from "next/server";
import { runSkySync, skySyncState } from "@/lib/sky-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST /api/sky/sync —— 手动/外部触发同步（force 跳过 10 分钟间隔）
export async function POST(_req: NextRequest) {
  const result = await runSkySync(true);
  if (!result.ok) {
    return NextResponse.json({ ...result, syncedAt: skySyncState().lastSyncAt || null }, { status: 502 });
  }
  return NextResponse.json({ ...result, syncedAt: skySyncState().lastSyncAt || null });
}

// GET /api/sky/sync —— 供 Vercel Cron 或浏览器探活触发
export async function GET(req: NextRequest) {
  const force = req.nextUrl.searchParams.get("force") !== "0";
  const result = await runSkySync(force);
  if (!result.ok) {
    return NextResponse.json({ ...result, syncedAt: skySyncState().lastSyncAt || null }, { status: 502 });
  }
  return NextResponse.json({ ...result, syncedAt: skySyncState().lastSyncAt || null });
}
