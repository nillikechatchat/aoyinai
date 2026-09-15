/**
 * 数据迁移：本地 SQLite → Turso（libSQL 云库）
 *
 * 用法（三选一）：
 *   1. TURSO_URL=libsql://xxx-xxx.turso.io TURSO_AUTH_TOKEN=eyJxxx bun run scripts/migrate-to-turso.ts
 *   2. bun run scripts/migrate-to-turso.ts --url 'libsql://xxx-xxx.turso.io?authToken=eyJxxx'
 *   3. bunx tsx scripts/migrate-to-turso.ts --url ...（等价）
 *
 * 行为（幂等，可重复执行）：
 *   ① 从本地库读取全部建表 DDL（sqlite_master），在远程 CREATE TABLE IF NOT EXISTS
 *   ② 同步全部索引（已存在则忽略）
 *   ③ 逐表搬运数据：先 DELETE 远程旧数据，再分批 INSERT（batch 50 条/批）
 *
 * 可选环境变量：
 *   LOCAL_DB=路径   指定本地 SQLite 文件（默认 db/custom.db）
 */

import { createClient, type InValue } from '@libsql/client'
import path from 'path'
import fs from 'fs'

interface RemoteTarget {
  url: string
  authToken?: string
}

function parseRemoteTarget(): RemoteTarget | null {
  const args = process.argv.slice(2)
  let raw = process.env.TURSO_URL?.trim() || ''

  const urlIdx = args.indexOf('--url')
  if (urlIdx >= 0 && args[urlIdx + 1]) raw = args[urlIdx + 1].trim()

  if (!raw) return null
  if (!raw.startsWith('libsql://') && !raw.startsWith('file:')) {
    console.error(`✗ 远程地址必须以 libsql:// 开头（file: 仅用于本地联调测试），收到：${raw}`)
    process.exit(1)
  }

  let url = raw
  let authToken = process.env.TURSO_AUTH_TOKEN?.trim() || ''
  try {
    const u = new URL(raw)
    const q = u.searchParams.get('authToken')
    if (q && !authToken) authToken = q
    u.searchParams.delete('authToken')
    url = u.toString()
  } catch {
    /* keep as-is */
  }
  return { url, authToken: authToken || undefined }
}

async function main() {
  const target = parseRemoteTarget()
  if (!target) {
    console.error(
      '✗ 缺少远程库地址。用法：\n' +
        '    TURSO_URL=libsql://xxx.turso.io TURSO_AUTH_TOKEN=xxx bun run scripts/migrate-to-turso.ts\n' +
        '  或\n' +
        "    bun run scripts/migrate-to-turso.ts --url 'libsql://xxx.turso.io?authToken=xxx'"
    )
    process.exit(1)
  }

  // 1. 连接本地库
  const localPath = process.env.LOCAL_DB?.trim() || path.join(process.cwd(), 'db', 'custom.db')
  if (!fs.existsSync(localPath)) {
    console.error(`✗ 本地数据库不存在：${localPath}`)
    process.exit(1)
  }
  const local = createClient({ url: `file:${localPath}` })
  console.log(`✓ 本地库：${localPath}`)

  // 2. 连接远程库（连通性测试）
  const remote = createClient(target)
  try {
    await remote.execute('SELECT 1')
    console.log(`✓ 远程库：${target.url}`)
  } catch (e) {
    console.error('✗ 远程库连接失败，请检查 URL 与 authToken：', (e as Error).message)
    process.exit(1)
  }

  // 3. 建表（DDL 同步，幂等）
  const tablesRes = await local.execute(
    "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations' AND name NOT LIKE '_cf_KV'"
  )
  const tableNames: string[] = []
  for (const row of tablesRes.rows) {
    const name = String(row.name)
    const ddl = String(row.sql).replace(/CREATE TABLE\s+(?!IF NOT EXISTS)/i, 'CREATE TABLE IF NOT EXISTS ')
    await remote.execute(ddl)
    tableNames.push(name)
    console.log(`✓ 远程表已就绪：${name}`)
  }

  // 4. 索引同步（已存在则忽略）
  const idxRes = await local.execute(
    "SELECT sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL AND name NOT LIKE 'sqlite_%'"
  )
  for (const row of idxRes.rows) {
    try {
      await remote.execute(String(row.sql))
    } catch {
      /* 索引已存在 */
    }
  }
  console.log(`✓ 索引同步完成（${idxRes.rows.length} 个）`)

  // 5. 数据搬运
  let total = 0
  for (const t of tableNames) {
    const res = await local.execute({ sql: `SELECT * FROM "${t}"`, args: [] })
    await remote.execute(`DELETE FROM "${t}"`)
    if (res.rows.length > 0) {
      const cols = res.columns
      const colList = cols.map((c) => `"${c}"`).join(', ')
      const placeholders = cols.map(() => '?').join(', ')
      const stmts = res.rows.map((r) => ({
        sql: `INSERT INTO "${t}" (${colList}) VALUES (${placeholders})`,
        args: Array.from(r) as InValue[],
      }))
      for (let i = 0; i < stmts.length; i += 50) {
        await remote.batch(stmts.slice(i, i + 50))
      }
    }
    console.log(`✓ ${t}: ${res.rows.length} 行已迁移`)
    total += res.rows.length
  }

  console.log(`\n🎉 迁移完成！共 ${total} 行数据已写入 Turso。`)
  console.log('下一步：在 Vercel 环境变量中设置 DATABASE_URL=libsql://…?authToken=… 后重新部署。')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('✗ 迁移失败：', e)
    process.exit(1)
  })
