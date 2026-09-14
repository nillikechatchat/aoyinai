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
