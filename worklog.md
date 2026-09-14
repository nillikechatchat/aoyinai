# 项目交接文档 — 敖胤AI 国风重构

## 项目背景
- 原站：https://github.com/nillikechatchat/aoyinai —— 聚焦 AI 的中文博客，7 大栏目（AI教程/市场分析/高校专业/赛事活动/黑客松/云厂商优惠/T-agent）
- 本次任务：重构该网站，栏目保持基本不变，主要重构首页
- 设计基准：用户提供的水墨国风截图（宣纸底、朱砂红印章、墨绿按钮、楷体大标题、中央发光法器、随机推荐文章区、今日一读侧栏、山水 footer）

## 技术方案
- Next.js 16 App Router + TypeScript + Tailwind 4 + shadcn/ui + Prisma(SQLite) + framer-motion
- 单路由 `/`（沙盒限制），首页/文章/关于通过客户端视图状态切换
- AI 能力：z-ai-web-dev-sdk（仅后端）—— 点击司南生成「AI 签文」（卦名/卦辞/解曰/建议）

---
Task ID: 1
Agent: main
Task: 初始化 worklog 与任务规划

Work Log:
- 探索项目结构：干净脚手架，仅示例 User/Post 模型
- 抓取原仓库 README，确认 7 大栏目与功能
- 制定重构方案与 todo 清单

Stage Summary:
- 方案确定：国风视觉 + AI 博客内容 + LLM 问签交互

---
Task ID: 2-a
Agent: main
Task: 生成国风图片素材

Work Log:
- 生成 hero-bg.png（水墨山水全景，1440x768→1344x768）——松枝左上、竹叶右侧、红日、孤舟，与参考图高度一致
- 生成 artifact-sinan.png（青铜司南法器）作为首页交互核心
- 生成 7 张栏目封面：cover-tutorials/market/majors/events/hackathons/cloud/tagent.png（1344x768，水墨+微科技元素）

Stage Summary:
- 共 9 张图，全部位于 public/images/；注意 API 限流（429）需串行+sleep；尺寸须为 32 的整数倍

---
Task ID: 2-b
Agent: main
Task: 数据模型与后端 API

Work Log:
- prisma/schema.prisma：Article（14 篇种子文章）、Category（7 栏目+印章字）、InsightRecord（问签记录）三模型
- scripts/seed.ts 灌入数据（bun run scripts/seed.ts）
- API：GET /api/articles（category/search/random/exclude/limit）、GET /api/articles/[slug]（浏览量+1）、GET /api/categories（含计数）、POST /api/insight（LLM 生成签文，含 4 条本地兜底签池）

Stage Summary:
- 全部接口 200；LLM 签文生成 ~1.5s，质量高（如「云枢卦」「明镜卦」）；LLM 失败时自动降级本地签池

---
Task ID: 2-c
Agent: main
Task: 前端国风重构

Work Log:
- globals.css：国风设计系统（@theme 色板 paper/ink/vermillion/pine/gilt、宣纸噪点背景、.seal-stamp 印章、.paper-frame 双线框、.text-vertical 竖排、prose-guofeng 排版、自定义滚动条）
- layout.tsx：中文 metadata、lang=zh-CN、min-h-screen flex-col（粘性页脚）
- 组件（src/components/site/）：site-header（栏目下拉+移动抽屉）、hero（司南问签）、insight-dialog（签文弹窗：旋转加载/卦辞/解曰/宜/抄录/定向叩问）、article-card、article-dialog（markdown 详情）、recommend-section、today-read-card、categories-section（壹贰叁…水印）、articles-view（搜索+筛选+空状态）、about-view、site-footer
- page.tsx：视图状态切换（home/articles/about）+ 数据加载 + 弹窗编排

Stage Summary:
- 首页结构完全对齐参考截图：头部导航/水墨 Hero+发光法器/随机推荐 3 卡/今日一读侧栏（换一篇）/七大栏目区/山水页脚

---
Task ID: 3
Agent: main
Task: agent-browser 端到端自测与修复

Work Log:
- 测试通过：司南问签全流程（点击→旋转→云枢卦/明镜卦）、定向叩问（"今年该不该 All in AI"得到贴题建议）、文章详情 markdown、文章搜索/筛选/空状态、栏目下拉、关于页、移动端 390px 响应式、粘性页脚
- 修复 1：司南图片灰底框问题。根因：mix-blend-multiply 在部分合成层不生效 + Next.js 图片优化器会剥离 alpha（输出 3 通道 PNG）+ dev 服务器内存图片缓存不因文件变化而失效
  - 方案：scripts/process-artifact.ts 用 sharp 做白底转透明 alpha（低饱和白→alpha 渐变）、裁剪底部截断手柄、480x450+palette 压缩至 105KB，组件加 unoptimized 绕过优化器
  - 教训：改 public 下图片后需重启 dev 服务器清内存缓存
