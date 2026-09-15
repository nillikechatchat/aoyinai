import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import path from 'path'

/**
 * 数据库连接（双模式，自动切换）：
 * - 本地开发：DATABASE_URL=file:./db/custom.db → Prisma 原生直连 SQLite 文件
 * - Turso 云库：DATABASE_URL=libsql://<db>-<user>.turso.io?authToken=<token>
 *   → 走 @prisma/adapter-libsql driver adapter（纯 JS，serverless 友好，读写持久化）
 *   authToken 优先读 TURSO_AUTH_TOKEN 环境变量，其次解析 URL 的 ?authToken= 参数
 * - 兜底：未配置任何 DATABASE_URL 时回退到打包内的 SQLite 文件（Vercel 只读快照，仅可读）
 */

function resolveDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL?.trim() ||
    `file:${path.join(process.cwd(), 'db', 'custom.db')}`
  )
}

function createPrismaClient(): PrismaClient {
  const raw = resolveDatabaseUrl()

  // 远程 libSQL（Turso 等）：libsql:// 开头走 driver adapter
  if (raw.startsWith('libsql://')) {
    let url = raw
    let authToken = process.env.TURSO_AUTH_TOKEN?.trim() || ''
    try {
      const u = new URL(raw)
      const q = u.searchParams.get('authToken')
      if (q && !authToken) authToken = q
      u.searchParams.delete('authToken')
      url = u.toString()
    } catch {
      /* URL 解析失败则保持原样 */
    }
    const libsql = createClient({ url, authToken: authToken || undefined })
    return new PrismaClient({
      log: ['query'],
      adapter: new PrismaLibSQL(libsql),
    })
  }

  // 本地 SQLite 文件
  return new PrismaClient({
    log: ['query'],
    datasourceUrl: raw,
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
