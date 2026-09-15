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

---
Task ID: R2（定时审查第 2 轮）
Agent: main
Task: QA 回归 + 三大新功能（夜读模式 / 签筒分享卡 / 文章笔谈）+ Hero 动效细节

Work Log:
- QA 回归（agent-browser）：首页/问签/文章详情/签筒/关于全流程无回归，无 console 错误，无阻塞性 bug
- 新功能 1「夜读模式」：
  - globals.css 重写 .dark 为墨蓝夜纸色板（paper #161c25 / 月白字 / 暖朱砂 / 鎏金），shadcn 变量全部映射国风 token
  - 新增 --vtext-shadow 变量（日：纸色晕 / 夜：墨晕）+ .vtext-glow 工具类，hero 竖排文字与主标题改用
  - hero-art 暗色滤镜（brightness/saturate）+ hero-tint 夜色渐变叠加层；paper-frame/hover-lift/glow-ring 暗色专属阴影
  - theme-provider.tsx（next-themes，attribute=class，默认 light）；theme-toggle.tsx（useSyncExternalStore 水合安全挂载标记 + theme-switching 平滑过渡类）
  - 桌面头部右侧 + 移动抽屉底部（与今日一读并排）均有切换按钮；刷新后主题持久（实测 dark 保持）
  - 夜读实测截图：r2-dark-home2 / r2-dark-insight（明镜卦墨蓝签纸）/ r2-dark-article
- 新功能 2「签筒分享卡」：
  - lib/share-card.ts：750x1050 canvas——洒金宣纸底（90 金点随机）、朱砂双线框+四角方印、楷体卦名+末字印章、卦辞引文框、解曰自动换行（上限 6 行）、宜字松绿条、所问、日期、品牌落款；toBlob 下载
  - 入口 1：InsightDialog「拓印」鎏金按钮（stamping 加载态 + toast）；入口 2：签筒每张签卡右下角拓印 icon 按钮（逐卡 loading）
  - 实测 agent-browser download 捕获产物 download/qianka-share.png，构图与配色达预期
- 新功能 3「文章笔谈（匿名留言板）」：
  - Prisma 新增 Comment 模型（articleSlug/author/body/createdAt + 索引），db:push 推送
  - API：GET/POST /api/articles/[slug]/comments——空文/500 字限/12 字落款校验、60 秒同文同作者同内容防重（429「此言方才已录，无须重笔」）
  - article-comments.tsx：笔谈列表（作者首字印章 + 落款 + 日期 + 正文，fadeUp 错开入场，max-h-64 滚动）、空态「笔谈尚无留痕」、落笔表单（落款记忆 localStorage / 500 字计数 / toast 确认 / 插入列表顶部）
  - ArticleBody 正文后接入；seed.ts 新增 5 条种子留言（观澜/青崖/苏合/无名氏/临江仙），种子文章 slug 已核对
  - 实测：API GET/POST/防重 3 项通过；UI 落笔→计数 3→4→5、松间照留言即时置顶、toast 显示
- 样式细节：Hero 新增两组云纹 SVG（cloudDrift 往返漂移）+ 两阵飞鸟 SVG（birdsFly 掠过 + birdFlap 振翅，错拍），currentColor 适配双主题；签筒卡片无所问时以「解曰」摘要一行补位（修复留白不均）
- 修复 lint：theme-toggle 的 setState-in-effect 改为 useSyncExternalStore；bun run lint 通过
- 运维教训补充：dev 服务器若被杀，用 `(setsid bun run dev >/dev/null 2>&1 &)` 可跨工具调用存活（nohup 会被沙盒会话回收）；新增 CSS 规则若浏览器未生效，往 globals.css 追加任意内容触发重编译即可；新 Prisma 模型需重启 dev（已重启）

验证结果（agent-browser 实测）:
- 夜读/日间切换、持久化、全部视图暗色适配 ✓
- 拓印下载产物构图完整 ✓
- 笔谈 GET/POST/防重 + UI 落笔全链路 ✓
- 云纹漂移/飞鸟掠过动画计算样式生效 ✓
- 移动端 390px：抽屉含夜读切换、Hero 飞鸟可见 ✓
- lint 通过；/、/rss.xml、/api/insight 均 200；dev.log 无运行时错误

Stage Summary:
- 本轮交付 3 个新功能（夜读模式 / 签文分享卡 / 匿名笔谈）+ 2 处样式细节（云纹飞鸟动效、签筒卡片留白修复）+ 1 个 lint 修复
- 内容与数据：Comment 表 + 5 条种子留言；分享卡样例存于 download/qianka-share.png
- 截图存证：screenshots/r2-*.png（QA、夜读、分享卡、笔谈、移动端）

## 当前状态评估
- 功能集：司南问签（自动/定向/签筒/拓印分享）、文章（列表/搜索/筛选/详情/进度条/TOC/心许/笔谈）、栏目、关于、RSS、夜读模式
- 双主题全部视图适配完成；lint 干净；所有 API 稳定

## 下一阶段建议（优先级从高到低）
1. 首页「本周热门」区（按 views 排序取 3 篇，与随机推荐互补）
2. 签筒分享卡加入「扫码访问」二维码（前端生成 QR 至 canvas）
3. 文章页上一篇/下一篇导航（同栏目内跳转）
4. 分页或无限滚动（文章 21 篇，全部视图一次加载尚可，30+ 后需分页）
5. InsightRecord/Comment 数据治理：session id 过滤「我的签筒」、评论敏感词过滤
6. 管理侧：浏览/点赞/评论数据小看板（/api/stats）
---
Task ID: R3（定时审查第 3 轮）
Agent: main
Task: QA 回归 + 五项新功能（本周热门 / 上下篇导航 / TOA scroll-spy / 签筒 session 隔离 / 分享卡二维码）+ 样式细节

Work Log:
- QA 回归（agent-browser）：首页/问签/文章详情/签筒/拓印/夜读/移动端全流程无阻塞 bug；发现 2 处 Radix Dialog `aria-describedby` 警告 → 已修复（DialogContent 加 aria-describedby={undefined}，重测警告清零）
- 新功能 1「本周热门」：
  - /api/articles 新增 sort=top（views desc + likes desc 次序）
  - 新组件 weekly-hot.tsx：壹/贰/叁榜次（榜首朱红印章、贰叁鎏金描边）、榜首/榜眼/探花标签、大字水印、缩略图+标题+日期+时长、底部 views/likes 数据条、framer-motion whileInView 错开入场；首页置于推荐区与栏目区之间；双主题适配实测
- 新功能 2「文章上下篇导航」：
  - page.tsx 惰性拉取 /api/articles?limit=100 缓存于 allArticles，按同栏目计算前后篇（环形），经 props 传入 ArticleDialog
  - ArticleBody 正文后新增 前一篇/后一篇 双卡导航（ChevronLeft/Right hover 位移 + 朱红高亮），点击 onNavigate 切换文章（key=slug 重挂载自动重置进度/点赞/TOC）
- 新功能 3「目录 scroll-spy」：
  - ArticleBody handleScroll 内根据 scrollTop+140 找最近 data-h2 小节，滚到底强制末节；aria-current=true 的 chip 朱红底高亮；折叠态在「目录（N）」旁显示当前小节名
- 新功能 4「签筒 session 隔离」：
  - Prisma InsightRecord 新增 sessionId 列（默认空 + [sessionId, createdAt] 索引），db:push + 重启 dev
  - lib/session.ts：localStorage aoyin_session_id（crypto.randomUUID 兜底时间戳）
  - POST /api/insight 存 sessionId；GET /api/insight?sessionId= 仅返回本人记录；page.tsx 问签与 qiantong-view 拉取均携带
  - 签筒头部新增「签筒随访客留存，仅你可见」说明；实测：新会话空筒 → 问签（明镜卦）→ 签筒显示 1→2 支，旧无主记录不再混入
- 新功能 5「分享卡二维码」：
  - 安装 qrcode + @types/qrcode；lib/share-card.ts 生成站点 origin 的墨色透明底 QR（errorCorrectionLevel M）
  - 卡片底部重排：QR（100px 衬底小卡+「扫码·再问一卦」）居左，日期+品牌居右、胤印贴右缘；两轮实测修正重叠与贴边问题
- 样式细节：
  - 回顶按钮：印章式固定悬浮（右下，rotate -4°，ChevronUp+「回顶」），AnimatePresence 弹入弹出，scrollY>600 出现
  - 封面差异化：lib/utils coverFilter(slug) 基于 slug 哈希做 -12~+12° 色相/饱和/亮度微调，ArticleCard 应用（同栏目封面不再视觉重复，实测 6/6 生效）
- 技术验证技巧沉淀：拓印产物捕获可先补丁 URL.revokeObjectURL 为空函数 + createObjectURL 记录，再将 blob 挂为 <img> 截图预览（绕开 download 事件与 blob 回收）

