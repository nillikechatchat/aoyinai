/**
 * 观天同步状态管理（模块级内存态）
 * - runSkySync：拉取 GitHub issue → upsert 博客收录 → 补抓 OG 预览
 * - 10 分钟最小同步间隔（防 GitHub API 限额被打爆）
 * - lastSyncAt 供 GET /api/sky 做 stale-while-revalidate 后台刷新
 */

import { db } from "@/lib/db";
import { fetchIssueBlogs } from "@/lib/github-issues";
import { fetchOgPreview } from "@/lib/og-fetch";

const MIN_SYNC_INTERVAL_MS = 10 * 60 * 1000;
export const STALE_AFTER_MS = 30 * 60 * 1000;

interface SyncState {
  lastSyncAt: number;
  syncing: boolean;
  lastError: string | null;
}

const g = globalThis as unknown as { __skySync?: SyncState };
g.__skySync ??= { lastSyncAt: 0, syncing: false, lastError: null };

export function skySyncState(): SyncState {
  return g.__skySync!;
}

export function isSkyStale(): boolean {
  return Date.now() - skySyncState().lastSyncAt > STALE_AFTER_MS;
}

export interface SkySyncResult {
  ok: boolean;
  added?: number;
  updated?: number;
  total?: number;
  ogFetched?: number;
  skipped?: boolean;
  error?: string;
}

/** 执行一次同步（issue → 库 → OG 补抓） */
export async function runSkySync(force = false): Promise<SkySyncResult> {
  const state = skySyncState();
  if (state.syncing) return { ok: true, skipped: true };
  if (!force && Date.now() - state.lastSyncAt < MIN_SYNC_INTERVAL_MS) {
    return { ok: true, skipped: true };
  }
  state.syncing = true;
  try {
    const { blogs } = await fetchIssueBlogs();
    let added = 0;
    let updated = 0;

    for (const b of blogs) {
      const existing = await db.blogSky.findUnique({ where: { issueNumber: b.issueNumber } });
      if (!existing) {
        await db.blogSky.create({ data: { ...b } });
        added++;
      } else if (
        existing.title !== b.title ||
        existing.url !== b.url ||
        existing.description !== b.description
      ) {
        await db.blogSky.update({
          where: { issueNumber: b.issueNumber },
          data: { title: b.title, url: b.url, description: b.description, author: b.author, avatar: b.avatar },
        });
        updated++;
      }
    }

    // 补抓 OG 预览（每次最多 6 个，避免同步过慢）
    let ogFetched = 0;
    const needOg = await db.blogSky.findMany({
      where: { ogImage: "", hidden: false },
      take: 6,
      orderBy: { createdAt: "desc" },
    });
    for (const item of needOg) {
      const og = await fetchOgPreview(item.url);
      if (og.image || og.title || og.description) {
        await db.blogSky.update({
          where: { id: item.id },
          data: {
            ...(og.image ? { ogImage: og.image } : {}),
            ...(og.description && !item.description ? { description: og.description } : {}),
          },
        });
      } else {
        // 抓取失败也标记一个占位，避免反复重试（用空格占位）
        await db.blogSky.update({ where: { id: item.id }, data: { ogImage: " " } });
      }
      ogFetched++;
    }

    state.lastSyncAt = Date.now();
    state.lastError = null;
    return { ok: true, added, updated, total: blogs.length, ogFetched };
  } catch (e) {
    state.lastError = (e as Error).message.slice(0, 200);
    return { ok: false, error: state.lastError || "同步失败" };
  } finally {
    state.syncing = false;
  }
}
