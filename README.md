# AI 探索者 (AI Hub)

一个聚焦人工智能领域的中文博客，基于 [Hugo](https://gohugo.io/) + [PaperMod](https://github.com/adityatelange/hugo-PaperMod) 主题（深度定制），部署在 [Vercel](https://vercel.com/)。

## 栏目

| 栏目 | 简介 |
|------|------|
| AI 教程 | LLM / RAG / Agent 实战入门到进阶 |
| 市场分析 | 大模型厂商竞争格局、价格趋势 |
| 高校专业 | 国内 AI 强校课程与就业去向 |
| 赛事活动 | Kaggle、NeurIPS 等顶赛清单 |
| 黑客松 | 高质量 AI 黑客松实时推荐 |
| 云厂商优惠 | 主流云厂商大模型 API 优惠汇总 |
| T-agent | 我正在做的多智能体协作框架 |

## 本地开发

需要 Hugo `extended` 版本 ≥ 0.112（推荐 0.160+）。

```bash
# 克隆并初始化子模块
git clone <your-repo-url>
cd ai-hub
git submodule update --init --recursive

# 启动开发服务器（带热更新）
hugo server -D --port 1313

# 构建生产版本到 public/
hugo --gc --minify
```

打开 http://localhost:1313 即可预览。

## 部署到 Vercel

Vercel 默认镜像**不预装 Hugo**，`build.sh` 会下载 Hugo extended 二进制到 `.hugo_bin/` 并执行构建。

1. 将仓库推送到 GitHub
2. 在 Vercel 控制台 `Add New Project` 导入该仓库
3. Framework Preset 保持默认（Other）即可
4. Vercel 会执行 `vercel.json` 中的 `buildCommand`（即 `build.sh`）
5. 部署完成后会得到一个 `xxx.vercel.app` 域名

> 如需固定 Hugo 版本，修改 `build.sh` 中的 `HUGO_VERSION`。

## 写新文章

```bash
hugo new posts/my-new-post.md
```

在前置元数据里指定分类与封面：

```yaml
---
title: "文章标题"
date: 2026-07-01T10:00:00+08:00
draft: false
categories: ["tutorials"]
tags: ["LLM", "RAG"]
cover:
  image: "covers/my-cover.svg"
  alt: "封面描述"
  hidden: false
---
```

## 项目结构

```
.
├── config.toml            # Hugo 主配置
├── vercel.json            # Vercel 部署配置
├── archetypes/default.md  # 默认文章模板
├── content/               # 文章源文件
│   ├── posts/             # 博文
│   ├── about.md           # 关于页
│   └── categories/        # 分类定义（自动生成）
├── layouts/               # 自定义模板
│   ├── _default/home.html # 自定义首页
│   └── partials/header.html
├── assets/css/extended/   # 自定义 CSS
├── static/                # 静态资源
│   ├── covers/            # 文章封面 SVG
│   └── favicon.svg
└── themes/PaperMod/       # 主题（git submodule）
```

## 定制

主题样式在 `assets/css/extended/custom.css`，所有 AI 风格相关的变量（颜色、渐变、玻璃拟态等）都集中在此文件。

需要新栏目时：

1. 在 `config.toml` 的 `[[menu.main]]` 中加一项
2. 在文章 frontmatter `categories` 中使用该名称
3. 在首页 `layouts/_default/home.html` 添加对应卡片

## 许可

MIT
