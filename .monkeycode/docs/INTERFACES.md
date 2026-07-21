# 敖胤AI 接口文档

## 页面路由

| 路由 | 责任 |
| --- | --- |
| `/` | 首页与推荐文章 |
| `/blog` | 全部文章 |
| `/blog/[id]` | 单篇文章 |
| `/categories/[slug]` | 栏目文章列表 |
| `/tags/[tag]` | 标签文章列表 |
| `/archives` | 年度归档 |
| `/search` | 客户端文章搜索 |
| `/stats` | AI 赛事统计 |
| `/rss.xml` | RSS Feed |
| `/roadmap` | AI 学习路线图 |
| `/community` | 社区导航 |
| `/bookmarks` | 收藏文章 |
| `/about` | 站点信息 |

## 内容接口

`lib/posts.ts` 导出以下构建期内容函数：

| 函数 | 返回值 | 作用 |
| --- | --- | --- |
| `getSortedPosts()` | `Post[]` | 读取并按日期倒序返回已发布文章 |
| `getPostById(id)` | `Post \| null` | 读取指定文章 |
| `markdownToHtml(markdown)` | `Promise<string>` | 将 Markdown 转换为 HTML |
| `getAllCategories()` | `string[]` | 收集栏目名称 |
| `getAllTags()` | `string[]` | 收集标签名称 |
| `getPostsByCategory(category)` | `Post[]` | 过滤栏目文章 |
| `getPostsByTag(tag)` | `Post[]` | 过滤标签文章 |
| `getPostsByYear()` | `Record<string, Post[]>` | 按年份分组文章 |

`Post` 的主要字段包括 `id`、`title`、`description`、`date`、`updated`、`categories`、`tags`、`cover`、`draft` 和 `content`。

## 赛事数据接口

`lib/competitions.ts` 定义赛事数据模型：

| 类型 | 作用 |
| --- | --- |
| `CompetitionRecord` | 赛事初始快照、稳定标识、核验日期与更新记录 |
| `CompetitionSnapshot` | 页面显示的赛事名称、赛道、奖金、状态、截止日期、来源和关键日期 |
| `CompetitionChange` | 可追加的赛事信息修订记录 |
| `ResolvedCompetition` | 已按变更日期合并并附带最后更新时间的展示快照 |
| `CompetitionTimelineItem` | 与赛事关联的截止、结果、决赛或颁奖节点 |

`competitionRecords` 是赛事记录集合；`competitionDataVerifiedAt` 是当前数据核验日期；`competitionTimeline` 汇总活跃赛事的未来关键日期。

| 函数 | 返回值 | 作用 |
| --- | --- | --- |
| `resolveCompetition(record)` | `ResolvedCompetition` | 按更新日期合并赛事字段，并为缺少有效来源或截止日期的记录标记待核验。 |
| `getActiveCompetitions(asOf, records?)` | `ResolvedCompetition[]` | 筛选截止日期未过、来源与日期有效且状态为报名中的赛事。 |
| `getArchivedCompetitions(asOf, records?)` | `ResolvedCompetition[]` | 筛选截止日期早于核验日期的赛事。 |
| `getTotalPrize(competitions)` | `number` | 汇总赛事集合中已公开的奖金数值。 |
| `getTimelineItems(records, asOf)` | `CompetitionTimelineItem[]` | 汇总活跃赛事的未来节点并按日期升序排列。 |

`components/StatsPageContent.tsx` 导出统计页内容与 `CompetitionTable`。前者组合活跃概览、奖金比较、赛道分布、时间轴和默认折叠的归档区域；后者复用于活跃与归档赛事，提供来源链接和变更历史。

## 外部服务

- Google Fonts：站点字体资源。
- 不蒜子：页面访问量显示。
- 赛事主办方网站：赛事来源链接，由浏览者直接访问。
