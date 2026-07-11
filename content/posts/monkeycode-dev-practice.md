---
title: "用 Monkeycode 开发 AI 博客：从零到上线的完整实践"
date: 2026-07-08T13:00:00+08:00
draft: false
description: "记录使用 Monkeycode AI 智能开发平台构建「敖胤AI」博客的完整流程：需求对话 → 代码生成 → GitHub 提交 → Vercel 自动部署 → Cloudflare CDN 加速。"
categories: ["tutorials"]
tags: ["教程", "Monkeycode", "Vercel", "GitHub", "Cloudflare", "DevOps", "实践"]
image: "covers/llm-basics.svg"
---

## 为什么写这篇文章

「敖胤AI」博客从第一个 commit 到上线，经历了 3 次框架切换（Hugo → Astro → Next.js）、数十次功能迭代、40+ 篇文章，整个过程几乎全部通过 Monkeycode 完成。

这篇文章记录的不是"AI 帮我写了个 Hello World"，而是一个**真实生产项目的完整开发链路**：从需求对话、代码生成、版本管理到自动部署。

## 整体架构

```
用户（对话描述需求）
    ↓
Monkeycode AI Agent（生成代码、运行命令、调试修复）
    ↓
Git commit + push（GitHub 仓库）
    ↓
Vercel Webhook 触发（自动构建）
    ↓
Cloudflare CDN（全球加速分发）
    ↓
用户访问 www.sunzhizhi.cn
```

核心理念：**开发者只需要描述需求，AI 负责从代码到部署的全链路。**

## 第一步：项目初始化

在 Monkeycode 中开启新会话，直接描述需求：

> "帮我用 Next.js 14 创建一个 AI 博客，要支持 Markdown 渲染、分类、标签、暗亮主题切换，风格是水墨绘卷风。"

Monkeycode 会：
1. 自动创建 Next.js 14 项目
2. 安装依赖（gray-matter、rehype-pretty-code、shiki、tailwindcss 等）
3. 生成完整的项目结构
4. 配置 Tailwind 主题色、字体、动画

**不需要手动跑 `npx create-next-app`，不需要手动配 `tailwind.config.js`。**

## 第二步：功能迭代

后续的功能开发全部通过对话完成：

```
用户: "加上 RSS 和 sitemap"
AI:  生成 lib/rss.ts、lib/sitemap.ts、scripts/postbuild.js

用户: "搜索功能，本地搜索，支持中文"
AI:  生成 app/search/page.tsx + components/SearchClient.tsx

用户: "加上不蒜子访问量统计"
AI:  在 layout.tsx 加载脚本，Footer 和文章页添加容器

用户: "新增一个学习路线图页面"
AI:  生成 app/roadmap/page.tsx，7 个阶段、知识点、文章推荐
```

**关键点：AI 不是只生成代码，它会自动运行 `npm run build` 验证构建通过。** 如果构建失败，它会自己读错误信息、修复代码、重新构建，直到通过。

## 第三步：Git 版本管理

每次功能开发完成后，Monkeycode 会：

1. `git add .` 暂存所有改动
2. `git commit -m "feat: 描述"` 提交
3. `git push origin main` 推送到 GitHub

提交信息是 AI 自动生成的，遵循 Conventional Commits 规范：

```
feat: 新增灵感分类 + 4 篇 AI 落地场景文章
fix: 移动端页脚定位 — html height:auto 覆盖 Tailwind base 锁死高度
chore: 页脚和 README 添加 Monkeycode 致谢
```

**不需要手动 `git add`、不需要写 commit message、不需要 `git push`。**

## 第四步：Vercel 自动部署

### 配置

1. 在 Vercel 中导入 GitHub 仓库
2. 设置 Framework Preset 为 Next.js
3. 配置 `vercel.json`：

```json
{
  "framework": null,
  "outputDirectory": "out"
}
```

4. 设置环境变量：

```
NEXT_PUBLIC_SITE_URL=https://www.sunzhizhi.cn
```

### 为什么用 `output: 'export'` + `framework: null`

Next.js 14 的 `output: 'export'` 会生成纯静态文件到 `out/` 目录。配合 Vercel 的 `framework: null` + `outputDirectory: "out"`，Vercel 不会尝试运行 Next.js 的服务端渲染，直接托管静态文件。

这样做的好处：
- 不需要服务器，零运维成本
- Vercel 免费额度足够个人博客使用
- 构建速度快（通常 1-2 分钟）

### 自动触发

每次 `git push origin main` 后，Vercel 的 Webhook 会自动触发构建：

```
git push → GitHub Webhook → Vercel 构建 → 部署到边缘节点
```

整个过程不需要手动操作，从 push 到上线通常 1-2 分钟。

## 第五步：Cloudflare CDN 加速

### 为什么需要 Cloudflare

Vercel 的边缘节点在国内访问速度一般。通过 Cloudflare CDN 可以：
- 缓存静态资源，减少回源请求
- 国内节点加速（Cloudflare 在国内有合作伙伴节点）
- 提供 HTTPS 证书
- DDoS 防护

### 配置步骤

