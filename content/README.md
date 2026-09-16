# 内容目录（Markdown 发布）

本目录下的 `.md` 文件是站点文章的来源。每条文章对应一篇 `content/posts/<slug>.md`，frontmatter 决定发布状态与栏目归属。

## 发布规则

1. **新增**：在 `content/posts/` 下新建 `<slug>.md`，frontmatter 里 `draft: false` 即视为发布；`categories` 第一个条目决定栏目。
2. **更新**：直接修改对应 `.md` 文件内容或 frontmatter。
3. **下架**：把 frontmatter 的 `draft` 改为 `true`，或删掉该文件（脚本会做软删）。
4. **同步到数据库**：提交代码后 Vercel 会在构建期自动运行 `node scripts/sync-content.mjs`；本地开发可手动跑：
   ```bash
   DATABASE_URL=file:./db/custom.db node scripts/sync-content.mjs
   ```
   线上 Turso 数据需在 Vercel 部署时另行迁移（或接入 CI 任务写远端）。

## Frontmatter 字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `title` | string | 必填，文章标题（用于 slug 生成） |
| `date` | string | 必填，ISO 日期，如 `2026-09-16` |
| `draft` | boolean | 可选，默认 `false`；`true` 即不发布 |
| `description` | string | 摘要，替代数据库的 `excerpt` |
| `categories` | string[] | 必填，第一个作为栏目 key（`tutorials/market/majors/events/hackathons/cloud-deals/t-agent`） |
| `tags` | string[] | 可选 |
| `cover` | string | 可选，封面路径，如 `/images/cover-tutorials.png` |

## 快速上手示例

```markdown
---
title: "工具调用实战：让大模型从会聊天到会办事"
date: 2026-09-16
draft: false
description: "模型再聪明，也够不着你的数据库。本文拆解工程上真正的难点。"
categories: ["tutorials"]
tags: ["Function Calling", "工具调用", "Agent"]
cover: /images/cover-tutorials.png
---

## 一、只会说话的模型...

正文用 markdown。
```

## 注意

- slug 由 `title` 自动生成（转小写、去特殊字符），如果已有同名文章会复用现有 slug。
- `content` 中的 markdown 图片用相对或绝对路径均可（站内的图走 `/images/` 或 `/images/illu-*.png`）。
- 本目录下的文件与 `scripts/seed.ts` 是两股数据源；`seed.ts` 负责初始播种，`content/posts/` 负责日常迭代。两者同步时以 md 为准。
