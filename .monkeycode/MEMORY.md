# 用户指令记忆

本文件记录了用户的指令、偏好和教导，用于在未来的交互中提供参考。

## 格式

### 用户指令条目
用户指令条目应遵循以下格式：

[用户指令摘要]
- Date: [YYYY-MM-DD]
- Context: [提及的场景或时间]
- Instructions:
  - [用户教导或指示的内容，逐行描述]

### 项目知识条目
Agent 在任务执行过程中发现的条目应遵循以下格式：

[项目知识摘要]
- Date: [YYYY-MM-DD]
- Context: Agent 在执行 [具体任务描述] 时发现
- Category: [运维部署|构建方法|测试方法|排错调试|工作流协作|环境配置]
- Instructions:
  - [具体的知识点，逐行描述]

## 去重策略
- 添加新条目前，检查是否存在相似或相同的指令
- 若发现重复，跳过新条目或与已有条目合并
- 合并时，更新上下文或日期信息
- 这有助于避免冗余条目，保持记忆文件整洁

## 条目

[Stack 主题 helper 兼容性修复]
- Date: 2026-06-28
- Context: Agent 在将 Hugo 博客从 PaperMod 切到 Stack v3 主题时发现
- Category: 排错调试
- Instructions:
  - Stack v3 的 layouts/_partials/helper/image.html 在 site 资源上下文（head.html 传 favicon）下调用 .Resources.Get 会报 "nil is not a command"，需覆盖该 partial 用 reflect.IsSlice 判断 Resources 是否可调用
  - 同样原因，layouts/_partials/head/head.html 的 favicon 部分必须用覆盖版直接输出 <link rel="shortcut icon" href="/favicon.svg">，不调用 helper
  - Hugo 0.160.0 不允许 `$resource := nil` 初始化，必须用 `$resource := false`

[Stack 主题 custom.scss 加载方式]
- Date: 2026-06-28
- Context: Agent 在为 Stack 主题添加 AI 风格自定义样式时发现
- Category: 构建方法
- Instructions:
  - Hugo Stack 主题的 custom.scss hook 路径是 assets/scss/custom.scss（不是 PaperMod 的 assets/css/extended/custom.css）
  - 修改后 Hugo 0.160 需清 .hugo_build.lock 后重新构建才能看到效果

[Vercel Hugo 部署配置]
- Date: 2026-06-28
- Context: Agent 在准备 Vercel 部署时发现
- Category: 运维部署
- Instructions:
  - Vercel 默认构建镜像无 hugo，必须在 build.sh 中下载 hugo extended 二进制到 .hugo_bin/ 并加到 PATH
  - 当前版本 hugo extended 0.160.0
  - vercel.json 的 buildCommand 设为 "chmod +x ./build.sh && ./build.sh"，outputDirectory 设为 public
  - .hugo_bin/ 必须加入 .gitignore

[Hugo 0.160 dateFormat 配置]
- Date: 2026-06-28
- Context: Agent 修复 Stack 主题 dateFormat 配置时发现
- Category: 构建方法
- Instructions:
  - Hugo 0.160+ 要求 dateFormat 是嵌套表结构 { published = "...", lastUpdated = "..." }，不是简单字符串
  - 错误信息: "invalid character '\"' looking for beginning of value" 多数情况是 dateFormat 格式问题

[Stack 主题 page slug 路径陷阱]
- Date: 2026-06-28
- Context: Agent 验证页面路由时发现
- Category: 排错调试
- Instructions:
  - Stack 主题的 page bundle (content/page/search/index.md 等) 不要加 slug: "search"，否则 URL 变成 /page/search/，正确路径是 /search/
  - 同样适用于 archives、about 等 page 类型内容

[Astro 项目重写时删除 Hugo]
- Date: 2026-06-28
- Context: 用户决定从 Hugo 切到 Astro 时
- Category: 工作流协作
- Instructions:
  - 删 Hugo 文件用 `git rm -rf`；public/ resources/ 已被 .gitignore 忽略，但 `.hugo_bin/`、themes/、content/、layouts/、data/、archetypes/、config.toml、build.sh、vercel.json、.gitmodules 都在 git 里
  - 删除后必须 `git rm .gitmodules` 解除 submodule
  - Astro 静态项目最终结构：src/、public/、astro.config.ts、package.json、tsconfig.json、vercel.json

[astro-pure 主题与 Astro 5 集成]
- Date: 2026-06-28
- Context: Agent 在用 npm create astro template 装 cworld1/astro-theme-pure 时发现
- Category: 构建方法
- Instructions:
  - 包名是 `astro-pure`（不是 astro-theme-pure），template 命令是 `npm create astro@latest -- --template cworld1/astro-theme-pure`
  - template 自带 Waline/Katex/Shiki 等可选功能，禁用了仍会被 rollup 分析；最简方法是覆盖 `src/components/waline/Comment.astro` 为空内容
  - katex import 在 BlogPost.astro 必须删除（不装 katex 依赖）
  - 模板的 `src/content/blog/` 自带示例文章，必须先清空再放自己的文章
  - 子模块路径：`astro-pure/user`、`astro-pure/advanced`、`astro-pure/components/pages`、`astro-pure/server`、`astro-pure/utils`、`astro-pure/types`（注意 user 没有 /components/ 前缀）
  - Astro 5 字体系统是 experimental：`experimental: { fonts: [...] }`，顶层 `fonts:` 是 Astro 6

[Astro content collection 中 image() schema 的陷阱]
- Date: 2026-06-28
- Context: Agent 为 8 篇文章配 heroImage 时发现
- Category: 排错调试
- Instructions:
  - `image()` schema 只能处理 `src/` 下的图片资源，对 `public/` 下文件报错 "ImageNotFound"
  - 路径用 `/covers/xxx.svg`（public 路径）+ `z.string()` schema，不要用 `image()`
  - 渲染时用 `<img src={...} />` 普通标签，不用 `<Image />` 组件
  - 即使设了 `inferSize: true`，public 路径下 `Image` 组件仍报 MissingImageDimension

[Astro pagefind 中文搜索]
- Date: 2026-06-28
- Context: Agent 启用 astro-pure 自带搜索时发现
- Category: 排错调试
- Instructions:
  - astro-pure 集成默认开启 pagefind，build 时自动索引；中文 (zh-cn) 无词干化支持但搜索仍工作
  - 警告 `Did not find a data-pagefind-body element` 不影响功能，只是索引范围更大

