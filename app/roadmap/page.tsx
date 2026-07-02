import Link from 'next/link'
import { siteConfig } from '@/lib/site'

export const metadata = {
  title: 'AI 学习路线图',
  description: '从零基础到大模型实战的系统学习路径，覆盖 Python 基础、机器学习、深度学习、大模型微调、RAG、Agent 等核心方向。',
  alternates: { canonical: `${siteConfig.url}/roadmap` }
}

const stages = [
  {
    stage: '第一阶段',
    title: '编程与数学基础',
    seal: '基础',
    color: '#2e8b57',
    weeks: '4-8 周',
    items: [
      { topic: 'Python 基础', desc: '变量、函数、面向对象、装饰器、生成器、异常处理' },
      { topic: 'NumPy & Pandas', desc: '数组操作、数据清洗、DataFrame 常用方法' },
      { topic: '数学基础', desc: '线性代数（矩阵运算）、概率统计、微积分（梯度下降直觉）' },
      { topic: 'Git & 命令行', desc: '版本控制、分支管理、Linux 基本操作' },
    ],
    related: ['llm-prompt-engineering']
  },
  {
    stage: '第二阶段',
    title: '机器学习入门',
    seal: 'ML',
    color: '#b8860b',
    weeks: '6-10 周',
    items: [
      { topic: '经典算法', desc: '线性回归、逻辑回归、决策树、随机森林、SVM、KNN' },
      { topic: '模型评估', desc: '交叉验证、AUC-ROC、精确率/召回率、过拟合与正则化' },
      { topic: '特征工程', desc: '缺失值处理、编码、归一化、特征选择、降维（PCA）' },
      { topic: 'Scikit-learn 实战', desc: 'Pipeline、GridSearch、模型持久化' },
    ],
    related: ['ai-competitions-2026']
  },
  {
    stage: '第三阶段',
    title: '深度学习与 CV/NLP',
    seal: 'DL',
    color: '#c53d43',
    weeks: '8-12 周',
    items: [
      { topic: '神经网络基础', desc: '前馈网络、反向传播、激活函数、BatchNorm、Dropout' },
      { topic: 'CNN 与计算机视觉', desc: 'ResNet、目标检测（YOLO）、图像分割、迁移学习' },
      { topic: 'RNN/LSTM 与时序', desc: '序列建模、Attention 机制、Transformer 原理' },
      { topic: 'PyTorch 实战', desc: 'Dataset/DataLoader、自定义层、混合精度、多卡训练' },
    ],
    related: ['ai-major-guide-2026']
  },
  {
    stage: '第四阶段',
    title: '大模型与 Prompt 工程',
    seal: 'LLM',
    color: '#b8860b',
    weeks: '4-8 周',
    items: [
      { topic: 'Transformer 深入', desc: 'Self-Attention、Multi-Head、位置编码、KV Cache' },
      { topic: 'Prompt 工程', desc: 'Zero-shot、Few-shot、CoT、ReAct、系统提示词设计' },
      { topic: '主流大模型对比', desc: 'GPT-4o、Claude、Gemini、Qwen、DeepSeek、Kimi 等选型' },
      { topic: 'API 调用实战', desc: 'OpenAI/Anthropic/通义千问 SDK、Function Calling、流式输出' },
    ],
    related: ['llm-prompt-engineering']
  },
  {
    stage: '第五阶段',
    title: 'RAG 与向量数据库',
    seal: 'RAG',
    color: '#2e8b57',
    weeks: '4-6 周',
    items: [
      { topic: 'Embedding 原理', desc: '文本向量化、余弦相似度、语义搜索' },
      { topic: '向量数据库', desc: 'FAISS、Milvus、Pinecone、Weaviate、Chroma 选型与部署' },
      { topic: 'RAG Pipeline', desc: '文档解析→分块→Embedding→检索→重排→生成' },
      { topic: '进阶优化', desc: 'HyDE、多路召回、父子文档、Self-RAG、GraphRAG' },
    ],
    related: ['rag-agent-trend-2026']
  },
  {
    stage: '第六阶段',
    title: 'Agent 与多智能体',
    seal: 'Agent',
    color: '#c53d43',
    weeks: '4-8 周',
    items: [
      { topic: 'Agent 框架', desc: 'LangChain、LlamaIndex、AutoGen、CrewAI、Dify' },
      { topic: '工具调用', desc: 'Function Calling、MCP 协议、工具注册与调度' },
      { topic: '记忆与规划', desc: '短期记忆、长期记忆、任务分解、ReAct/Plan-and-Execute' },
      { topic: '多智能体协作', desc: '角色分工、通信协议、人机协同、T-agent 框架' },
    ],
    related: ['t-agent-architecture', 'rag-agent-trend-2026']
  },
  {
    stage: '第七阶段',
    title: '微调与部署实战',
    seal: '部署',
    color: '#b8860b',
    weeks: '4-8 周',
    items: [
      { topic: '模型微调', desc: 'LoRA、QLoRA、SFT、RLHF、DPO、数据集构建' },
      { topic: '推理优化', desc: '量化（GPTQ/AWQ/GGUF）、vLLM、TGI、TensorRT-LLM' },
      { topic: '部署上线', desc: 'Docker 容器化、FastAPI、K8s 编排、GPU 服务器选型' },
      { topic: '竞赛实战', desc: 'Kaggle 入门、比赛策略、特征工程与模型集成' },
    ],
    related: ['free-gpu-resources', 'hackathon-winning-tips']
  }
]