验证结果（agent-browser 实测）:
- 本周热门：views 排序正确（907/830/790）、双主题、入场动画 ✓
- 上下篇：AI 教程栏目内切换成功（学习路径 ↔ Agent 记忆系统 ↔ RAG 实录）✓
- TOA spy：滚动至中部「三、三条军规」chip 朱红高亮 ✓
- 签筒隔离：新 sessionId 空筒 → 问签 → 仅本人 2 支 ✓
- 分享卡：QR 渲染、扫码文案、落款区无重叠 ✓
- aria 警告 0；console 无错误；lint 通过；5 个核心路由 200；移动端 390px 正常
- 截图存证：screenshots/r3-*.png（热门榜明暗、TOA 高亮、卡片二维码、签筒隔离、移动端）

Stage Summary:
- 本轮交付 5 个新功能 + 1 个 a11y 修复 + 2 处样式细节；功能集：司南问签（自动/定向/签筒隔离/拓印+二维码）、文章（列表/搜索/筛选/详情/进度条/TOA spy/心许/笔谈/上下篇）、本周热门、栏目、关于、RSS、夜读模式、回顶
- 数据：InsightRecord.sessionId 已上线（旧无主记录保留但不再显示于个人签筒）

## 当前状态评估
- 项目功能已相当完整，双主题覆盖全部视图，lint 干净，无 console 错误
- 签筒为「私人数据」语义；分享卡具备传播闭环（二维码回流站点）

## 下一阶段建议（优先级从高到低）
1. 签筒分享卡海报模式：长按/右键保存替代下载（移动端体验），或 Web Share API 直接分享
2. 首页 Hero 加「今日签运」一行小卡（取当日最近一支签的卦名，引去签筒）
3. 文章列表分页/无限滚动（30+ 篇后必须）；ArticlesView 接入 sort=top 切换「最新/最热」排序
4. 评论治理：敏感词/频率限制升级、评论点赞或回复（Comment 加 parentId）
5. 管理看板 /api/stats（views/likes/comments/签数聚合）+ 关于页可视化
6. SEO：每篇文章 meta 动态生成（现单路由限制下可用 document.title 更新 + JSON-LD）

---
Task ID: R4（定时审查第 4 轮）
Agent: main
Task: QA 回归 + 四组新功能（列表排序与加载更多 / 笔谈复言 / 今日签运+墨迹统计 / SEO+Web Share）+ 样式细节

Work Log:
- QA 回归（agent-browser）：首页/问签/签筒/文章/弹窗/夜读/移动端全流程无阻塞 bug；发现 4 项改进点：document.title 不随文章变化、封面差异化过弱、列表无排序无分页、评论无回复
- 新功能 1「文章列表 最新/最热 + 加载更多」：
  - /api/articles 新增 offset 参数（skip 仅对非 random 生效）；ArticlesView 新增 签条式排序切换（最新 Sparkles/最热 Flame，vermillion 激活态，ml-auto 贴右侧）
  - 分页 PAGE_SIZE=9，「再展一卷（余 N 篇）」鎏金描边按钮 + ChevronDown hover 位移；尽览后显示「共 N 篇 · 尽览于此」横线落款；客户端 id 去重防竞态
  - ArticleCard 新增可选 index prop：fadeUp 错开入场（0.06s 步进，上限 0.42s）
- 新功能 2「笔谈复言（评论回复）」：
  - Prisma Comment 新增 parentId/replyToAuthor（可空列 + [parentId] 索引；注意 @default(null) 语法不被 SQLite 接受，可空列默认即为 null）；db:push + 重启 dev
  - API POST 校验 parentId：父留言须存在且同属此文（400「所复之言已不在纸上」）；replyToAuthor 冗余落库便于展示
  - article-comments 重写：buildThreads 两层会话树（复言一律归顶端祖先，孤儿复言自动升顶；顶端倒序/复言正序）；每条留言「复」按钮（MessageCircle）→ 表单顶部鎏金「复 X：」指示条（可取消）+ 提交按钮变「复言」；复言缩进 border-l 连接线 + 「↳ 复 X」金标 + compact 印章；计数改用 totalCount（含复言）；列表 max-h-64→max-h-80
  - seed.ts 留言 5→8 条：观澜/青崖/苏合/无名氏/临江仙 + 敖胤先生两条回复（alias/replyTo 映射机制，先父后子插入）
- 新功能 3「今日签运 + 墨迹统计」：
  - /api/insight GET 新增 since 参数；新组件 today-insight-card：首页 Hero 底部小卡（paper-frame + 四角鎏金饰角），当日已问→末字印章+卦名+卦辞+「翻看签筒」，未问→「今日未问·一念起可问一事」+「去问一卦」，问签后经 refreshKey 自动刷新；since 取访客本地零点 ISO
  - 新路由 /api/stats：aggregate+groupBy+count 并行聚合（articles/views/likes/comments/insights/topCategory/latestArticle）
  - AboutView 新增「墨迹统计」paper-frame 看板：5 枚数据瓦片（文/阅/许/谈/签 印章角标 + 千分位 tabular-nums + fadeUp 错开 + hover 变朱红）+ 注脚（最热栏目/最近刊行）；加载骨架屏
- 新功能 4「SEO + Web Share」：
  - ArticleBody useEffect 同步 document.title（「文章标题 · 敖胤AI」，合卷/换篇复位 BASE_TITLE）
  - layout.tsx 注入 JSON-LD（schema.org @graph：WebSite/Person/Blog）
  - share-card.ts 导出升级：StampResult（shared/downloaded/aborted），navigator.share+canShare files 优先（AbortError 静默），回退 a.download；InsightDialog toast 按结果分支（「签卡已递出」/「签卡已拓印」/取消不打扰）
- 样式细节：coverFilter 色相 ±12°→±24°、饱和 0.94~1.14、亮度 0.96~1.04（同栏目封面肉眼可辨）；实测 学习路径/RAG/价格战 三卡滤镜值各不相同

验证结果（agent-browser 实测）:
- 排序：最热激活后首位为 API 价格战（views 最高）；加载更多 9→18→21 后转「尽览于此」
- 复言：点「复」→鎏金指示条→提交→计数 3→4、松间照复言缩进挂于青崖下（↳ 复 青崖）+ toast「复言已录」
- 今日签运：未问态→问签（流云卦）→合卷后卡片自动变「流云卦+翻看签筒」
- 墨迹统计：21 文/11,466 阅读/1,021 心许/9 笔谈/1 问签（实时联动）
- SEO：开文章后 document.title=「T-agent 设计笔记（一）…· 敖胤AI」；JSON-LD WebSite,Person,Blog 在 DOM
- 拓印：blob 生成+下载触发（headless 无 navigator.share 走下载回退，符合设计）
- 双主题（新 UI 全部适配）、移动端 390px（排序签条/今日签运卡）✓
- lint 通过；/、/rss.xml、/api/categories、/api/stats、/api/insight 全 200；dev.log 无错误

Bug 修复（本轮过程中发现并当场解决）:
1. articles-view 重写后遗留 list 引用未替换 → 点击文章卡整页崩溃（ReferenceError: list is not defined）→ 改为 threads.length；教训：删除 useMemo 变量时须全文检索其所有引用
2. /api/articles sort=top 时 skip 被错误跳过 → 加载更多返回同一页被去重吃掉 → skip 仅对 random 跳过
3. Prisma 可空列 @default(null) 在 SQLite 报错 → 去掉默认值即可
4. seed 复言引用顺序：replyTo 指向的 alias 必须先于回复插入（数组顺序修正）

Stage Summary:
- 本轮交付 4 组新功能 + 2 处样式细节 + 4 个过程中 bug 修复；内容量 21 篇不变，留言 5→8
- 功能集新增：列表排序/加载更多、笔谈复言（两层会话树）、今日签运卡、墨迹统计看板、动态标题、JSON-LD、系统分享
- 截图存证：screenshots/r4-*.png（QA 回归、新功能明暗/移动端全记录）

## 当前状态评估
- 功能集：司南问签（自动/定向/签筒隔离/拓印+二维码+系统分享）、文章（列表排序/加载更多/搜索/筛选/详情/进度条/TOA spy/心许/笔谈复言/上下篇）、今日签运、本周热门、墨迹统计、栏目、关于、RSS、夜读模式、回顶、SEO 基础
- lint 干净，全部路由 200，双主题覆盖所有新 UI

## 下一阶段建议（优先级从高到低）
1. 文章敏感词过滤 + 复言楼层号（#1 #2）与「只看楼主」式筛选
2. 墨迹统计进阶：7 日问签/留言趋势迷你折线（sparkline，纯 SVG）
3. 首页栏目区 hover 预览该栏目最新一篇（浮层）
4. 文章「荐而后读」：将文章生成水墨荐书签（复用 share-card 思路）
5. 列表虚拟化或游标分页（50+ 篇后）
6. OpenGraph 图片动态生成（/api/og 用 ImageResponse 生成文章题图）

