# AI 探索者

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

- **Astro 5** - 现代静态站点生成器，原生支持 Content Collections
- **[astro-pure](https://github.com/cworld1/astro-theme-pure)** - Astro 生态最火的博客主题，UnoCSS + 动效拉满
- **TypeScript** - 全量类型约束
- **Vercel** - 自动部署 main 分支到全球边缘网络

## 本地开发

需要 Node.js ≥ 18。

```bash
# 安装依赖
npm install

# 启动开发服务器（默认端口 4321，带热更新）
npm run dev

# 构建生产版本到 dist/
npm run build

# 预览生产构建
npm run preview
```

打开 http://localhost:4321 即可预览。

## 写新文章

在 `src/content/blog/` 下新建 `.md` 文件：

```markdown
---
title: "文章标题"
publishDate: 2026-07-01T10:00:00+08:00
description: "一句话描述，搜索引擎和卡片显示用"
categories: ["tutorials"]
tags: ["LLM", "RAG"]
heroImage:
  src: /covers/my-cover.svg   # public 目录下的资源
  alt: "封面描述"
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
3. Framework Preset 自动识别为 Astro
4. 部署完成后得到 `aoyinai.vercel.app` 域名

`vercel.json` 已配置：`buildCommand = npm run build`、`outputDirectory = dist`。

## 项目结构

```
.
├── src/
│   ├── assets/              # 图片等构建期资源
│   ├── components/
│   │   ├── custom/          # 自定义覆盖（Hero, PostPreview）
│   │   └── waline/          # 评论组件（已禁用）
│   ├── content/
│   │   └── blog/            # 8 篇文章（Markdown）
│   ├── layouts/             # 基础布局
│   ├── pages/
│   │   ├── blog/            # 博客列表 + 详情路由
│   │   ├── categories/      # 7 个分类页
│   │   ├── about/           # 关于
│   │   ├── archives/        # 时间线归档
│   │   ├── search/          # 搜索（pagefind）
│   │   └── tags/            # 标签页
│   ├── site.config.ts       # 站点主配置（标题、菜单、社交）
│   └── content.config.ts    # 文章 frontmatter schema
├── public/
│   ├── covers/              # 文章封面 SVG（8 张）
│   ├── images/              # 头像等
│   ├── favicon/             # 多尺寸 favicon
│   └── custom.css           # AI 风格定制样式
├── astro.config.ts          # Astro 配置
├── vercel.json              # Vercel 部署配置
├── package.json
└── tsconfig.json
```

## 定制

### 改站点标题、菜单、社交链接

编辑 `src/site.config.ts`：

- `title` / `description` / `logo`：基础元信息
- `header.menu`：顶部导航（已配齐 7 个分类 + 关于）
- `footer.social`：底部社交链接
- `content.blogPageSize`：博客每页文章数

### 改主题色 / 加动效

编辑 `public/custom.css`，已包含：

- AI 渐变文字（`#6366f1` → `#06b6d4` → `#a855f7`）
- 卡片悬浮上浮 + 阴影动效
- 链接 / 按钮 / 滚动条动效
- `h1-h6` 标题背景渐变循环动画

直接在 CSS 顶部修改 `--ai-primary` / `--ai-secondary` / `--ai-accent` 三个变量即可。

### 加新分类

1. 在 `src/site.config.ts` 的 `header.menu` 加菜单项
2. 写文章时在 `categories` 数组里加 slug
3. `src/pages/categories/[category].astro` 自动生成对应页面

### 加新文章封面

SVG 推荐尺寸 1200×630（与 og:image 一致），放到 `public/covers/`，文件名与 frontmatter 中 `heroImage.src` 一致。

## 许可

博客内容遵循 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) 协议。

代码遵循 MIT 协议。
