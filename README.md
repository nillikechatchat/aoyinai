# 敖胤AI

一个聚焦人工智能的中文博客，覆盖 **7 大主题分类**，持续更新。

## 内容栏目

| 栏目 | 简介 |
|------|------|
| [AI 教程](/categories/tutorials) | LLM 入门、RAG、Agent 实战的入门到进阶 |
| [市场分析](/categories/market) | 大模型厂商竞争格局、价格趋势 |
| [高校专业](/categories/majors) | 国内 AI 强校课程与就业去向 |
| [赛事活动](/categories/events) | Kaggle、NeurIPS 等顶赛清单 |
| [黑客松](/categories/hackathons) | 高质量 AI 黑客松实时推荐 |
| [云厂商优惠](/categories/cloud-deals) | 阿里云、腾讯云、华为云、火山引擎大模型 API 优惠汇总 |
| [T-agent](/categories/t-agent) | 我正在做的多智能体协作框架 |

## 技术栈

- **Next.js 14** - React 框架，App Router（`output: 'export'` 静态导出）
- **Tailwind CSS** - 原子化 CSS，自定义 AI 渐变变量
- **Framer Motion** - 入场动画、悬浮动效
- **rehype-pretty-code + Shiki** - GitHub Dark Dimmed 主题代码高亮
- **remark-gfm** - GitHub Flavored Markdown（表格、删除线、任务列表）
- **Lucide React** - 图标库
- **gray-matter** - Markdown 前置元数据解析

## 核心功能

- **7 大主题分类** — 教程 / 市场 / 高校 / 赛事 / 黑客松 / 云厂商 / T-agent
- **暗/亮色主题切换** — Header 右上角一键切换 + localStorage 持久化 + 系统偏好检测
- **代码高亮** — rehype-pretty-code + Shiki 双主题，标题栏 + 行号 + 高亮行
- **本地全文搜索** — `/search` 页面，标题/描述/标签/分类/正文多字段加权匹配 + 高亮
- **RSS 订阅** — `/rss.xml`，标准 RSS 2.0 + Atom 自描述
- **SEO 优化** — 自动 sitemap.xml（5 静态 + 7 分类 + 23 标签 + 8 文章）、robots.txt、OpenGraph、Twitter Card、每篇文章独立 metadata
- **阅读时长统计** — 中文 350 字 / 分钟 + 英文 200 词 / 分钟，中英混合精确计算
- **科技感动效** — AI 渐变文字循环、Hero 网格背景、卡片悬浮上浮、Framer Motion 错开入场

## 本地开发

需要 Node.js ≥ 18。

```bash
# 安装依赖
npm install

# 启动开发服务器（默认端口 3000，带热更新）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm start
```

打开 http://localhost:3000 即可预览。

## 写新文章

在 `content/blog/` 下新建 `.md` 文件：

```markdown
---
title: "文章标题"
date: 2026-07-01T10:00:00+08:00
description: "一句话描述，搜索引擎和卡片显示用"
categories: ["tutorials"]
tags: ["LLM", "RAG"]
image: "/covers/my-cover.svg"
draft: false
---

## 正文

从这里开始写…
```

`categories` 取值范围：`tutorials` / `market` / `majors` / `events` / `hackathons` / `cloud-deals` / `t-agent`。

封面图放在 `public/covers/`，建议 SVG 格式（体积小、矢量）。

## 部署到 Vercel

1. 推送到 GitHub
2. 在 Vercel Dashboard 导入仓库 `nillikechatchat/aoyinai`
3. Framework Preset 自动识别为 Next.js
4. 部署完成后得到 `aoyinai.vercel.app` 域名

## 项目结构

```
.
├── app/
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 首页
│   ├── globals.css          # 全局样式
│   ├── blog/
│   │   ├── page.tsx         # 博客列表
│   │   └── [id]/page.tsx    # 文章详情
│   ├── categories/
│   │   └── [slug]/page.tsx  # 分类页
│   ├── tags/
│   │   ├── page.tsx         # 标签列表
│   │   └── [tag]/page.tsx   # 标签详情
│   ├── archives/page.tsx    # 归档页
│   ├── about/page.tsx       # 关于页
│   └── not-found.tsx        # 404 页
├── components/
│   ├── Header.tsx           # 导航栏
│   ├── Footer.tsx           # 页脚
│   ├── Hero.tsx             # 首页 Hero
│   ├── PostCard.tsx         # 文章卡片
│   └── CategoryCard.tsx     # 分类卡片
├── lib/
│   ├── posts.ts             # 文章处理
│   └── categories.ts        # 分类配置
├── content/blog/            # 8 篇文章（Markdown）
├── public/covers/           # 文章封面 SVG
└── package.json
```

## 定制

### 改站点标题、菜单

编辑 `components/Header.tsx` 中的 `navItems` 数组。

### 改主题色

编辑 `tailwind.config.js` 中的 `colors.primary` 和 `colors.accent`。

### 加动效

使用 Framer Motion，在组件中导入 `motion` 并添加动画属性。

### 加新分类

1. 在 `lib/categories.ts` 的 `categoryMeta` 中加配置
2. 写文章时在 `categories` 数组里加 slug
3. `app/categories/[slug]/page.tsx` 自动生成对应页面

## 致谢

- [Monkeycode](https://monkeycode-ai.com) — 本博客由 Monkeycode AI 智能开发平台驱动开发，提供代码生成、架构设计、部署编排等能力支持。

## 许可

博客内容遵循 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) 协议。

代码遵循 MIT 协议。