---
Task ID: R5（定时审查第 5 轮）
Agent: main
Task: QA 回归 + 五项新功能（笔谈楼层号/只看先生/敏感词、墨迹七日折线、栏目卡 hover 预览、荐书签、读毕印记）+ group-hover 失效根因排查

Work Log:
- QA 回归（agent-browser）：首页/签筒/文章/复言/夜读/移动端全流程正常，无阻塞 bug；确认 R4 全部功能存活
- 新功能 1「笔谈楼层号 + 只看先生 + 敏感词」：
  - 楼层号：客户端按 createdAt 正序编楼（id→#n Map），留言行 meta 区显示 #n（tabular-nums）；新留言追加为最大楼层
  - 「只看先生」鎏金筛选 chip（Feather 图标，aria-pressed）：仅保留含敖胤先生留言的会话（上下文完整）；空态文案「先生尚未于此留言/他日机缘至时，自有批注」
  - 敏感词：comments POST 端 20 词表，命中以「※」掩去；≥3 处命中 422「笔谈清雅之地，还望另择言辞」（实测 1 处掩码成功、3 处婉拒）
  - CommentRow 增强：站主留言鎏金描边 + 「站主」金徽 + 落款鎏金色
- 新功能 2「墨迹七日」：
  - /api/stats 新增 daily（近 7 天问签/笔谈逐日计数，服务器日期聚合）
  - AboutView 新增 InkSparkline 纯 SVG 双折线（问签 vermillion 实线 / 笔谈 gilt），数据点+数值标注+日期轴+图例；颜色走 var(--color-vermillion/--color-gilt) 自动适配夜读
- 新功能 3「栏目卡 hover 预览」：
  - /api/categories 每栏目附带 latest（slug/title/excerpt/publishedAt）；Category 类型扩展
  - 卡片 hover 时简介淡出、浮层（鎏金框+毛玻璃）显示「最新 · 日期 + 标题 + 摘要」；纯 CSS 语义类（见下）
- 新功能 4「荐书签」：
  - share-card.ts 新增 downloadArticleCard：750x1050 水墨荐书卡（栏目大印 + 「据（栏目）一卷」+ 大楷题名 ≤3 行 + 鎏金短线 + 摘要引文框 ≤5 行 + 阅读时长 ◈ 行 + QR「扫码·展卷共读」+ 刊于日期 + 落款胤印）；Web Share 优先/下载回退，返回 StampResult
  - ArticleBody 标签行新增「荐」Gift 鎏金按钮（绘签中 loading + toast 分支：「荐书已递出/荐书签已备/荐书未成」）
- 新功能 5「读毕印记」：
  - lib/read-history.ts：localStorage 读书记忆 + 模块级订阅（监听器广播）；markRead 落盘+广播
  - ArticleCard 用 useSyncExternalStore(subscribeReads, isRead, ()=>false)（服务端快照 false 防水合不一致）；已读文章封面右上角斜盖「读毕」outline 印；ArticleBody 展卷即 markRead
- 重大发现与修复「group-hover 全站失效根因」：
  - 现象：栏目卡 hover 预览、卡片标题变色等 group-hover 全部不生效，但 framer whileHover 正常
  - 排查：CSSOM 递归遍历确认规则存在且同层（utilities）；:hover 激活、matches(':where(.group):hover *')=true，但样式不应用；注入探针对照——朴素 `.group:hover h3` 生效（rgb(254,0,0)），`.group:is(:where(.group):hover *) h3` 不匹配
  - 结论：沙盒 headless Chromium 对 Tailwind 4 的 :is(:where(.group):hover *) 求值异常（matches 通过但样式表匹配失败）
  - 修复：globals.css 追加朴素 :hover 语义类兜底（cat-card/cat-preview/cat-desc/cat-title/cat-seal/cat-watermark/cat-arrow、cover-reveal(-inner)、card-title/card-arrow），关键交互组件改挂语义类；真实浏览器中 group-hover 与兜底同效果无冲突
  - 附带发现并修复：入场 stagger 动画未完成时鼠标压卡（whileHover 对象态）会使卡片冻结于 opacity 0 → whileHover 改为命名变体 "hover"（含 opacity:1 强制可见）
- lint 过程修复：ArticleCard 初版 useEffect+setState 触发 react-hooks/set-state-in-effect → 改 useSyncExternalStore 订阅模式（读书记忆模块化、响应式）

验证结果（agent-browser 实测）:
- 楼层号：#1~#4 按时序正确显示（顶端+复言）
- 只看先生：过滤后仅剩观澜+敖胤先生会话，青崖会话隐藏；关闭恢复
- 敏感词：1 处→※※ 掩码入库；3 处→422 婉拒（测试数据已清理）
- 荐书签：blob 生成 + 下载触发 + toast「荐书签已备」
- 读毕印记：读文后返回列表，T-agent（一）卡右上角「读毕」斜印出现
- 栏目预览：hover 市场分析卡 → 简介淡出、浮层显「最新·9月9日 API 价格战」；入场中 hover 全卡可见（opacity 1,1,1,1,1,1,1）
- 墨迹七日：双折线渲染、数值 1,1,2,3,2（笔谈）/1（问签 9/14）、日期轴 9/8-9/14
- 双主题（统计看板/栏目区/热门区）、移动端 390px 栏目单列 ✓
- lint 通过；/、/rss.xml、/api/stats、/api/categories 全 200；dev.log 无错误
- 截图存证：screenshots/r5-*.png（楼层号、只看先生、荐书签、读毕印、栏目预览、七日折线、夜读、移动端）

Stage Summary:
- 本轮交付 5 项新功能 + 2 个环境级 bug 根因修复（group-hover 失效、入场悬停冻结）+ 1 个 lint 规范修复
- 关键教训沉淀：① 沙盒 headless Chromium 下 Tailwind 4 group-hover 变体（:is+:where 嵌套）不生效，关键 hover 显隐一律用朴素 :hover 语义类；② framer whileHover 用对象态会在 stagger 中冻结元素，命名变体须带 opacity 兜底；③ React 19 lint 禁止 effect 内同步 setState，localStorage 类状态用 useSyncExternalStore + 模块订阅

## 当前状态评估
- 功能集全量可用：司南问签（自动/定向/签筒/拓印+QR+系统分享）、文章（排序/加载更多/搜索/筛选/详情/进度/TOA/心许/荐书签/读毕印/笔谈复言+楼层+只看先生/上下篇）、今日签运、本周热门、墨迹统计+七日折线、栏目预览、RSS、夜读、回顶、SEO
- lint 干净，路由 200，双主题+移动端覆盖全部新 UI

## 下一阶段建议（优先级从高到低）
1. OpenGraph 动态题图（/api/og ImageResponse），补齐外链分享卡片
2. 文章内图片支持（正文 markdown 图片：生成插图或懒加载占位水墨框）
3. 评论点赞/回应（Comment 加 reactions 列，「有同感」一键）
4. 签筒年历视图（按月分布的签文日历）
5. 游标分页/虚拟化（50+ 篇时）
6. e2e 关键路径脚本化（存 scripts/qa.md 步骤清单，减少回归成本）

---
Task ID: R6（定时审查第 6 轮）
Agent: main
Task: QA 回归 + 四项新功能（笔谈有同感 / 签历视图 / 听签 TTS / OG 动态题图）+ 布局修复

Work Log:
- QA 回归（agent-browser）：首页/问签/签筒/文章详情/笔谈/夜读全流程无阻塞 bug，R1-R5 功能全部存活，console 无错误；lint 干净
- 新功能 1「笔谈有同感」：
  - Prisma Comment 新增 reactions 列（@default(0)），db:push + 重启 dev
  - 新 API：POST /api/articles/[slug]/comments/[id]/react（校验留言归属 → increment → 返回新计数；实测 1→2 递增）
  - ReactButton 组件：「同」字小印 + 「同感」+ 计数，localStorage aoyin_comment_reacted 集合防重复（一人一言仅可印一次），已印态朱红填充 + disabled + react-pulse 印章脉冲动画（globals.css 新增 keyframes）；slug 经 props 链传递（CommentRow → ReactButton），不用 DOM 查询
- 新功能 2「签历视图」：
  - qiantong-view 重构：头部新增 签卡/签历 双 chip 切换（LayoutGrid/CalendarDays，vermillion 激活态）；原签卡墙抽为 CardsBoard 组件
  - QianCalendar 组件：paper-frame 月历（7 列周日起）、月份前后切换（跨年自动进位）、按日聚合 byDay（useMemo）、有签之日 vermillion 底 + 卦名末字小印 + 多签数量角标、今日鎏金描边、点选展开右侧详情面板（当日 N 支签：卦名+末字印+卦辞+所问+时刻+敖胤赐，custom-scrollbar 滚动）；空态「点选朱印之日」引导；底部「今日未问·再问一事」常驻按钮
  - 签筒拉取 limit 24→60（覆盖更长历史）
