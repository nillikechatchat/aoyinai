# 敖胤AI 开发者指南

## 环境要求

- Node.js 运行环境
- npm

## 常用命令

```bash
npm run dev
npm run build
npm run start
npm run lint
```

`npm run build` 同时执行静态页面生成和 sitemap、robots 文件写入，是当前可用的完整验证命令。

## 内容维护

文章存放于 `content/posts/`，每篇文章使用 Markdown Front Matter 定义标题、日期、栏目、标签、摘要、封面和发布状态。新增或更新文章时，日期采用当前系统日期和 `+08:00` 时区。

## 赛事维护

赛事记录位于 `lib/competitions.ts`。维护规则：

1. 新赛事通过追加 `CompetitionRecord` 添加稳定 `id`、来源链接、核验日期和关键节点。
2. 已有赛事的日期、奖金、状态或来源变化通过追加 `CompetitionChange` 保存。
3. 历史快照和变更记录保持完整，用于后续页面呈现赛事追溯信息。
4. 赛事来源链接指向主办方或赛事平台页面。

## 样式与组件

- 页面放在 `app/`，复用组件放在 `components/`。
- 样式使用 Tailwind CSS 类名，沿用宣纸、墨色和印章视觉语言。
- 页面 metadata 通过 `lib/site.ts` 的站点配置生成 canonical URL。

## 提交前检查

```bash
npm run build
git diff --check
```

构建通过后检查变更范围，再按提交内容创建 Git commit。