export default function RoadmapPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* 头部 */}
      <div className="mb-10 text-center">
        <span className="seal text-lg px-4 py-2 mb-4 inline-block">路线</span>
        <h1 className="font-serif text-3xl font-bold text-ink-900 dark:text-ink-100 mb-3">
          AI 学习路线图
        </h1>
        <p className="text-ink-500 dark:text-ink-600 max-w-xl mx-auto text-sm">
          从零基础到大模型实战的系统学习路径，7 个阶段逐层递进。每个阶段标注预计学习时长和核心知识点，附相关文章推荐。
        </p>
      </div>

      <div className="bamboo-divider mb-10" />

      {/* 时间轴 */}
      <div className="relative border-l-2 border-ink-200/30 pl-6 dark:border-ink-800/30 sm:pl-8">
        {stages.map((s, i) => (
          <div key={s.stage} className="relative mb-10 last:mb-0">
            {/* 时间轴节点 */}
            <span
              className="absolute -left-[13px] top-6 h-6 w-6 rounded-full border-2 bg-rice text-center text-[10px] font-bold leading-5 dark:bg-ink-950"
              style={{ borderColor: s.color, color: s.color }}
            >
              {i + 1}
            </span>

            {/* 阶段卡片 */}
            <div className="card p-5">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span
                  className="seal text-[10px] px-1.5 py-0.5"
                  style={{ borderColor: s.color, color: s.color }}
                >
                  {s.seal}
                </span>
                <h2 className="font-serif text-lg font-bold text-ink-900 dark:text-ink-100">
                  {s.stage}：{s.title}
                </h2>
                <span className="ml-auto rounded-full border border-ink-200/30 px-2.5 py-0.5 text-[11px] text-ink-500 dark:border-ink-800/30 dark:text-ink-600">
                  {s.weeks}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {s.items.map((item) => (
                  <div key={item.topic} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: s.color }} />
                    <div>
                      <span className="text-sm font-medium text-ink-800 dark:text-ink-200">{item.topic}</span>
                      <p className="text-xs text-ink-500 dark:text-ink-600 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {s.related.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-[11px] text-ink-400 dark:text-ink-600">相关文章：</span>
                  {s.related.map((id) => (
                    <Link
                      key={id}
                      href={`/blog/${id}`}
                      className="text-[11px] text-vermilion hover:underline"
                    >
                      {id}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bamboo-divider mt-12 mb-8" />

      {/* 底部提示 */}
      <div className="text-center">
        <p className="text-xs text-ink-400 dark:text-ink-600 mb-4">
          路线图仅供参考，建议根据个人基础和目标灵活调整。每个阶段不必完全掌握再进入下一阶段，螺旋式学习效率更高。
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/blog" className="text-sm text-vermilion hover:underline">
            查看全部文章 →
          </Link>
          <Link href="/about" className="text-sm text-ink-500 hover:text-vermilion dark:text-ink-600">
            关于我们
          </Link>
        </div>
      </div>
    </div>
  )
}