- 新功能 3「听签」TTS：
  - 新 API：POST /api/tts（z-ai-web-dev-sdk zai.audio.tts.create，voice=xiaochen 沉稳专业、speed=0.9 缓诵、wav 非流式；1024 字上限校验；audio/wav 二进制直返）
  - lib/listen-insight.ts：模块级 blob URL 缓存（同签文秒开，上限 16 条回收）+ 单例 Audio 播放器 + stopListening/listenToText(onEnded)
  - ListenButton 组件置于「解曰」标题行尾：待机 Volume2+听签 / 生成中 Loader2 / 播放中金框+4 条声波律动（soundBar keyframes，错拍 0.15s）+「止」；卸载时自动停止（useEffect cleanup）；换签 key 重挂载天然复位
- 新功能 4「OG 动态题图」：
  - 新路由 /api/og（next/og ImageResponse，1200x630，nodejs runtime）：宣纸渐变底 + 朱砂双线框 + 栏目方印 + Noto Serif SC 大标题（>18 字自动降字号换行）+ 鎏金短线 + 落款胤印（rotate -4°）；字体从 /usr/share/fonts 读取（霞鹜文楷 Light + 思源宋体 Black），模块级 Map 缓存（首请求 ~1s，其后秒开）
  - layout.tsx metadataBase 补齐 + openGraph.images/twitter.card 指向 /api/og（外链分享卡片补全）
- 样式细节：react-pulse 印章脉冲、soundBar 声波律动、签历朱印日 hover 加深、双 chip 切换胶囊
- 布局修复：听签按钮初版绝对定位于卦辞纸右上角，长卦辞「本自然。」与按钮重叠 → 移至「解曰」行尾（flex justify-between + shrink-0），实测无重叠

验证结果（agent-browser 实测）:
- 有同感：点击 → 计数 1 朱红激活 + disabled + aria-pressed；此前 API 测试计数 2 正确显示；移动端 390px 复/同感并排正常
- 签历：2026年9月 本月 3 签 → 4 签实时更新；14 日朱印+云字印+数量角标；点选展开右侧 3 支签详情（流云 17:15/明镜 17:03/流云 16:22 时序正确）；月份切换/跨年逻辑在代码层覆盖
- 听签：点击 → TTS 9.7s 生成（loading 旋转）→ aria-label 变「停止诵读」+ 金框声波律动 +「止」；再次点击即停（headless 无声但 play() 全链路通过）
- OG：编码 URL 200（110KB PNG）；构图含双线框/栏目印/宋体标题/胤印，存证 download/og-test2.png；裸中文 URL 400 系 curl 未编码原始字节所致，浏览器 fetch 实测 200
- 夜读：签历/今日框/朱印日/详情面板全部暗色适配（r6-dark-calendar.png）
- 移动端 390px：签历单列自适应、视图 chip 完整、笔谈同感正常
- lint 通过；/ /rss.xml /api/stats /api/categories /api/insight 全 200；dev.log 无运行时错误
- 截图存证：screenshots/r6-*.png（QA 首页/问签/签筒/评论/夜读/同感前后/听签播放/签历日详情/暗色签历/移动端）

Stage Summary:
- 本轮交付 4 项新功能 + 1 处布局修复 + 2 组新动效；AI 能力栈新增 TTS 语音（LLM 问签 → 语音诵签闭环）
- 功能集全量：司南问签（自动/定向/签筒隔离/签历视图/拓印+QR/听签 TTS）、文章（排序/加载更多/搜索/筛选/详情/进度/TOA/心许/荐书签/读毕印/笔谈复言+楼层+只看先生+敏感词+有同感/上下篇）、今日签运、本周热门、墨迹统计+七日折线、栏目预览、RSS、夜读、回顶、SEO（JSON-LD/动态标题/OG 题图）
- 关键教训：① satori（next/og）不支持 CSS inset 简写，absolute 定位须写显式 top/left/right/bottom；② ImageResponse 中文须显式注册字体（沙盒 /usr/share/fonts 有霞鹜文楷与思源宋体可直接 fs 读取）；③ 沙盒 TTS 生成约 2.5~10s，loading 态必须显式；④ curl 裸中文 URL 会被 HTTP 层 400，测 API 须 encodeURIComponent

## 当前状态评估
- 功能集与 AI 能力（LLM 问签 + TTS 听签 + canvas 拓印）已形成完整闭环；双主题、移动端、a11y 全面覆盖
- lint 干净；全部路由 200；无 console 错误

## 下一阶段建议（优先级从高到低）
1. 文章内图片支持（正文 markdown 插图：AI 生成插图或水墨占位框）
2. 听签扩展至文章（正文 >1024 字需分段合成 + 顺序播放队列，或仅读摘要/「今日一读」）
3. 签筒分享卡增加签历页截图模式；签文「再问」时保留所问历史上下文
4. 评论治理升级：频率限制（每分钟 N 条）、回复通知角标（同楼层被复提示）
5. 管理看板：/api/stats 增加 30 日趋势 + 栏目分布环形图（关于页可视化升级）
6. e2e 脚本化（scripts/qa.md 步骤清单沉淀，降低回归成本）

---
Task ID: R7（定时审查第 7 轮）
Agent: main
Task: QA 回归 + 修复（封面滤镜雷同/阅读时长失真）+ 新功能（听文 TTS / 30 日墨迹热力+栏目环形图 / 笔谈频率限制 / 问签上下文连贯）

Work Log:
- QA 回归（agent-browser）：首页/问签（明镜卦）/签筒/文章详情/留言 POST（#1 楼层+toast）/夜读/关于页全流程通过，无阻塞 bug；dev.log 无错误
- QA 发现 2 个问题待修：
  1. coverFilter 用 31 进制累积哈希，相似 slug（t-agent-design-notes-01/03 仅末字符差 2）滤镜差 ≤2° 肉眼不可辨 → 随机推荐同栏目卡封面雷同
  2. 阅读时长与字数严重失真（408 字显示 13 分钟）——seed 随机值

验证结果（agent-browser 实测）:
- 封面差异化：雪崩哈希上线后 T-agent 三篇 hue=14/-3/-2、events 组 -33/-9/-4，同栏目全部可辨（hue 撞近时 sat/bri 互补区分）； hue 桶扩至 ±36°（73 质数桶）
- 阅读时长：recalc 脚本一键修正 21 篇（408 字文章 13 分钟 → 2 分钟），前端实测「约 408 字 ↔ 2 分钟」一致
- 听文：trusted click（agent-browser 原生 click）→ 3s 内生成+进入播放态「止」+ aria-label「停止诵读」→ 再点即停回「听文」；eval 合成点击会因 autoplay policy 报 NotAllowedError，真实用户点击不受影响
- 问签上下文：API 实测 prevName=明镜卦 → 新签「持恒卦」解曰开头「此卦承前镜鉴之明」，意脉相承生效
- 笔谈限流：连发 3 条成功，第 4 条 429「落笔稍密，且饮口茶，少顷再叙」；测试数据已清理
- 墨迹统计升级：/api/stats 返回 30 日 daily + categoryDist；关于页七日折线（末 7 日切片）+ 栏目环形图（21 卷中心字 + 七色分段 + 印章图例 + 百分比）+ 30 日热力格子（3×10、5 级色阶、虚线空日、hover title、共 25 笔）全部渲染正常
- 双主题：环形图/热力格子/折线在夜读模式下自动柔化适配（CSS 变量色）实测 ✓
- 移动端 390px：首页/今日签运卡正常
- lint 通过；/ /rss.xml /api/stats /api/categories /api/insight /api/articles 全 200；dev.log 无运行时错误
- 截图存证：screenshots/r7-*.png（QA 回归、听文播放态、环形图、热力格子、夜读统计、移动端）

Stage Summary:
- 本轮交付 2 个 bug 修复 + 4 个新功能：
  1. 修复：coverFilter 哈希雪崩（FNV-1a + murmur3 finalizer），相似 slug 滤镜不再雷同
  2. 修复：阅读时长按字数自动估算（250 字/分钟，seed 逻辑 + scripts/recalc-reading.ts 存量修正）
  3. 新功能：文章「听文」TTS（标题+摘要+正文 1000 字内诵读，声波律动播放态，与荐/心许并排）
  4. 新功能：问签上下文连贯（prevName/prevOracle 入 prompt，再问签文意脉相承、卦名不重复）
  5. 新功能：笔谈频率限制（同作者同文 60s 内 3 条上限，429 婉拒文案）
  6. 新功能：墨迹统计可视化升级（30 日热力格子 + 栏目分布环形图，纯 SVG 零依赖）
