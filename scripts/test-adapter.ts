import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const libsql = createClient({ url: 'file:/tmp/test-turso.db' })
const db = new PrismaClient({ adapter: new PrismaLibSQL(libsql) })

const articles = await db.article.findMany({ take: 2, select: { title: true } })
console.log('OK 文章示例:', articles.map((a) => a.title.slice(0, 20)).join(' / '))

const rec = await db.insightRecord.create({
  data: { question: 'adapter写入测试', name: '测试卦', oracle: 'test', interpret: 'test', advice: 'test' },
})
console.log('OK 写入成功 id:', rec.id.slice(0, 8))
await db.insightRecord.delete({ where: { id: rec.id } })
console.log('OK 删除成功 —— Prisma adapter 模式读写全通')
process.exit(0)
