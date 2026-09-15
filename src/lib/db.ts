import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'

/**
 * 数据库连接（三优先级，自动切换）：
 * 1. Turso 云库（Vercel 集成标准变量）：
 *    TURSO_DATABASE_URL=libsql://<db>-<user>.turso.io + TURSO_AUTH_TOKEN=<token>
 *    → @prisma/adapter-libsql driver adapter（纯 JS，serverless 友好，读写持久化）
 * 2. DATABASE_URL（libsql:// 或 file:，亦支持 ?authToken= 参数形式）
 * 3. 兜底：本地打包内 SQLite 文件（file:，Vercel 快照只读 / 本地开发可写）
 */

interface ResolvedConnection {
  kind: 'turso' | 'url' | 'file'
  adapter?: PrismaLibSql
  datasourceUrl?: string
}

function resolveConnection(): ResolvedConnection {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim()
  const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim()

  // 1) Turso 标准变量（Vercel 集成自动注入）
  if (tursoUrl) {
    return {
      kind: 'turso',
      adapter: new PrismaLibSql({
        url: tursoUrl,
        authToken: tursoToken || undefined,
      }),
    }
  }

  const raw = process.env.DATABASE_URL?.trim() || ''

  // 2) DATABASE_URL：远程 libsql:// 走 adapter，file: 走原生直连
  if (raw.startsWith('libsql://')) {
    let url = raw
    let authToken = tursoToken || ''
    try {
      const u = new URL(raw)
      const q = u.searchParams.get('authToken')
      if (q && !authToken) authToken = q
      u.searchParams.delete('authToken')
      url = u.toString()
    } catch {
      /* keep as-is */
    }
    return {
      kind: 'turso',
      adapter: new PrismaLibSql({ url, authToken: authToken || undefined }),
    }
  }
  if (raw.startsWith('file:')) {
    return { kind: 'file', datasourceUrl: raw }
  }

  // 3) 兜底：打包内 SQLite（cwd 相对）
  return {
    kind: 'file',
    datasourceUrl: `file:${path.join(process.cwd(), 'db', 'custom.db')}`,
  }
}

function createPrismaClient(): PrismaClient {
  const conn = resolveConnection()
  if (conn.adapter) {
    return new PrismaClient({ log: ['query'], adapter: conn.adapter })
  }
  return new PrismaClient({ log: ['query'], datasourceUrl: conn.datasourceUrl })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