- AI 能力栈：LLM 问签（现含上下文记忆）+ TTS 听签/听文 + canvas 拓印，语音闭环扩展至文章
- 关键教训：① eval 派发的合成 click 无 user activation，Audio.play() 会被 autoplay policy 拒绝，测音频链路必须用 agent-browser 原生 click（trusted event）；② React 19 lint 禁止渲染期变量重赋值（reduce 累加也不行），前缀和用纯函数式 slice+reduce 表达式；③ 相似字符串哈希必须雪崩混合，朴素累积哈希低位不扩散

## 当前状态评估
- 功能集全量可用：司南问签（自动/定向/上下文连贯/签筒隔离/签历/拓印+QR/听签）、文章（排序/加载更多/搜索/筛选/详情/进度/TOA/心许/听文/荐书签/读毕印/笔谈复言+楼层+只看先生+敏感词+限流+有同感/上下篇）、今日签运、本周热门、墨迹统计（折线+环形图+热力格子）、栏目预览、RSS、夜读、回顶、SEO
- lint 干净，全部路由 200，双主题+移动端覆盖全部新 UI，无 console 错误

## 下一阶段建议（优先级从高到低）
1. 文章正文扩充（现 177~468 字/篇偏短，阅读时长 1~2 分钟显单薄；建议每篇扩至 1200~2000 字并配 1~2 张 AI 插图）
2. 正文 markdown 图片支持（ReactMarkdown img 渲染 + 水墨框样式 + 懒加载）
3. 听文进阶：分段合成+顺序播放队列（现只读前 1000 字），或「仅读摘要」双档
4. 签历导出：月历视图生成水墨月历分享图
5. 评论回复通知（同楼层被复提示角标，Comment 加 notified 列）
6. e2e 脚本化：scripts/qa.md 步骤清单沉淀（本轮再次验证手动回归约 15 分钟，值得沉淀）

---
Task ID: R8（定时审查第 8 轮）
Agent: main
Task: QA 回归 + 内容大扩充（21 篇 LLM 扩写至平均 2750 字 + 7 张 AI 插图）+ 正文图片渲染（水墨框/图注/懒加载）+ 听文双档分段队列 + 首字下沉 + e2e 清单沉淀

Work Log:
- QA 回归（agent-browser）：首页/问签（观微卦）/签筒（session 隔离）/文章列表（排序+加载更多）/关于（墨迹统计）全流程无阻塞 bug，console 无错误；「去问一卦失灵」疑云确认为测试语法误用（find ref X click 会按名称误匹配同名标题，正确写法是 click @ref），非应用 bug，已记入 qa.md 备忘
- 新功能 1「正文 markdown 图片支持」：
  - article-dialog ReactMarkdown 新增 img 组件：水墨框 figure（外框+内线 inset 双线+四角鎏金饰角）+ 图注（figcaption 楷体鎏金短线夹注）+ next/image fill aspect-[7/4] 懒加载 + sizes 响应式
  - 关键修复：独立成段的 ![图](…) 默认被包在 <p> 内，<figure> 嵌 <p> 触发 React 嵌套校验错误 → 新增 p 渲染器解包；注意 react-markdown v9 传 mdast 节点（type:'image'）而非 hast（tagName:'img'），判断条件要两者兼容
  - globals.css 新增 .ink-figure 全套样式 + 夜读下插图 brightness(0.82) saturate(0.85) 暗化滤镜
- 新功能 2「文章正文扩充」：
  - 7 张栏目水墨插图（gen-illus.sh 串行+重试防 429，1344x768，illu-{category}.png）
  - expand-articles.ts：LLM 逐篇扩写 1300~1800 字（上限 2200），约束保留原 h2 锚点（校验容差忽略空白与全半角标点）；超长改为 smartTruncate 小节边界截断并补回 --- 落款；插图插于首小节末尾，图注按栏目三选一轮换
  - audit-fix-articles.ts：剥 LLM 输出的 h1 标题回显/「摘要：」回显段（围栏状态机逐行/逐段判断，避免误杀代码注释）、补丢失插图、重算 readMinutes；幂等可重复运行
  - rag-practice-guide 因 LLM 屡改「三、结语」标题改人工定稿（fix-rag-article.ts，1112 字）
  - audit-check.ts 终态审计：21 篇全部干净（图 1/h2≥2/无回显/≥1000 字）；终态篇均 2750 字（范围 1112~3171），阅读时长 250 字/分钟重算
- 新功能 3「听文双档 + 分段队列」：
  - lib/listen-insight.ts 重构：listenToChunks 多段顺序播放（queueToken 失效机制 + 播当前段预取下一段 + blob 缓存上限 24）；listenToText 保持单段兼容
  - article-dialog：全文/摘要 档位 chips（切换即止声）；全文档去图去 markdown 按句切分 ≤900 字分段；播放中按钮显示「止 i/n」分段进度；listen-progress 小字样式
- 样式细节：首字下沉（prose-guofeng 首段 ::first-letter 朱砂大楷 3.1em）
- 沉淀 scripts/qa.md：e2e 手工回归清单（核心 10 步 + 专项 + 历史专项）+ agent-browser 语法/环境特性备忘表 + 数据维护流程（seed → expand → fix-rag 顺序）

验证结果（agent-browser + 脚本实测）:
- 插图：租卡指南首小节末水墨框插图（双线+饰角+图注「桥上市易，锱铢必较」）、imgLoaded、夜读滤镜 brightness(0.82) 生效、390px 下 316/358 宽自适应
- hydration 嵌套错误清零（开关弹窗对比 console 计数）
- 首字下沉 47.12px 朱砂大楷
- 听文：全文档 4 段（2900 字）分段合成顺序播放，按钮「止 1/4」；播第一段时第二段已预取完成（50s 首段 + 2.9s 预取）；切摘要档即止声；摘要档合成→播放→自然结束回 idle（外部 TTS 服务延迟波动 3~50s，机制正确）
- 目录：目录（5）+ scroll-spy（65% 处「省钱三板斧」朱红高亮）
- lint 通过；tsc src 无错误；/、/rss.xml、/api/stats、/api/categories、/api/insight、/api/articles 全 200；dev.log 无运行时错误
- 截图存证：screenshots/r8-*.png（QA 首页/问签/移动端、插图+首字下沉、夜读插图、移动端夜读插图）

