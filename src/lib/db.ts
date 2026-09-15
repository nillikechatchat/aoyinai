import { PrismaClient } from '@prisma/client'
import path from 'path'

// 数据库连接兜底：
// - 本地/沙盒：使用 .env 的 DATABASE_URL
// - Vercel 等 serverless：未配置 DATABASE_URL 时，回退到打包进 bundle 的 SQLite 文件
//   （需配合 next.config.ts 的 outputFileTracingIncludes 将 db/custom.db 打入 lambda）
const datasourceUrl =
  process.env.DATABASE_URL || `file:${path.join(process.cwd(), 'db', 'custom.db')}`

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasourceUrl,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