1. 在 Cloudflare 添加域名 `sunzhizhi.cn`
2. 修改域名的 NS 记录指向 Cloudflare
3. 添加 CNAME 记录：
   - `www` → `cname.vercel-dns.com`
   - `@` → `cname.vercel-dns.com`
4. 开启 Cloudflare 的代理（橙色云朵）
5. 配置缓存规则：
   - `/_next/static/*` → 缓存 1 年
   - `*.html` → 缓存 4 小时
   - `*.css` / `*.js` → 缓存 1 个月

### Vercel 域名配置

在 Vercel 的项目设置中：
1. 添加自定义域名 `www.sunzhizhi.cn`
2. Vercel 会自动配置 SSL 证书
3. 设置 `sunzhizhi.cn` 重定向到 `www.sunzhizhi.cn`

## 开发工作流总结

```
1. 在 Monkeycode 对话框描述需求
2. AI 自动生成代码、运行构建、修复错误
3. AI 自动 git commit + push
4. Vercel 自动构建 + 部署
5. Cloudflare CDN 自动缓存 + 分发
6. 1-2 分钟后线上生效
```

**开发者的工作量：描述需求（一句话）+ 确认（点击）。**

## 实际开发数据

| 指标 | 数据 |
|------|------|
| 开发周期 | 约 2 周 |
| Git commits | 50+ |
| 文章数量 | 40+ |
| 页面数量 | 70+ |
| 框架切换 | 3 次（Hugo → Astro → Next.js） |
| 手动写代码 | 接近 0（全部由 AI 生成） |

## 遇到的问题和解决

### 1. 中文标签 500 错误

**问题**：`/tags/人工智能` 返回 500。

**原因**：Next.js 静态导出时，中文路径需要 URL 编码。

**解决**：AI 自动在 `generateStaticParams` 中添加 `encodeURIComponent(tag)`，在页面中添加 `decodeURIComponent(params.tag)`。

### 2. 移动端页脚不在底部

**问题**：手机浏览器上页脚不在页面底部。

**原因**：Tailwind `@tailwind base` 设置 `html { height: 100% }`，锁死 html 高度。

**解决**：AI 在 `globals.css` 中添加 `html { height: auto }` 覆盖，并使用 `min-h-dvh`（动态视口高度）。

### 3. 不蒜子访问量不显示

**问题**：访问量统计容器显示为空。

**原因**：之前给容器添加了 `style="display:none"`，但 busuanzi 脚本只设置 innerHTML，不修改 display 属性。

**解决**：移除 `display:none`，添加 5 秒延迟兜底脚本。

### 4. Vercel 构建失败

**问题**：`routes-manifest.json` 错误。

**原因**：Vercel 默认将 Next.js 项目作为 SSR 部署，但 `output: 'export'` 是纯静态。

**解决**：在 `vercel.json` 中设置 `framework: null` + `outputDirectory: "out"`。

## 经验总结

### 1. 需求描述越具体，AI 输出越好

```
差: "帮我做个博客"
好: "用 Next.js 14 做一个 AI 博客，支持 Markdown 渲染、7 个分类、暗亮主题切换，风格是水墨绘卷风"
```

### 2. 让 AI 自己验证

Monkeycode 会在每次修改后自动运行 `npm run build`，如果构建失败会自己修复。**不需要人工检查代码。**

### 3. 小步迭代，频繁提交

每次功能完成后立即提交，避免积累大量改动。这样：
- 出问题容易回滚
- Vercel 构建速度快
- Git 历史清晰

### 4. 善用 AI 的搜索能力

AI 可以联网搜索最新的技术方案、API 文档、竞品信息。比如：
- 搜索"不蒜子访问量统计"的正确用法
- 搜索"Vercel Next.js 静态导出"的配置方法
- 搜索最新的 AI 赛事信息并自动更新文章

### 5. AI 不只是写代码

Monkeycode 还能：
- 写文章内容（基于搜索结果）
- 设计页面布局
- 生成 SVG 图标和封面
- 分析截图并优化 UI
- 管理 Git 提交和推送

## 技术栈总结

| 层 | 技术 | 作用 |
|---|---|---|
| 开发 | Monkeycode AI | 代码生成、调试、部署 |
| 框架 | Next.js 14 | 静态导出、App Router |
| 样式 | Tailwind CSS | 原子化 CSS、暗亮主题 |
| 内容 | Markdown + gray-matter | 文章管理 |
| 部署 | Vercel | 自动构建 + 边缘托管 |
| CDN | Cloudflare | 全球加速 + 安全防护 |
| 域名 | sunzhizhi.cn | 自定义域名 |
| 统计 | 不蒜子 | 访问量统计 |
| 代码 | GitHub | 版本管理 |

## 结语

用 AI 开发网站，不是"AI 帮我写了几个函数"，而是**整个开发流程的重构**：

- 从"写代码"变成"描述需求"
- 从"调试 bug"变成"告诉 AI 哪里不对"
- 从"手动部署"变成"push 即上线"

开发者的核心能力从"写代码"变成了"描述问题"和"判断结果"。

这可能是未来几年软件开发的主流模式。