Stage Summary:
- 本轮交付 3 组新功能（正文图片渲染 / 全站内容扩充+插图 / 听文双档分段队列）+ 2 处样式细节（水墨图框、首字下沉）+ 2 个渲染层 bug 修复（figure-p 嵌套、mdast 判断）+ e2e 清单沉淀
- 内容体量：21 篇 × 平均 2750 字（此前 177~468 字），阅读时长 1~2 分钟 → 4~13 分钟，全部配栏目水墨插图
- 关键教训：① LLM 扩写的输出常带 h1 标题回显与「摘要：」回显段，且会擅自改小节标题——校验须容差比对 + 幂等修复脚本兜底；② react-markdown v9 组件收到的是 mdast 节点，块级图片须解包 <p>；③ bash 内联脚本含 ``` 反引号会被命令替换，含反引号的代码一律写成脚本文件执行；④ agent-browser 点击按 ref 用 click @eN，find ref 是另一种语义

## 当前状态评估
- 功能集全量可用：司南问签（自动/定向/上下文连贯/签筒隔离/签历/拓印+QR/听签）、文章（排序/加载更多/搜索/筛选/详情/进度/TOA spy/心许/听文双档/荐书签/读毕印/插图/首字下沉/笔谈复言+楼层+只看先生+敏感词+限流+有同感/上下篇）、今日签运、本周热门、墨迹统计（折线+环形图+热力格子）、栏目预览、RSS、夜读、回顶、SEO
- 内容达「正经博客」体量；lint 干净；全部路由 200；双主题+移动端覆盖全部新 UI

## 下一阶段建议（优先级从高到低）
1. TTS 体验优化：分段预取已有，但首段合成 30~50s 偏慢——考虑预合成热门文章缓存到磁盘，或先播「标题+摘要」再无缝续播正文
2. 文章配图个性化：现插图栏目级复用（每栏目 3 篇共用一张），可为每篇生成独立插图（注意 429 限流，串行+重试脚本已备）
3. 签历导出：月历视图生成水墨月历分享图（复用 share-card canvas 思路）
4. 评论回复通知（同楼层被复提示角标，Comment 加 notified 列）
5. seed.ts 与扩写流水线整合：seed 后自动串 expand+fix+audit（一条命令重建全站内容）
6. 文章字数/时长缓存列（现 wordCount 前端实时算，list 页 readMinutes 已入库，一致性 OK，量级再涨时考虑）

---
Task ID: R9（定时审查第 9 轮）
Agent: main
Task: QA 回归 + 四项新功能（签历拓历分享卡 / TTS 磁盘缓存+预热 / 文章 AI 一句话速览 / 内容重建流水线）+ 移动端动作行布局修复

Work Log:
- QA 回归（agent-browser）：首页/问签（明镜卦）/文章详情/笔谈落笔（#1 楼层+toast）/签筒/签历/关于统计/夜读/移动端 390px 全流程无阻塞 bug，R1~R8 功能全部存活；发现 2 条历史测试留言残留（R9 测试文 + author=2/body=3）已用 Prisma 清理，留言数回到 9 条种子态
- 新功能 1「签历拓历（月历分享卡）」：
  - share-card.ts 新增 downloadCalendarCard：750x1050 水墨月历——宣纸底/朱砂双线框/四角方印、「敖胤先生·签历」小字、年月大楷+历方印、鎏金统计行（本月 N 签·M 个朱印之日）、7 列月历网格（朱印之日=朱底圆角块+白描卦名末字小章+鎏金多签数量角标；素日=淡字+虚线框）、题记「朱印之日·皆有叩问」、QR+胤印落款；Web Share 优先/下载回退，复用 StampResult 三态
  - qiantong-view QianCalendar 月份标题行新增「拓历」鎏金小胶囊按钮（Stamp 图标 + loading 旋转 + aria-label）；数据从 byDay Map 按当前年月提取
  - 实测 blob 捕获预览：2026 年 9 月卡构图完整（14 日朱印+微字章+3 签角标）
- 新功能 2「TTS 磁盘缓存」：
  - /api/tts 重构：sha256(voice|speed|text) 为 key，落盘 .tts-cache/<key>.wav（存在且 >100B 直接回放，响应头 X-TTS-Cache: hit/miss）；合成后写盘 + 超过 80 个文件按 mtime 回收最旧
  - 新脚本 scripts/preheat-tts.ts：取最热 N 篇文章预合成「摘要档」（标题+敖胤AI+导语，与前端 speechChunks.brief 严格一致）——bun run tts:preheat [N=5]
  - 实测：同文本首次 2.35s（miss）→ 二次 hit 秒回；预热 5 篇全部落盘（4.3~12.8s/篇）
- 新功能 3「文章 AI 一句话速览」：
  - Prisma Article 新增 tldr 列（default ""），db:push + 重启 dev
  - 新路由 GET/POST /api/articles/[slug]/tldr：POST 幂等（有缓存直返 cached:true）；无缓存取正文前 1200 字交 LLM（system=敖胤先生人设，60 字内单句古风、禁引号前缀），清洗后落库
  - article-dialog 动作行新增「速览」按钮（Sparkles，shown 态朱红描边 aria-expanded）；点击后导语下方插入鎏金速览卡（左缘朱-金渐变竖条 + 「览」印 + 「一句话速览·敖胤先生撰」眉 + 楷体正文）；loading 文案「先生正掩卷而思，为君提炼一句…」
  - 实测：RAG 文首问 1.4s 生成（"RAG调优之道，不在算法玄奇，而在结构切分、混合检索、重排改写、评测先行之朴实工程。"）、二次 cached 秒开；夜读模式卡片适配
- 新功能 4「内容重建流水线」：package.json 新增 content:rebuild（seed → expand → fix-rag → audit-fix → recalc-reading → audit-check 六步一条命令）
- Bug 修复「移动端动作行溢出」：390px 下动作按钮行（全文/摘要|听文|速览|荐|心许）不换行导致心许溢出屏幕、速览两字竖排 → 动作容器加 flex-wrap、四个按钮加 whitespace-nowrap；实测两行换行全部可见
- lint 通过；/ /rss.xml /api/stats /api/categories /api/insight /api/articles 全 200；dev.log 无运行时错误

验证结果（agent-browser + curl 实测）:
- 拓历：月历卡 blob 预览构图正确（r9-calendar-card.png）
- TTS 缓存：miss 2.35s → hit 秒回（X-TTS-Cache 头）；预热脚本 5/5 落盘
- 速览：生成 1.4s（质量高）→ 缓存秒开；夜读/移动端适配
- 移动端：动作行 flex-wrap 修复后心许按钮 rect right=235 ≤ 390 全可见（r9-mobile-tldr-fixed.png）
- 截图存证：screenshots/r9-*.png（QA 回归、速览生成/缓存/夜读、月历卡、移动端修复）

Stage Summary:
- 本轮交付 4 项新功能 + 1 个移动端布局修复 + 2 条测试数据清理
- AI 能力栈新增：文章级 LLM 速览（懒生成+DB 缓存）；TTS 性能质变：磁盘缓存 + 预热后热门文章「摘要档」秒开
- 分享矩阵齐备：签卡/荐书签/月历三种水墨分享图（均带 QR 回流）
- 关键教训：① 动作按钮行在移动端必须 flex-wrap + whitespace-nowrap 组合，否则两端 justify-between 布局下尾部按钮溢出；② 预热脚本合成文本必须与前端分片逻辑逐字节一致（含「敖胤AI。」衔接）否则缓存永不命中；③ 沙盒 sqlite3 CLI 不可用，数据清理走 bun + Prisma Client

## 当前状态评估
- 功能集全量可用：司南问签（自动/定向/上下文连贯/签筒隔离/签历/拓印+QR/拓历月历卡/听签）、文章（排序/加载更多/搜索/筛选/详情/进度/TOA spy/心许/速览/听文双档/荐书签/读毕印/插图/首字下沉/笔谈复言+楼层+只看先生+敏感词+限流+有同感/上下篇）、今日签运、本周热门、墨迹统计（折线+环形图+热力格子）、栏目预览、RSS、夜读、回顶、SEO
- 分享矩阵：签卡 + 荐书签 + 月历卡三卡齐备；AI 栈：LLM 问签/速览 + TTS 听签/听文（磁盘缓存）+ canvas 拓印
- lint 干净；全部路由 200；双主题 + 移动端覆盖全部新 UI；dev.log 无错误

## 下一阶段建议（优先级从高到低）
1. 速览扩展：文章列表卡片 hover 显示 tldr（已入库的秒出）；「全部速览」批量预热脚本（对 21 篇循环 POST tldr，一次跑完全站缓存）
2. 听文体验：全文档 TTS 合成进度预取已有，可加「已播至 x%」进度条；TTS 磁盘缓存命中率统计进 /api/stats
3. 签筒月历卡可加「年度 12 月总览」模式（一年问签热力）
4. 评论治理升级：Comment 加 softDelete（留言主自删）、楼层链接锚点跳转
5. OpenGraph 每篇文章动态题图（/api/og?title=&category= 已有基础，文章分享卡接 URL）
6. e2e 清单 scripts/qa.md 增补 R9 专项（拓历/速览/TTS 缓存命中三条）

---
Task ID: R10（定时审查第 10 轮）
Agent: main
Task: QA 回归 + 五项新功能（卡片 hover 速览 / 速览批量预热 / 签历年览 / TTS 命中率统计 / 听文播放进度）+ 测试数据维护

Work Log:
- 状态评估：dev.log 无错误、lint 干净、路由全 200；agent-browser QA 回归（首页/文章列表/签筒/文章详情×3/关于）全绿
- QA 疑云澄清：会话初期 console 见 figure/figcaption 嵌套 hydration 报错，复现排查后确认——① remark 管线全量校验 21 篇插图段落均含直接 image 子节点（p 解包器全部覆盖）；② 干净浏览器会话实测文章详情 0 报错；③ 结论为上一轮浏览器会话的 console 缓冲残留，非现存 bug（未改代码）
- 测试语法教训补充：ArticleCard 根节点是 <article role="button">，querySelectorAll('button[aria-label^=阅读文章]') 匹配不到，须用 '[role="button"][aria-label^=...]'
- 新功能 1「卡片 hover 速览」（tldr 上卡片）：
  - Article 类型补 tldr?: string（API 早已返回，仅类型缺位）
  - ArticleCard：有 tldr 时摘要区换装——grid 叠放两层（tldr-brief 摘要 / tldr-view 速览浮层），hover 时摘要渐隐、速览同位渐入（朱红左缘 + 鎏金底 + 「览」小印 + 楷体速览）；页脚日期行内加鎏金「览」小印作常驻可发现性提示（hover 时 rotate(-6deg) 点亮），带 title="悬停可见先生速览"
  - globals.css 新增 .tldr-zone/.tldr-view/.tldr-brief/.tldr-foot + .card-tldr:hover 朴素语义类（规避 group-hover 沙盒求值异常的既知教训）；focus-visible 同步支持（键盘可达）
  - 无 tldr 的文章回退原摘要，布局零跳动
- 新功能 2「全部速览批量预热」：
  - scripts/preheat-tldr.ts：拉全站文章逐篇 POST tldr（幂等），新撰/已有/失败三态打印 + 失败重试一次；bun run tldr:preheat [limit]
  - 修复 tsc 报错：两个 preheat 脚本顶层变量冲突（无 import/export 被视为全局脚本），均加 export {} 模块化
  - 实跑：21 篇全部就绪（新撰 18 · 已有 3 · 失败 0，LLM ~0.5-0.7s/篇），生成质量高（如「租卡如选马，微调七B用4090，全参训练需四卡A100」）
- 新功能 3「签历年览」：
  - /api/insight limit 上限 60→200，签筒拉取 200（年览需跨月窗口）
  - QianCalendar 新增 month/year 双模式：月历副标题行加「年览」鎏金胶囊（CalendarRange）；年览=12 个迷你月卡（7 列点阵，朱点=问签之日、鎏金环=多签之日、金点=今日、素点=虚线网格），月卡有签时朱红描边+淡朱底+「N 签」，点击入该月月历；头部翻年 + 「共 N 签 · M 个朱印之日」统计 + 「月览」回退
  - yearAgg useMemo 聚合（count/days/dayCount 三结构），页脚图注「点任一月，入月历回望 · 金点为今日 · 多签之日鎏金环」
- 新功能 4「TTS 缓存命中率统计」：
  - /api/tts：.tts-cache/stats.json 持久化 hits/misses 计数（bumpTtsStat，命中/新诵各 +1，损坏重置、失败不影响诵读）
  - /api/stats 新增 tts 字段 {hits, misses, hitRate, files, bytes}
  - 关于页墨迹统计区新增「听闻应声」行：诵读次数 + 缓存应声百分比 + 藏音 N 段（MB），朱/金双色比例条（role=img aria-label 完整）；0 诵读时优雅隐藏百分比
  - 实测闭环：miss→hit→stats {hits:1, misses:1, hitRate:50, files:7}
- 新功能 5「听文播放进度」：
  - listen-insight.ts：playUrl 支持 onProgress（timeupdate → currentTime/duration 百分比，duration 不可用时静默）；listenToChunks 新增 onProgress(pct, i, n)（token 校验防串扰）
  - article-dialog：listenPct 状态全链路复位（停止/换档/失败/换段）；播放中按钮显示「止 1/4 · 18%」+ 底缘鎏金细线进度条（absolute bottom h-[3px]，width 随 pct 前行，transition ease-linear）
  - 实测：止 1/4 11% → 13% → 18% 递进，进度线同步
- 测试数据维护：浏览器重开致 sessionId 更换，为新会话补 4+3 条测试签（跨 8/9 月，供年览/月历演示）

验证结果（agent-browser + curl 实测）:
- 卡片速览：9/9 卡 tldr 结构就绪；hover 换装 opacity 0→1/1→0 + 页脚「览」印旋转；截图 r10-card-tldr.png
- 预热：21/21 篇就绪；列表页 9 卡全部有速览可显
- 年览：12 迷你月渲染、8 月朱红卡+红点、9 月 3 签、统计行「共 4 签 · 2 个朱印之日」；年↔月往返正确；移动端 390px 单列自适应（r10-mobile-year.png）
- TTS 统计：miss/hit 计数准确、hitRate 50%、关于页双主题渲染（r10-tts-echo.png）、移动端不溢出
- 听文进度：「止 1/4 · N%」+ 金线随播放前行（r10-listen-progress.png）；止声/换档复位正常
- 移动端 390px：文章动作行 6 按钮全部可见（flex-wrap 无溢出回归）；汉堡菜单→文章/关于导航正常
- 兼容回归：文章详情抽查 3 篇 0 嵌套错误（修正选择器后复核）；console 0 错误；lint 干净；/ /rss.xml /api/stats /api/categories /api/articles /api/og 全 200；dev.log 无运行时错误
- 截图存证：screenshots/r10-*.png（QA 回归、卡片速览 hover、年览桌面/移动、月历回跳、TTS 统计、听文进度、移动端 TTS 行）

Stage Summary:
- 本轮交付 5 项新功能 + 1 个 tsc 脚本冲突修复 + 1 条测试语法教训（role=button 选择器）
- 速览矩阵成型：LLM 懒生成（详情速览卡）→ 批量预热（tldr:preheat 一条命令全站缓存）→ 列表卡片 hover 秒出，AI 能力从详情页走到列表页
- 签历完成「月历—年历」双尺度：单月朱印之日 → 全年十二月至多签分布，问签数据可视化闭环
- TTS 观测性补全：命中率/库存量进 /api/stats 并在关于页可视化，预热→缓存→命中→展示链路完整可度量
- 关键教训：① worklog 里 QA「疑云」也要闭环归因（残留缓冲 vs 现存 bug），用干净环境+数据面校验双确认再动手；② aria/role 选择器在 eval 里要认 <article role="button"> 这类非常规标签；③ agent-browser 设视口是 `set viewport <w> <h>` 子命令，`open --viewport` 与裸 `viewport` 均无效；④ 后台 nohup 预热脚本会被沙盒会话回收，长任务一律前台同步跑

## 当前状态评估
- 功能集全量可用：司南问签（自动/定向/上下文连贯/签筒隔离/签历+年览/拓印+QR/拓历月历卡/听签）、文章（排序/加载更多/搜索/筛选/详情/进度/TOA spy/心许/速览+卡片 hover 速览/听文双档+播放进度/荐书签/读毕印/插图/首字下沉/笔谈复言+楼层+只看先生+敏感词+限流+有同感/上下篇）、今日签运、本周热门、墨迹统计（折线+环形图+热力格子+TTS 命中率）、栏目预览、RSS、夜读、回顶、SEO
- 21 篇文章 tldr 全量就绪；AI 栈：LLM 问签/速览 + TTS 听签/听文（磁盘缓存+命中率观测）+ canvas 拓印
- lint 干净；全部路由 200；双主题 + 移动端覆盖全部新 UI；console 无错误

## 下一阶段建议（优先级从高到低）
1. 评论治理升级：Comment softDelete（留言主自删）+ 楼层复制链接/会话内锚点跳转（R9 遗留）
2. 签历年览拓印：年览模式下生成「年度 12 月总览」水墨分享图（复用 downloadCalendarCard 思路，720x1050 十二宫格）
3. 听文进阶：分段进度换算为全文百分比（当前 pct 为段内进度，可按段时长加权合成总进度）；TTS 预合成进 content:rebuild 流水线
4. 首页 hero 交互增强：司南 hover 预告签文格目（如「事业·学问·行止」浮出），或今日签运卡与签历年览联动（点朱印日直达月历）
5. 文章卡片分级动效：速览浮层支持多段渐显（长 tldr 逐句浮现），或 hover 时封面轻移+速览双动画编排
6. e2e 清单 scripts/qa.md 增补 R10 专项（卡片速览 hover/年览切换/TTS 统计闭环/听文进度四条）

---
Task ID: 11
Agent: main
Task: Vercel 部署兼容性调研 + 可代码化问题修复（用户提问：部署到 Vercel 有什么问题、有没有用不了的功能）

Work Log:
- 【调研】通读全部 API 路由（articles/categories/insight/tts/og/stats/rss/comments/like/tldr）、lib（db/ai/session/share-card/listen-insight）、prisma schema、package.json、next.config.ts、.env、.gitignore、z-ai-web-dev-sdk README
- 【发现-致命①】SQLite（db/custom.db）在 Vercel serverless 只读临时文件系统上无法持久化，且 .env 写死沙盒绝对路径 file:/home/z/my-project/db/custom.db → 文章/评论/问签/点赞/浏览量等所有 DB 功能不可用
- 【发现-致命②】z-ai-web-dev-sdk 依赖 /etc/.z-ai-config（沙盒特有，不入仓）→ Vercel 上 LLM 问签、TLDR 速览、TTS 听签三处 AI 功能不可用
- 【发现-致命③】/api/og 硬编码读取沙盒系统字体 /usr/share/fonts/truetype/...（不入仓）→ Vercel 上 OG 分享图必 500
- 【发现-一般】layout.tsx metadataBase 写死 http://localhost:3000；rss.xml 硬编码 aoyinai.com；package.json 无 postinstall → Vercel 构建时 Prisma client 不会生成会直接构建失败；TTS 磁盘缓存写在 cwd（Vercel 只读，已有 try/catch 降级）
- 【修复①】复制 LXGWWenKai-Light.ttf(28MB) + NotoSerifSC-Black.ttf(14.8MB) 入仓 public/fonts/；og/route.tsx 改为 resolveFont() 候选路径链（public/fonts 优先 → 系统目录兜底），沙盒与 Vercel 双兼容
- 【修复②】新建 src/lib/ai.ts 统一 AI 访问层：通道1 z-ai-web-dev-sdk（沙盒）→ 通道2 OpenAI 兼容 API（环境变量 AI_API_KEY/AI_BASE_URL/AI_MODEL + TTS_API_KEY/TTS_BASE_URL/TTS_MODEL/TTS_VOICE），皆败返回 null 由调用方降级；insight/tldr/tts 三路由全部接入（insight 保留 4 条本地兜底签池；tldr/tts 失败返回 503 + 明确中文错误信息，前端已有 toast 降级）
- 【修复③】layout.tsx metadataBase 改用 NEXT_PUBLIC_SITE_URL（fallback localhost）；rss.xml 域名改用 NEXT_PUBLIC_SITE_URL（fallback aoyinai.com）
- 【修复④】package.json 加 "postinstall": "prisma generate"（Vercel 构建必需）；TTS 缓存目录支持 TTS_CACHE_DIR 环境变量（Vercel 设 /tmp/tts-cache）
- 【验证】eslint 0 错误；curl：首页 200 / OG 图 200（1200x630 字体渲染完好）/ RSS 200（域名回退正确）/ TTS 200（68KB wav 走 ZAI 通道）/ 问签 200（「云渡卦」+ 正常签文）/ tldr 200（缓存命中）；agent-browser 打开首页无 console 错误、国风 hero/导航/司南交互区渲染完好

Stage Summary:
- 结论：改完后代码层面已 Vercel-ready，但**数据库仍是部署硬阻塞**（SQLite 不可持久化）——上 Vercel 前必须迁移 Turso(libSQL)/Vercel Postgres 并改 prisma provider + DATABASE_URL
- AI 能力已解耦：部署后在 Vercel 环境变量配 OpenAI 兼容 API（如 DeepSeek/智谱/GLM）即可恢复问签/速览/听签；不配则问签降级本地签池、速览/听签返回友好提示
- 环境变量清单（Vercel 配置）：DATABASE_URL（必填，新数据库）、NEXT_PUBLIC_SITE_URL（推荐）、AI_API_KEY/AI_BASE_URL/AI_MODEL（推荐，恢复 LLM）、TTS_API_KEY/TTS_BASE_URL/TTS_MODEL/TTS_VOICE（可选，恢复听签）、TTS_CACHE_DIR=/tmp/tts-cache（可选）
- 已知不随代码迁移的功能：TTS 磁盘缓存跨实例失效（有 /tmp 方案但实例重启即失）、SQLite 数据需一次性导入新库（db/custom.db 440KB 种子数据可用脚本重灌或转换）
- 遗留建议：字体入仓使仓库 +43MB（可后续用 pyftsubset 子集化压缩至 <5MB）；next.config.ts 的 ignoreBuildErrors 建议部署前跑一次 tsc 全量检查；output:"standalone" 在 Vercel 无害但冗余

## 三部分交接（本轮）
① 项目当前状态：功能开发已历经 10 轮迭代（国风首页/文章/签筒/评论/速览/听签/分享卡/统计看板/暗色模式/RSS/OG），本轮完成 Vercel 部署兼容性改造，沙盒内所有功能回归通过
② 本轮目标/修改/验证：调研 Vercel 兼容性并修复 4 类代码级问题（OG 字体入仓、AI 层双通道解耦、URL 环境变量化、postinstall）；验证结果见上方 Work Log 末条，全部通过
③ 未解决问题/下一阶段优先：
   - P0（部署阻塞）：数据库迁移 —— 推荐 Turso（libSQL，最贴近 SQLite，Prisma 官方支持 driver adapter）或 Vercel Postgres；改 schema provider → db:push → 导数据
   - P1：Vercel 上配置 AI 环境变量并实测问签/速览/听签三链路
   - P2：字体子集化减肥仓库；部署后用 Vercel 域名全量回归（OG/分享卡二维码/SEO metadata）
   - P3（新需求池）：文章静态化(ISG)提升 Vercel 性能、Upstash Redis 做浏览计数/TTLDR 缓存替代磁盘缓存

---
Task ID: 12
Agent: main
Task: 移除 TTS 听签/听文功能 + 实现「零模型全功能运行」（用户要求：去掉 tts 部分，可以不用模型）

Work Log:
- 【删除】src/app/api/tts/route.ts、src/lib/listen-insight.ts、scripts/preheat-tts.ts、.tts-cache/
- 【前端去 TTS】insight-dialog.tsx（删 ListenButton 听签组件）、article-dialog.tsx（删听文按钮/全文摘要档位/分段诵读状态与 speechChunks）、about-view.tsx（删 TtsEcho 听闻应声看板 + tts 类型字段）、globals.css（删 .listen-progress 与 .sound-bar 声波律动样式）
- 【后端去 TTS】api/stats/route.ts 删 ttsCacheStats 与 tts 返回字段；src/lib/ai.ts 删除整条 TTS 双通道（aiTts/hasTtsCompat），只保留可选 aiChat
- 【零模型·问签】FALLBACK_INSIGHTS 4→16 支（观澜/启明/守拙/结网/潜渊/问津/磨镜/积薪/望山/渡口/燃灯/舍筏/澄心/拾级/听雨/乘风），新增 pickLocalInsight()：sessionId+question+日期 FNV-1a+ murmur 雪崩哈希 → 同日同问抽同签、隔日/改问换签（首版纯 FNV 有低位偏置，200 次仅覆盖 8 支，加雪崩后 1600 次覆盖 16/16、分布 90-114 均匀）
- 【零模型·速览】tldr POST 无模型时用导语精简(≤60字)兜底落库返回（source:"excerpt"），不再 503，功能不缺席
- 【验证】grep TTS 零残留；eslint 0 错误；stats API 无 tts 字段；问签/速览接口 200；agent-browser 端到端：签文弹窗无听签按钮、文章弹窗无听文/档位按钮、关于页无听闻应声看板、console 零错误；已 git 提交

Stage Summary:
- 站点现为「零模型全功能」：不配任何 AI 环境变量即可完整部署（问签=本地签池伪随机抽签，速览=导语兜底）；配置 AI_API_KEY/AI_BASE_URL/AI_MODEL 后问签与速览自动升级为 LLM 生成
- TTS 相关环境变量（TTS_*）已无意义，Vercel 配置清单减为：DATABASE_URL + NEXT_PUBLIC_SITE_URL + 可选 AI_API_KEY/AI_BASE_URL/AI_MODEL
- 下一阶段优先：P0 数据库迁移（Turso/Vercel Postgres）；P1 用 agent-browser 巡检样式细节；P2 新功能池（文章静态化/Redis 计数/签文日历分享优化）

---
Task ID: 13
Agent: main
Task: 使用用户提供的 GitHub token 推送重构代码到 nillikechatchat/aoyinai

Work Log:
- 验证 token 身份：账号 nillikechatchat（token 仅内联使用，未写入 .git/config 或任何文件）
- 列出用户仓库，确认目标仓库为 aoyinai（原站仓库，远程 main = 2ef8e9b 原站博客代码，与本地重构版历史无关）
- 通过 GitHub API 创建备份分支 backup/pre-refactor（指向原站最后提交 2ef8e9b8，可随时恢复）
- force push 本地 main (db18f0d) → 远程 main（refactor 版替换原站，配合 Vercel 从 main 部署）
- 验证：远程 main 已更新；字体(2个 ttf)、src/lib/ai.ts、prisma/schema.prisma、page.tsx、package.json 全部 200 存在

Stage Summary:
- 远程仓库 https://github.com/nillikechatchat/aoyinai 现为重构版（国风首页 + 零模型全功能运行）
- 原站代码保留在 backup/pre-refactor 分支
- 安全提醒：token 已在聊天中暴露，建议用户尽快在 GitHub Settings → Developer settings 撤销/轮换

---
Task ID: 14
Agent: main
Task: 修复 Vercel 部署报错「No Output Directory named "dist"」

Work Log:
- 定位根因：用户日志显示 next build 实际成功（路由列表已打印），但 Vercel Framework Preset 未识别为 Next.js，按 Other 框架去找 dist 输出目录（Vite 类目录）而失败
- 新增 vercel.json：framework=nextjs + buildCommand=next build + installCommand=bun install，强制框架预设，不依赖 dashboard 设置
- 确认 bun.lock 存在（Vercel 自动 bun install）、db/custom.db 已入仓（运行时数据可读）
- lint 通过；提交 748ab35 已推送远程 main

Stage Summary:
- 用户需在 Vercel 重新部署（Redeploy）即可生效；若 dashboard 里 Framework Preset 仍是 Other，vercel.json 的 framework 声明在多数情况下可在重新部署时纠正，最稳妥是同时在 Settings → General → Framework Preset 手动选 Next.js
- 遗留：SQLite 在 Vercel 为只读文件系统，问签记录/点赞等写操作数据不持久（P0，需迁 Turso/Postgres）；AI 双通道 env 可选
