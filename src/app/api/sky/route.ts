import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isSkyStale, runSkySync, skySyncState } from "@/lib/sky-sync";

export const dynamic = "force-dynamic";

// GET /api/sky?sort=clicks|new&limit= —— 观天列表（默认按点击率降序）
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort") === "new" ? "new" : "clicks";
    const limit = Math.min(Number(searchParams.get("limit")) || 60, 200);

    const [items, total] = await Promise.all([
      db.blogSky.findMany({
        where: { hidden: false },
        orderBy:
          sort === "new"
            ? [{ createdAt: "desc" }]
            : [{ clicks: "desc" }, { createdAt: "desc" }],
        take: limit,
      }),
      db.blogSky.count({ where: { hidden: false } }),
    ]);

    // stale-while-revalidate：数据过期则后台静默同步（不阻塞响应）
    let syncing = false;
    if (isSkyStale() && !skySyncState().syncing) {
      syncing = true;
      void runSkySync().catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      items,
      total,
      sort,
      syncedAt: skySyncState().lastSyncAt || null,
      syncing,
    });
  } catch (e) {
    console.error("[GET /api/sky]", e);
    return NextResponse.json({ ok: false, error: "观天数据获取失败" }, { status: 500 });
  }
}
