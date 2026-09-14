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
];

async function main() {
  console.log("开始灌入种子数据…");
  await db.insightRecord.deleteMany();
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
        publishedAt: new Date(now - daysAgo * 24 * 3600 * 1000),
      },
    });
  }
  console.log(`已创建 ${articles.length} 篇文章`);
  console.log("种子数据完成 ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
