# 敖胤AI · e2e 手工回归清单

> 每轮迭代前跑一遍「核心回归」（约 10 分钟），发布新功能后跑对应「专项」。
> 工具：`agent-browser`（常用：`open` / `snapshot` / `click @ref` / `find role button click --name X` / `eval` / `screenshot` / `set viewport 390 844`）。
> ⚠️ 语法备忘：按 ref 点击必须写 `agent-browser click @e19`；`find ref e19 click` 会被误解析（按名称匹配到同名标题）。
> ⚠️ 页面滚动状态下元素可能在视口外，先 `eval "window.scrollTo(0,0)"` 再点。

## 一、核心回归（每轮必跑）

1. **首页加载**：`agent-browser open http://localhost:3000/`
   - [ ] 标题「敖胤AI · 观智能之潮，守问学之心」
   - [ ] Hero 山水 + 司南 + 云纹/飞鸟；今日签运小卡出现（「今日未问」或卦名）
   - [ ] 随机推荐 3 卡、本周热门 3 卡、七大栏目卡
   - [ ] `agent-browser console` 无 error
2. **问签全流程**：`click @司南按钮ref` → 等 3~8s
   - [ ] 弹窗出现，旋转推演动画 → 卦名/卦辞/解曰/宜/建议完整
   - [ ] 「抄录」可复制；「听签」点击后变播放态（再点即停）
   - [ ] 「定向叩问」输入问题 → 得到贴题建议
   - [ ] 「拓印」→ blob 下载或系统分享；toast 文案正确
   - [ ] 「翻看签筒」跳转签筒视图
3. **签筒**：导航「签筒」
   - [ ] 签卡墙显示本人记录（session 隔离；新浏览器会话应为空筒+空态引导）
   - [ ] 签历切换：月历朱印日、点选展开右侧详情、月份前后切换
4. **文章列表**：导航「文章」
   - [ ] 排序签条 最新/最热 切换有效（最热首位为 views 最高）
   - [ ] 搜索 + 栏目筛选 + 空状态文案
   - [ ] 「再展一卷」分页：9→18→21，「尽览于此」落款
5. **文章详情**：任开一篇
   - [ ] 进度条随滚动；目录 chips + scroll-spy 高亮
   - [ ] 字数与「X 分钟」与正文长度匹配（约 250 字/分钟）
   - [ ] 心许：点击后计数 +1、按钮变已心许、刷新不重复
   - [ ] 笔谈：楼层号、复言、只看先生、同感、500 字计数、防重/限流文案
   - [ ] 上下篇导航可切换；document.title 同步
   - [ ] 荐书签 blob 生成；读毕印记出现在列表封面
6. **关于页**：墨迹统计（文/阅/许/谈/签 + 七日折线 + 栏目环形图 + 30 日热力）
7. **双主题**：右上角切换夜读 → 各视图无刺眼白块、图表/插图暗色适配；刷新持久
8. **移动端 390px**：`set viewport 390 844` → 抽屉导航含签筒/夜读、栏目单列、今日签运卡、听文/档位 chips 不换行溢出
9. **路由 200**：`/` `/rss.xml` `/api/stats` `/api/categories` `/api/insight?limit=1`
10. **lint**：`bun run lint` 通过；`tail -50 dev.log` 无运行时错误

## 二、专项回归（按本轮改动选跑）

### R8 新增
- [ ] **正文插图**：文章首个小节末尾有水墨框插图（双线+四角饰角+图注）；懒加载；夜读下插图变暗；无 hydration 警告
- [ ] **首字下沉**：正文第一段首字为朱砂大楷
- [ ] **听文双档**：全文/摘要 chips；全文长文分段续播（按钮显示 i/n）；切档时止声
- [ ] **正文扩写**：抽查 3 篇 → 字数 1100~3000、h2 与目录一致、单篇单图、无断头句

### 数据维护流程（重要）
1. `bun run scripts/seed.ts`（重置全部数据，含 8 条种子留言）
2. **紧跟着必须** `bun run scripts/expand-articles.ts`（LLM 扩写至 1100~3000 字并插图，约 20 分钟）；
   rag-practice-guide 为人工定稿，用 `bun run scripts/fix-rag-article.ts` 覆写
3. 插图素材 `public/images/illu-*.png`（7 张，栏目级）；缺失时先跑 `bash scripts/gen-illus.sh`
4. 改 schema 后：`bun run db:push` + 重启 dev（内存 Prisma Client 缓存）

### 历史专项（结构变动时抽跑）
- [ ] 拓印分享卡含二维码（750x1050，扫码文案「扫码·再问一卦」）
- [ ] OG 题图 `/api/og?title=...&seal=...` 200 且构图完整
- [ ] 敏感词：1 处掩 ※；3 处 422 婉拒
- [ ] 笔谈限流：60s 内第 4 条 429「落笔稍密」
- [ ] 签筒空态：清 session 后签筒为空 + 引导按钮

## 三、已知环境特性（排查必读）

| 现象 | 根因 | 处置 |
| --- | --- | --- |
| group-hover 全站不生效 | 沙盒 headless Chromium 对 `:is(:where(.group):hover *)` 求值异常 | 关键 hover 用朴素 `:hover` 语义类（globals.css 兜底段） |
| 新图片/新 Prisma 列不生效 | dev 服务器内存缓存（Next 图片缓存 / 旧 Prisma Client） | 重启 dev：`(setsid bun run dev >/dev/null 2>&1 &)` |
| eval 合成点击后 Audio.play() 报 NotAllowedError | 合成点击无 user activation | 测音频链路用 `agent-browser click @ref`（trusted event） |
| 改 CSS 不生效 | HMR 偶发漏编译 | 往 globals.css 追加任意内容触发重编译 |
| curl 中文 URL 400 | HTTP 层未编码 | 测 API 时 encodeURIComponent |
| framer whileHover 冻结在 opacity 0 | 对象态 hover 变体覆盖入场态 | 用命名变体并带 opacity:1 兜底 |
| React 19 lint 禁 effect 内同步 setState | react-hooks/set-state-in-effect | localStorage 类状态用 useSyncExternalStore + 模块订阅 |
| Prisma 可空列 @default(null) 报错 | SQLite 不接受该语法 | 去掉默认值，可空列默认即 null |