- 修复 2：竖排文字加 textShadow 提升山水背景上的可读性
- bun run lint 通过；dev.log 无运行时错误

Stage Summary:
- 网站已可用且稳定；所有核心交互经浏览器实测通过

## 当前状态评估
- 项目稳定可用：首页完整还原参考设计的国风美学，AI 问签为核心亮点交互
- dev 服务器运行中（port 3000），lint 干净，无 console 错误

## 下一阶段建议（优先级从高到低）
1. 文章字数/阅读时长自动估算入库；文章页加入目录（TOC）锚点
2. 司南问签历史（InsightRecord 已入库，可加「我的签筒」页签展示最近问签）
3. 阅读进度条、文章字数统计展示、点赞/收藏
4. RSS 订阅路由（原站功能对齐）、sitemap
5. 明暗双主题（保留国风韵味的「夜读」模式：墨蓝纸色）
6. 更多种子文章（每栏目至少 4 篇）与分页

---
Task ID: R1（定时审查第 1 轮）
Agent: main
Task: QA 回归 + 新功能批量开发（签筒/进度条/点赞/RSS/内容扩充/动效细节）

Work Log:
- QA 回归发现 2 处 Radix a11y 警告（弹窗 loading 态缺 DialogTitle）→ 已修复（sr-only 标题常驻）
- 数据层：Article 新增 likes 列；种子文章 14→21 篇（每栏目 3 篇），含随机 views/likes；InsightRecord 表被 seed 清空属预期
- 新 API：POST /api/articles/[slug]/like、GET /api/insight（签筒历史）、GET /rss.xml（RSS 2.0，对齐原站功能）
- 新组件 QiantongView「我的签筒」：签卡墙（卦名+末字印章+卦辞引文框+所问+日期+敖胤 赐）、空态引导、fadeUp 逐卡入场；导航新增「签筒」项（桌面+移动抽屉）
- ArticleDialog 重构：外层 ArticleDialog（sr-only 标题）+ 内层 ArticleBody（key=slug 重挂载隔离状态，规避 react-hooks/set-state-in-effect lint 错误）；新增阅读进度条（flex 顶部固定行，朱红→鎏金渐变）、字数统计、目录 TOC（h2 提取→chips→scrollIntoView）、点赞「心许」印章按钮（localStorage 防重复 + API 计数）
- InsightDialog：新增「翻看签筒」入口；签筒数据联动刷新（insightCount → refreshKey）
- 修复重要隐藏 bug：从头部「今日一读」/签筒/关于页打开弹窗只开窗不起卦（首版遗留）→ openInsightDialog 统一为「打开即自动起卦」，Hero 不再自行调用 onAsk
- 动效细节：推荐卡片 framer-motion 错开入场（stagger 0.09s）、栏目卡片 whileInView 逐卡升起 + whileHover 微浮、文章封面 hover 出现「展卷阅读」朱红胶囊
- 页脚新增 RSS 订阅链接

验证结果（agent-browser 实测）:
- 签筒视图：4 条记录正确展示、最新签（云途卦）经 refreshKey 自动刷入、空态逻辑经 seed 清库后实测
- 点赞链路：UI 点击 → POST → DB 57→58 → 详情接口返回 likes
- 目录跳转：点「第三层：守其心」精确滚动；进度条随滚动更新（实测 21%→100% 区间响应）
- RSS：/rss.xml 输出标准 2.0 XML（21 条中最新 20 条）
- 移动端 390px：抽屉含签筒入口、栏目计数 3篇/栏
- lint 通过；src/ 目录 tsc 无错误（examples/skills 为脚手架历史遗留，与本项目无关）

Stage Summary:
- 本轮交付 4 个新功能 + 2 个 bug 修复 + 3 处动效细节；内容量 14→21 篇
- 关键教训：dev 服务器内存缓存旧 Prisma Client（新列不返回），改 schema 后需重启 dev；同视图内跳转不触发重挂载，需 refreshKey 联动

## 当前状态评估
- 稳定可用，功能集：司南问签（自动+定向+历史签筒）、文章（列表/搜索/筛选/详情/进度条/TOC/点赞）、栏目、关于、RSS
- dev 运行中，lint 干净

## 下一阶段建议（优先级从高到低）
1. 夜读模式（墨蓝纸色暗色主题，next-themes 已装；需为全部自定义色板变量补 .dark 值）
2. 签筒分享：签卡生成水墨风分享图（canvas 绘制 + 下载）
3. 文章评论（本地假数据或匿名留言板）
4. 首页 Hero 加云纹/飞鸟 SVG 动画细节；今日一读卡片加古卷装饰
5. 分页或无限滚动（文章 21+ 后）
6. InsightRecord 数据治理：签筒只展示本人（localStorage session id 过滤）
