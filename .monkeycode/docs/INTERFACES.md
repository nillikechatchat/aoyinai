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
| `CompetitionTimelineItem` | 与赛事关联的截止、结果、决赛或颁奖节点 |

`competitionRecords` 是赛事记录集合；`competitionTimeline` 汇总每场赛事的关键日期，供当前统计页渲染。

## 外部服务

- Google Fonts：站点字体资源。
- 不蒜子：页面访问量显示。
- 赛事主办方网站：赛事来源链接，由浏览者直接访问。
