/**
 * 种子数据：敖胤AI 七大栏目 + 文章
 * 运行: bun run scripts/seed.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const categories = [
  { key: "tutorials", name: "AI 教程", en: "Tutorials", seal: "教", order: 1, description: "LLM 入门、RAG、Agent 实战，从入门到进阶的完整路径。" },
  { key: "market", name: "市场分析", en: "Market", seal: "市", order: 2, description: "大模型厂商竞争格局、价格趋势与行业风向研判。" },
  { key: "majors", name: "高校专业", en: "Majors", seal: "校", order: 3, description: "国内 AI 强校课程设置、实验室方向与就业去向。" },
  { key: "events", name: "赛事活动", en: "Events", seal: "赛", order: 4, description: "Kaggle、NeurIPS 等顶赛清单与参赛攻略。" },
  { key: "hackathons", name: "黑客松", en: "Hackathons", seal: "客", order: 5, description: "高质量 AI 黑客松实时推荐与组队情报。" },
  { key: "cloud-deals", name: "云厂商优惠", en: "Cloud Deals", seal: "云", order: 6, description: "阿里云、腾讯云、华为云、火山引擎大模型 API 优惠汇总。" },
  { key: "t-agent", name: "T-agent", en: "T-agent", seal: "智", order: 7, description: "正在打磨的多智能体协作框架：设计笔记与工程实录。" },
];

const articles: Array<{
  slug: string; title: string; excerpt: string; content: string; category: string;
  tags: string; cover: string; readMinutes: number; daysAgo: number;
}> = [
  // ---------- AI 教程 ----------
  {
    slug: "llm-intro-roadmap", category: "tutorials", tags: "LLM,入门,路线图", cover: "/images/cover-tutorials.png", readMinutes: 12, daysAgo: 3,
    title: "在大模型时代安放自己的学习路径",
    excerpt: "人生如学路，时有迷惑。或许真正的修行，不是追平所有新论文，而是在喧嚣中依然保有内心的节奏——一份写给初学者的 LLM 学习路线图。",
    content: `## 缘起

大模型时代的知识更新以「周」为单位。许多人问：论文看不完、框架学不动，怎么办？

《大学》有言：「知止而后有定，定而后能静。」学习 AI 亦如是——先知道自己的边界与目标，才能安定下来积累。

## 第一层：通其理

不急于调包，先建立三块基石：

- **Transformer 的直觉**：注意力机制本质是「查询-检点-回应」的过程，与古人治学中的「格物致知」暗合；
- **预训练与微调的分野**：明白底座能力与领域适配的关系；
- **提示工程的真实边界**：Prompt 不是咒语，而是清晰的思考被写了下来。

## 第二层：动其手

1. 用 100 行代码实现一个最小 RAG 流水线；
2. 为自己常用的场景写一个 Agent：检索、规划、反思三步走；
3. 读一个开源框架源码（推荐从LangChain的 Chain 抽象读起）。

## 第三层：守其心

工具会更迭，范式会翻新，但「把问题定义清楚」的能力永远稀缺。与其焦虑地追新，不如每周留出半天做一次复盘：这一周我解决了什么真实问题？

> 学而不思则罔，思而不学则殆。AI 时代的学习，依然是这句话。

---

*欢迎在评论区交流你的学习节奏。*
`,
  },
  {
    slug: "rag-practice-guide", category: "tutorials", tags: "RAG,向量检索,实战", cover: "/images/cover-tutorials.png", readMinutes: 15, daysAgo: 18,
    title: "RAG 系统调优实录：从能用到的可靠",
    excerpt: "RAG 之难，不在检索，而在「检而得当」。本文以一个真实项目为例，记录从基线到 92% 命中率的十二次迭代。",
    content: `## 一、问题的提出

客户知识库问答系统，基线版本命中率仅 61%。症状：检索回来的段落「相关但不用」，模型答非所问。

## 二、十二次迭代中的关键五步

### 1. 切分策略重于模型选择
固定 512 token 切分是懒办法。按标题层级做结构化切分，保留章节路径作为元数据，命中率立涨 9 个百分点。

### 2. 混合检索是性价比之王
向量检索 + BM25 并行召回，RRF 融合。中文场景下 BM25 常被低估。

### 3. 重排模型的边际收益
接入 bge-reranker 后 Top-3 命中率提升 14%。代价是延迟增加约 120ms，值得。

### 4. 查询改写
用户的问题往往不适合直接检索。用小模型做一次 query rewrite，把口语转成检索友好的表达。

### 5. 评估先行
没有评估集，一切调优都是玄学。先手工构造 200 条问答对，再谈优化。

## 三、结语

RAG 调优如同熬药：火候、次第、配伍，缺一不可。欲速则不达。
`,
  },
  // ---------- 市场分析 ----------
  {
    slug: "llm-price-war-2025", category: "market", tags: "价格战,API,趋势", cover: "/images/cover-market.png", readMinutes: 10, daysAgo: 5,
    title: "API 价格战下沙：开发者当如何择木而栖",
    excerpt: "大模型 API 价格一降再降，看似繁荣，实则暗流涌动。本文拆解主流厂商定价策略背后的三种生存哲学。",
    content: `## 三种生存哲学

### 其一：以价换量
头部云厂商把旗舰模型价格压至厘级，目的是把开发者沉淀到自家云生态。模型是入口，云资源才是生意。

### 其二：以专取胜
垂直厂商不做全能冠军，只在代码、长文本、多模态等单点做到极致，溢价 30% 仍有稳定客群。

### 其三：开源圈地
权重开放，商用授权收费。免费的是社区口碑，收费的是 SLA 与私有化部署。

## 开发者如何选择

1. **别把鸡蛋放在一个 API 里**：抽象一层模型网关，随时可切换；
2. **算总账而非单价**：缓存命中、批量折扣、失败重试都会影响真实成本；
3. **警惕超低价的上下文陷阱**：输入便宜、输出昂贵的定价结构，对长回答场景并不友好。

> 良禽择木而栖。择木之前，先看清整片森林。
`,
  },
  {
    slug: "agent-startup-landscape", category: "market", tags: "Agent,创业,格局", cover: "/images/cover-market.png", readMinutes: 13, daysAgo: 25,
    title: "Agent 创业地图：热闹背后的四条窄门",
    excerpt: "Agent 赛道融资火热，但去掉泡沫，真正跑通商业闭环的只有四类。本文用数据说话。",
    content: `## 泡沫与真需求

过去一年，Agent 相关融资事件过百起。但剔除「PPT 融资」，真正的收入来自四个方向：

1. **编程 Agent**：最清晰的 PMF，软件工程天然可验证、可回滚；
2. **客服与销售**：ROI 可直接用转化率衡量，企业付费意愿明确；
3. **垂直行业流程自动化**：法律、财务、医疗文书，壁垒在行业知识而非模型；
4. **个人效率工具**：订阅制，天花板低但现金流稳。

## 四条窄门的共同特征

- 有**可验证的完成标准**（代码能跑、订单能成交）；
- 有**数据飞轮**（用得越多越懂你）；
- 失败成本**可控**（错了可以改，不至于不可挽回）。

## 写在最后

风口上猪都能飞，但风停之后，长出翅膀的才是赢家。
`,
  },
  // ---------- 高校专业 ----------
  {
    slug: "ai-major-curriculum", category: "majors", tags: "人工智能专业,课程,择校", cover: "/images/cover-majors.png", readMinutes: 11, daysAgo: 8,
    title: "人工智能专业课程表背后：强校与弱校的分野",
    excerpt: "同样叫「人工智能专业」，课程表却天差地别。本文对比 12 所高校的培养方案，告诉你哪些课真正值得学。",
    content: `## 看课程表，如同看山

有的学校课程表写满「Python 入门」「办公自动化」，有的学校则是「凸优化」「统计学习理论」「机器人学」。差距在四年之后显现。

### 强校的三个标志

1. **数学底座扎实**：线性代数、概率论、优化理论三件套，且是真材实料的三件套；
2. **有真实验室**：本科生能进组、能摸到真实 GPU 集群与数据集；
3. **课程迭代快**：已有《大模型导出》《多智能体系统》这类新课，说明教学在跟着前沿走。

### 报考建议

- 分数够得上顶尖梯队，优先看**导师与实验室**而非校名；
- 分数在中间梯队，优先看**课程表与毕业去向**；
- 别只看「人工智能」四个字，去看培养方案里的选修模块——那才是专业的真面目。

> 择校如择友，观其言更要察其行。
`,
  },
  {
    slug: "ai-graduation-destiny", category: "majors", tags: "就业,读研,去向", cover: "/images/cover-majors.png", readMinutes: 9, daysAgo: 30,
    title: "AI 专业毕业去向调查：读研、就业与出海",
    excerpt: "对 217 名 AI 专业毕业生的追踪调查显示：选择比努力更早发生。三去向前程各异，路径规划宜早不宜迟。",
    content: `## 三个去向

### 读研（约 55%）
AI 岗位对学历的要求客观存在，顶尖算法岗几乎被硕士以上垄断。读研首选有真实产出的实验室。

### 就业（约 35%）
工程能力强的本科生一样抢手——前提是有拿得出手的项目。三个实习大于一纸证书。

### 出海与其他（约 10%）
海外深造、创业、转产品岗……路径越来越多元。

## 一个反直觉的发现

毕业时薪最高的群体，不是发论文最多的人，而是**能把模型做成产品的人**。市场奖励的从来不是知识本身，而是知识的完成度。
`,
  },
  // ---------- 赛事活动 ----------
  {
    slug: "kaggle-neurips-2025", category: "events", tags: "Kaggle,竞赛,清单", cover: "/images/cover-events.png", readMinutes: 8, daysAgo: 6,
    title: "下半年值得押注的八个 AI 竞赛",
    excerpt: "从 Kaggle 到 NeurIPS Track，八场赛事各有千秋。选对赛场，如同棋手选对棋局。",
    content: `## 选赛如选局

参加竞赛最贵的不是算力，是时间。八个赛事按「性价比」排序：

1. **Kaggle 常规赛**：积分体系成熟，队伍池深，适合练手与冲牌；
2. **NeurIPS 竞赛赛道**：学术含金量高，强 baseline 会公开，重在参与质量；
3. **天池/讯飞飞桨中文赛事**：中文场景数据稀缺，是积累中文 NLP 经验的宝贵机会；
4. **AI4Science 系列**：蛋白质、材料、气象，方向冷门但奖金与论文机会双高；
5. 各大厂**校园算法赛**：奖金不是重点，重点是可以直通面试。

## 参赛三问

- 我是为了**名次**还是为了**练能力**？
- 队伍配置是否互补（一人擅长特征、一人擅长模型、一人擅长工程）？
- 是否有可复用的 baseline 管线沉淀？

> 弈者不贪全胜，但求每局有得。
`,
  },
  {
    slug: "first-competition-guide", category: "events", tags: "新手,攻略,参赛", cover: "/images/cover-events.png", readMinutes: 7, daysAgo: 33,
    title: "第一次参加算法竞赛，从哪里下手",
    excerpt: "不必等「准备好了」再开始。一份写给纯新手的参赛指南：七天跑通第一个完整方案。",
    content: `## 第一天到第三天：读懂赛题

把赛题讨论区翻三遍。别人的失败与困惑，是最便宜的教材。

## 第四天到第五天：跑通 Baseline

不求分高，先求「能提交」。一个能跑通的 60 分方案，胜过一个想象中的 90 分方案。

## 第六天到第七天：单点优化

只做一件事：误差分析。看一百条错例，比调一百次参更有用。

## 写在最后

竞赛的本质是「在约束下的快速学习」。名次会过期，能力不会。
`,
  },
  // ---------- 黑客松 ----------
  {
    slug: "hackathon-picks-q4", category: "hackathons", tags: "黑客松,组队,推荐", cover: "/images/cover-hackathons.png", readMinutes: 6, daysAgo: 4,
    title: "本季黑客松精选：五场值得连夜赶工的比赛",
    excerpt: "灯会千盏，只取一瓢。本季五场高质量 AI 黑客松：有奖金、有投资人、有真实用户反馈场。",
    content: `## 五场精选

1. **全球 Agent 应用马拉松**（线上，48 小时）：主题「让 Agent 完成一次真实交易」，评审含多位天使投资人；
2. **AI4Health 创新营**（线下，北京）：与三甲医院联合出题，优质项目可获真实数据集试点机会；
3. **开源之夏黑客周末**：要求全部基于开源模型，奖金池 20 万；
4. **校园 AI 硬件松**：软硬结合，提供边缘计算开发板；
5. **RAG 极限挑战赛**：单一命题——把检索命中率在固定语料上做到极致。

## 组队心法

- 三个臭皮匠不如一个全能战士加两个可靠执行者；
- 事先约定 demo 完成的「最低可展示版本」，避免最后一夜推倒重来；
- 留足 2 小时录 demo 视频——评审只有 3 分钟，第一印象决定一切。

> 临渊羡鱼，不如退而结网。报名通道见文末。
`,
  },
  {
    slug: "hackathon-demo-magic", category: "hackathons", tags: "Demo,演示,技巧", cover: "/images/cover-hackathons.png", readMinutes: 5, daysAgo: 21,
    title: "黑客松 Demo 的魔术：三分钟征服评审",
    excerpt: "评委记不住你的技术栈，只记得住你的三分钟。Demo 演示的七个细节与三个禁忌。",
    content: `## 七个细节

1. 开场 10 秒说清「为谁解决什么」；
2. 真机演示，录屏只做备份；
3. 提前造好「演示数据」，让界面一打开就热闹；
4. 讲一个 30 秒的用户故事，胜过五页架构图；
5. 故意留一个「彩蛋功能」在结尾引爆；
6. 语速放慢，眼神看向人而非屏幕；
7. 结尾说清下一步计划，暗示这不是玩具。

## 三个禁忌

- 忌现场敲命令行装依赖；
- 忌说「在我们本地是好的」；
- 忌超时——评审的心是闹钟，超时即失分。
`,
  },
  // ---------- 云厂商优惠 ----------
  {
    slug: "cloud-api-deals-oct", category: "cloud-deals", tags: "API优惠,白嫖,算力", cover: "/images/cover-cloud.png", readMinutes: 6, daysAgo: 2,
    title: "十月大模型 API 优惠汇总：新客礼包与免费额度",
    excerpt: "云海茫茫，何处泊舟？本月四大平台优惠速览：免费额度、新客折扣、学生计划一表看清。",
    content: `## 本月速览

| 平台 | 免费额度 | 新客优惠 | 学生计划 |
| --- | --- | --- | --- |
| 阿里云百炼 | 新用户千万 token | 旗舰模型 5 折券 | 有 |
| 腾讯云混元 | 部分模型限时免费 | 充值满减 | 有 |
| 火山方舟 | 每模型 50 万 token | 新客 3 折试用包 | 有 |
| 硅基流动 | 注册送 2000 万 token | 邀请各得 | 有 |

*（具体以官方页面为准，本文不构成消费建议）*

## 三条薅羊毛心法

1. **免费额度用来试错，付费预算留给生产**；
2. 关注「限时免费」名单，新品上市常白嫖窗口期；
3. 学生认证几乎零成本，能领则领。

> 云上有路勤为径，薅海无涯「省」作舟。
`,
  },
  {
    slug: "gpu-rental-guide", category: "cloud-deals", tags: "GPU,租卡,性价比", cover: "/images/cover-cloud.png", readMinutes: 9, daysAgo: 28,
    title: "租卡指南：训练与推理场景下的 GPU 性价比实测",
    excerpt: "A100、4090、H20……租卡如同选马，贵的不一定跑得快。附三档预算的实测数据。",
    content: `## 场景决定选型

- **微调 7B 模型**：单卡 4090（24G）足够，性价比之王；
- **全参训练 13B**：至少 4×A100 80G，优先考虑抢占式实例，成本省 60%；
- **推理服务**：中小流量用 4090 + vLLM，高并发再上 A10/A100。

## 省钱三板斧

1. **抢占式实例**：训练任务务必加断点续训，可省一半以上；
2. **模型量化**：推理用 INT8/INT4，显存减半，速度翻倍；
3. **错峰租用**：凌晨时段部分平台有折扣。

## 实测结论

单位有效算力成本：4090 < A10 < A100 < H100。但考虑时间成本，大任务直接上 A100 以上，早跑完早下班。
`,
  },
  // ---------- T-agent ----------
  {
    slug: "t-agent-design-notes-01", category: "t-agent", tags: "T-agent,多智能体,架构", cover: "/images/cover-tagent.png", readMinutes: 14, daysAgo: 1,
    title: "T-agent 设计笔记（一）：为什么是多智能体",
    excerpt: "傀儡千丝，牵引在一线。T-agent 框架的缘起：当单个 Agent 无法再「想清楚」，协作就是必然。附架构图与第一批踩坑记录。",
    content: `## 缘起

做一个能独立完成数据分析任务的 Agent 时，我发现了单体的天花板：上下文越长越糊涂，工具一多就迷路，错了不知从哪改起。

人类用分工解决了类似的问题——于是有了 T-agent。

## 核心设计

### 1. 角色即约束
每个 Agent 只配一个职责、一组有限工具。Planner 不碰工具，Worker 不改计划。约束产生可预测性。

### 2. 消息即账本
所有协作通过结构化消息，全程留痕。出错时可以回放任意一步——像审计账本一样调试 Agent。

### 3. 失败即路径
重试不是失败，是搜索。每条失败路径都会被记录，供 Planner 下次绕行。

## 踩坑三则

- 不要让两个 Agent 「讨论」，讨论会发散。让它们「汇报」，汇报才收敛；
- 共享内存是效率杀手，能传引用就不传内容；
- 早期版本我给每个 Agent 都加了记忆，结果它们开始固执己见。删掉后，协作反而顺畅了。

## 下一步

《设计笔记（二）》将写任务分解算法与失败恢复机制。

> 千里之行，始于足下。框架亦是。
`,
  },
  {
    slug: "t-agent-eval", category: "t-agent", tags: "T-agent,评测,工程", cover: "/images/cover-tagent.png", readMinutes: 12, daysAgo: 12,
    title: "T-agent 设计笔记（二）：给 Agent 建立体检制度",
    excerpt: "没有评测的 Agent 系统如同没有体检的人，生病了都不知道从哪查起。本文公开 T-agent 的三层评测体系。",
    content: `## 三层体检

### 第一层：单元级
每个 Agent 的单步能力测试：给定输入，断言输出结构。快速、稳定、必跑。

### 第二层：任务级
50 个端到端标准任务，统计完成率、步数、token 成本。每次改动全量回归。

### 第三层：混沌级
故意注入故障：工具超时、返回乱码、中途撤掉一个 Agent。看系统能否优雅降级。

## 一个重要发现

上线的头两周，任务失败案例中 78% 不是「模型不够聪明」，而是**提示词里的职责边界模糊**。改提示词的收益远大于换模型。

## 工程感悟

评测不是成本，是复利。今天多写一条断言，明天少熬一夜夜。
`,
  },
  // ---------- 第二轮补充：每栏目 +1 ----------
  {
    slug: "agent-memory-guide", category: "tutorials", tags: "Agent,记忆,实战", cover: "/images/cover-tutorials.png", readMinutes: 11, daysAgo: 10,
    title: "Agent 记忆系统入门：让 AI 记得住事",
    excerpt: "金鱼记忆的 Agent 成不了大事。本文用三个递进实验，讲清短期记忆、长期记忆与工作记忆的正确打开方式。",
    content: `## 一、为什么你的 Agent 健忘

大模型本身无状态。每一次调用都是初见——除非你把「过去」装进上下文。记忆系统的本质，是决定**什么值得被记住、何时被想起**。

## 二、三个递进实验

### 实验一：对话滑动窗口
保留最近 N 轮对话。五分钟实现，代价是「远期事项」静默丢失。适合闲聊，不适合办事。

### 实验二：摘要压缩
每满十轮，用小模型把前文压缩成一段摘要塞进 system。上下文省了 70%，细节保不住——但方向对了。

### 实验三：向量记忆库
把关键事实（用户偏好、已完成的步骤、失败教训）写入向量库，按语义检索召回。这是长期记忆的正形。

## 三、三条军规

1. **写入比读取更讲究**：不是所有话都值得记，让模型自己判断「此句可留」；
2. **记忆要会过期**：给每条记忆打时间戳与置信度，旧账定期清算；
3. **检索精度大于容量**：能精准想起十件事的 Agent，胜过糊涂记得一千件的。

> 记得该记的，忘掉该忘的——人如此，Agent 亦然。
`,
  },
  {
    slug: "open-vs-closed-2026", category: "market", tags: "开源,闭源,生态", cover: "/images/cover-market.png", readMinutes: 12, daysAgo: 14,
    title: "开源与闭源：大模型生态的楚河汉界",
    excerpt: "开源权重攻城略地，闭源巨头高筑城墙。这盘棋下到中盘，真正的问题已经不是谁能赢，而是棋盘正在换。",
    content: `## 两军的版图

闭源阵营握着三张牌：最强性能、企业 SLA、一体化工具链。开源阵营也有三张牌：可私有化、可魔改、社区审计。

### 被低估的事实

- 开源模型的**能力衰减曲线**远比闭源平缓：差距从「代差」缩到「数月」；
- 企业真正付费买的不是模型，是**确定性与责任主体**；
- 开源生态的钱，流向了微调工具、推理框架与数据服务——「卖水人」先富。

## 三种终局猜想

1. **分层共存**：闭源守高端，开源占长尾，中间层最惨烈；
2. **开源商业化收编**：头部开源厂转型「开放核心 + 托管服务」，变身新云厂商；
3. **监管改写棋盘**：合规成本成为新护城河，小玩家向社区回归。

## 给开发者的启示

押注开源不代表情怀，而是**议价能力**：手里有可自部署的模型，谈判桌上腰杆才硬。
`,
  },
  {
    slug: "ai-minor-compare", category: "majors", tags: "辅修,选课,对比", cover: "/images/cover-majors.png", readMinutes: 9, daysAgo: 20,
    title: "AI 辅修值不值得修？三校培养方案对比实录",
    excerpt: "辅修不是主修的缩水版，而是一次谨慎的「能力嫁接」。我们对比了三所高校的 AI 辅修课表，结论出乎意料。",
    content: `## 三个样本

- **A 校（综合类）**：机器学习 + 数据结构 + 一门项目课，重理论；
- **B 校（工科强校）**：深度学习框架实操 + 机器人导论，重工程；
- **C 校（财经类）**：商业分析 + AI 应用工具，重场景。

## 对比结论

### 值得修的信号
课程里有**必须写代码的期末项目**、有企业导师、学分能写进成绩单主修栏。

### 劝退的信号
全部是「导论」「漫谈」类课程、上机课时为零、辅修证书与主修学位完全不挂钩。

## 一个意外发现

C 校（财经类）的 AI 辅修毕业生，进入金融科技岗的比例反而最高。**跨界嫁接**的复合背景，在就业市场是稀缺品。

## 报名前三问

1. 我的主修能和 AI 产生化学反应吗？
2. 课表里有多少小时是动手写代码的？
3. 往届辅修生都去了哪儿？
`,
  },
  {
    slug: "neurips-timeline-2026", category: "events", tags: "NeurIPS,备赛,时间线", cover: "/images/cover-events.png", readMinutes: 8, daysAgo: 9,
    title: "NeurIPS 竞赛时间线：一张备赛清单走全年",
    excerpt: "顶会竞赛拼的不是临场发挥，而是日历管理。从三月到十二月，每个节点该做什么，一张表说清。",
    content: `## 全年节点表

| 时间 | 节点 | 要做的事 |
| --- | --- | --- |
| 3-4 月 | 赛题公布 | 精读往届冠军方案，组队定分工 |
| 5-6 月 | Baseline 期 | 跑通官方 baseline，搭好实验管理 |
| 7-8 月 | 冲刺期 | 单点优化，每两周一次全量验证 |
| 9 月 | 提交期 | 冻结方案，留 3 天做可复现性检查 |
| 10-12 月 | 决赛/报告 | 技术报告打磨，演讲排练 |

## 三个血泪教训

1. **实验管理从第一天开始**：混沌的实验记录会让冲刺期的每一次复现都变成赌博；
2. **别迷信单点技巧**：冠军方案多为「稳扎稳打 + 两处巧思」，而非十处取巧；
3. **技术报告与成绩同样重要**：报告写得好，决赛评委的印象分能救回名次。

> 谋定而后动，知止而有得。
`,
  },
  {
    slug: "hackathon-survival-48h", category: "hackathons", tags: "黑客松,生存,手册", cover: "/images/cover-hackathons.png", readMinutes: 7, daysAgo: 16,
    title: "48 小时黑客松生存手册：从踩坑到领奖",
    excerpt: "参加过十一场黑客松之后，我把反复验证有效的节奏表、工具清单与踩坑名录整理成了这本手册。",
    content: `## 黄金节奏表

**前 2 小时**：只做一件事——把 demo 的终帧画面写下来。没有终帧想象的团队，一定会在第 30 小时推倒重来。

**2-20 小时**：核心链路跑通。注意是「链路」不是「功能」：宁可三个功能都半生不熟，也要主链路一气呵成。

**20-36 小时**：补齐辅助功能 + 异常兜底。演示时最怕的不是功能少，而是当场报错。

**最后 6 小时**：冻结代码。只做两件事：造演示数据、排练讲稿。改代码的团队都在赌运气。

## 工具清单

- 部署：一个一键部署平台 + 一个备用域名；
- 演示数据：提前准备的种子脚本，一键灌入；
- 网络兜底：手机热点，永远常备。

## 踩坑名录

1. 现场装依赖（禁止）；
2. 演示账号没提前登录（尴尬）；
3. 把最炫的功能留在最后 10 分钟上线（等于赌命）。
`,
  },
  {
    slug: "llm-gateway-selfhost", category: "cloud-deals", tags: "网关,省钱,自建", cover: "/images/cover-cloud.png", readMinutes: 10, daysAgo: 11,
    title: "大模型网关自建指南：把 API 账单砍掉四成",
    excerpt: "多模型、多厂商、多计价规则，账单越看越糊涂。自建一层薄网关，省钱、可观测、随时切换，一箭三雕。",
    content: `## 网关的三重价值

1. **省钱**：请求级路由——简单问题走便宜模型，复杂任务走旗舰；缓存命中直接回历史结果；
2. **可观测**：每个请求的 token 数、延迟、失败率一目了然，账单再无惊吓；
3. **不锁定**：厂商涨价或停服，改一行配置即可切换。

## 最小可用架构

\`\`\`
业务应用 → 网关（路由/缓存/限流/日志）→ 多家模型 API
\`\`\`

开源方案里，LiteLLM 适合快速起步，OneAPI 适合团队共用；自研不超过 500 行也能覆盖八成需求。

## 省钱三板斧实测

- **语义缓存**：相似问题命中缓存，QPS 高的场景省 25%+；
- **分级路由**：分类器先判难度，八成流量降级到小模型；
- **输出长度控制**：system 里一句「回答精炼」，token 直降三成。

## 提醒

网关是单点，记得做降级：网关挂了要能直连厂商 API，别把自己锁死。
`,
  },
  {
    slug: "t-agent-memory-tradeoff", category: "t-agent", tags: "T-agent,记忆,设计笔记", cover: "/images/cover-tagent.png", readMinutes: 13, daysAgo: 2,
    title: "T-agent 设计笔记（三）：记忆的取舍之道",
    excerpt: "全记是灾难，全忘是失控。T-agent 的记忆分层设计：什么进上下文、什么入库、什么必须遗忘。附性能对比数据。",
    content: `## 一个反直觉的起点

给每个 Agent 配上完美记忆，协作成功率反而下降了 12%。原因：历史包袱让 Planner 变得保守，反复引用过时结论。

## 三层记忆设计

### 工作记忆（上下文内）
只保留当前任务的活跃状态：目标、待办、最近一次工具结果。**上限 2K token，超限即压缩。**

### 案例记忆（向量库）
已完成的任务以「目标-方案-结局」三元组入库。新任务先检索相似案例——像老中医翻病历。

### 教训记忆（规则表）
失败的教训沉淀为硬规则，注入 system。例如「工具 X 超时率高，调用必加兜底」。

## 取舍原则

1. **上下文是黄金地皮**：只放「现在进行时」；
2. **遗忘是功能不是缺陷**：每周批量清算低价值记忆；
3. **记忆归属要明确**：谁产生的记忆谁负责更新，避免多 Agent 抢写。

## 数据说话

三层设计上线后：任务完成率 +18%，平均 token 成本 -9%，Planner 的「犹豫步数」减半。

> 记忆的艺术，是遗忘的艺术。
`,
  },
];

// 笔谈种子留言（挂在指定 slug 的文章下）
const seedComments: Array<{ articleSlug: string; author: string; body: string; daysAgo: number }> = [
  {
    articleSlug: "t-agent-design-notes-01",
    author: "观澜",
    body: "「汇报才收敛」这条深有同感。上周把两个 Agent 改成一个写一个审，token 立省三成。",
    daysAgo: 2,
  },
  {
    articleSlug: "t-agent-design-notes-01",
    author: "青崖",
    body: "蹲一个（二），想看任务分解算法的细节。",
    daysAgo: 1,
  },
  {
    articleSlug: "rag-practice-guide",
    author: "苏合",
    body: "从 61% 到 92%，每次迭代都有明确的假设与验证，这份工程纪律比数字更值钱。",
    daysAgo: 3,
  },
  {
    articleSlug: "rag-practice-guide",
    author: "无名氏",
    body: "请问第十三次迭代会考虑 graph RAG 吗？",
    daysAgo: 1,
  },
  {
    articleSlug: "llm-intro-roadmap",
    author: "临江仙",
    body: "「在喧嚣中依然保有内心的秩序」，这一句值得抄在扉页。",
    daysAgo: 4,
  },
];

async function main() {
  console.log("开始灌入种子数据…");
  await db.insightRecord.deleteMany();
  await db.comment.deleteMany();
  await db.article.deleteMany();
  await db.category.deleteMany();

  for (const c of categories) {
    await db.category.create({ data: c });
  }
  console.log(`已创建 ${categories.length} 个栏目`);

  const now = Date.now();
  for (const a of articles) {
    const { daysAgo, ...rest } = a;
    await db.article.create({
      data: {
        ...rest,
        published: true,
        views: 80 + Math.floor(Math.random() * 900),
        likes: 3 + Math.floor(Math.random() * 90),
        publishedAt: new Date(now - daysAgo * 24 * 3600 * 1000),
      },
    });
  }
  console.log(`已创建 ${articles.length} 篇文章`);

  for (const c of seedComments) {
    const { daysAgo, ...rest } = c;
    await db.comment.create({
      data: {
        ...rest,
        createdAt: new Date(now - daysAgo * 24 * 3600 * 1000),
      },
    });
  }
  console.log(`已创建 ${seedComments.length} 条笔谈留言`);
  console.log("种子数据完成 ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
