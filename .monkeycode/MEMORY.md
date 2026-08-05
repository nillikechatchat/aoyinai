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

[历史 Hugo/Astro 迁移知识]
- Date: 2026-06-28
- Context: 项目迁移至 Next.js 前的构建与排错记录
- Category: 构建方法
- Instructions:
  - Hugo Stack 使用 `assets/scss/custom.scss`；Hugo 0.160 的 `dateFormat` 为嵌套表结构，资源变量用 `false` 初始化。
  - Astro 5 的字体配置置于 `experimental.fonts`；`public/` 图片使用字符串路径并以 `<img>` 渲染。
  - 旧 Hugo/Vercel 部署依赖 `build.sh` 下载 Hugo extended，`.hugo_bin/` 需忽略；迁移时一并清理 Hugo 文件与子模块引用。

[Next.js 移动端页脚定位修复]
- Date: 2026-07-02
- Context: Agent 修复手机浏览器（Chrome/Safari）页脚不在底部的问题时发现
- Category: 排错调试
- Instructions:
  - 根因：Tailwind base 层设置 `html { height: 100% }`，锁死 html 高度恰好等于视口，内容超出时 body 无法撑开，页脚被截断或不在底部
  - 在 globals.css 中用 `html { height: auto }` 覆盖 Tailwind base 的 `height: 100%`，让 html 随内容自然撑高
  - body 设置 `min-height: 100dvh`（动态视口高度，排除手机浏览器地址栏/底栏），`min-h-screen` 作为旧浏览器回退
  - 内层 flex 容器用 `flex min-h-dvh flex-col`，main 用 `flex-1` 撑满剩余空间
  - 不要在 html 上设 `height: 100dvh`（固定值），只在 body 和内层容器上用 `min-height`（最小值）
  - `dvh`（dynamic viewport height）在 Tailwind 3.4+ 中对应 `min-h-dvh` 类，Chrome 108+、Safari 15.4+ 支持
  - 诊断口诀：页脚不在底部 → 检查 html 是否被 height:100% 锁死 → 改为 height:auto

[不蒜子访问量 display:none 导致数据丢失]
- Date: 2026-07-02
- Context: Agent 修复网站访问量和文章阅读量不显示的问题时发现
- Category: 排错调试
- Instructions:
  - 根因：busuanzi.pure.mini.js 只设置 value 元素的 innerHTML，不修改容器的 display 属性
  - 之前为避免脚本加载失败时显示空数据，在容器上加了 style="display:none"，导致数据被写入但容器永远隐藏
  - 正确做法：容器保持默认可见，添加一个 5 秒延迟的兜底脚本，检测 value 元素是否有内容，无则显示 "--" 占位
  - 不要在 busuanzi 容器上设 display:none，busuanzi 脚本不管理容器可见性
  - 兜底脚本示例：setTimeout(function(){var pv=document.getElementById('busuanzi_value_site_pv');if(pv&&!pv.innerText)pv.innerText='--';},5000);

[文章日期必须使用系统当前日期]
- Date: 2026-07-11
- Context: Agent 多次创建文章时使用了错误的日期（凭记忆推测而非读取系统日期）
- Category: 排错调试
- Instructions:
  - 创建或更新文章时，必须从系统提示中读取 "Today's date" 并使用该日期
  - 禁止凭记忆、推测或使用"上次看到的日期"来填写文章日期
  - 系统提示格式为 "Today's date: Sat Jul 11 2026"，提取其中的日期部分
  - 日期格式统一为 YYYY-MM-DD，时区为 +08:00
  - 每次写文章前，先确认当前日期，不要沿用之前文章的日期

[新文章标题必须参考公众号标题策略师]
- Date: 2026-07-11
- Context: 用户要求发布新文章时标题参考 gzh-title-strategist 技能
- Category: 工作流协作
- Instructions:
  - 创建新文章时，必须参考公众号标题策略师的方法论生成标题
  - 标题决策顺序：文章真实结论 → 读者具体结果 → 事实证据 → 数据关键词 → 网感措辞
  - 按不同点击动机生成标题：稳健准确型(4个)、网感点击型(4个)、专业权威型(3个)、数据关键词型(3个)、长期型(2个)
  - 对前 5 名标题评分：点击欲望、事实匹配、人群匹配、差异化、长期价值
  - 推荐 1 个主标题 + 2 个备选标题
  - 标题长度 24-38 个汉字，核心实体和变化放在前 18-24 个字
  - 最多一个感叹号，最多一个问号，避免连续感叹号和多个省略号
  - 参考文档：https://github.com/liucongg/liucong-skills/tree/main/skills/gzh-title-strategist
  - 参考文章：/blog/gzh-title-strategist

[提交默认推送远程]
- Date: 2026-07-22
- Context: 用户明确提交操作的协作约定
- Category: 工作流协作
- Instructions:
  - 用户要求“提交”时，完成本地 git commit 后同步推送到对应远程分支。

[赛事统计更新流程]
- Date: 2026-07-28
- Context: 用户明确赛事栏目维护流程
- Category: 工作流协作
- Instructions:
  - 更新赛事统计时依次执行：调研官方来源、收集可核验信息、整理截止日期与状态、将赛事置入当前可报名或历史赛事、修改数据并验证后提交推送。
  - 截止日已过或明确标记结束的赛事归入历史赛事；仅在主办方或赛事平台官网可核验后列为当前可报名赛事。

[Next.js 构建环境]
- Date: 2026-08-05
- Context: Agent 更新赛事数据并执行构建时发现
- Category: 环境配置
- Instructions:
  - 工作区可能缺少本地 `node_modules`；使用全局依赖时，以 `NODE_PATH="/usr/local/lib/node_modules" /usr/local/bin/next build` 运行构建，以同样前缀执行 Vitest 专项测试。
