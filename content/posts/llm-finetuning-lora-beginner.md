---
title: "大模型微调入门：用 LoRA 从零微调你的第一个模型"
date: 2026-08-17T09:00:00+08:00
draft: false
description: "从数据准备、LoRA 原理到训练与评测，用一次可复现的实战带你把大模型微调从概念变成可运行的流水线。"
categories: ["tutorials"]
tags: ["教程", "微调", "LoRA", "大模型", "训练", "SFT"]
image: "covers/llm-basics.svg"
---

## 什么时候真的需要微调

很多人问的第一个问题是：Prompt 都写不出来的效果，微调能解决吗？答案取决于问题的性质。

**能用提示词工程解决的，不要微调。** 提示词、检索增强（RAG）、工具调用和模型路由这四件事，可以覆盖大部分业务需求，成本低、迭代快、风险小。

但有几类问题，提示词确实无能为力：

- **格式强约束**：要求模型始终输出严格的 JSON 结构、固定字段、特定术语，提示词反复翻车
- **领域语言**：医疗、法律、金融等专业术语密集的场景，模型"听得懂大概"但"说不对细节"
- **稳定风格**：企业客服、文案风格要求高度一致，靠提示词难以稳定复现
- **私有数据**：数据本身涉及合规，不能把内容塞进每次对话的上下文里

如果你命中以上任意一条，且已经积累了几百到几千条高质量问答数据，微调是值得考虑的下一步。

## 为什么是 LoRA

全参数微调（Full Fine-tuning）会更新模型的全部权重，动辄需要几张 A100，一次训练成本可能就是几十万元级，而且每次都要保存一份完整的模型副本。

LoRA（Low-Rank Adaptation）的思路完全不同：**冻结原始权重，只训练两个低秩矩阵**。

```
原始权重 W（冻结，不更新）
  ↓
新增 A 矩阵（r 维，训练）
  ↓
新增 B 矩阵（r 维，训练）
  ↓
前向计算：h = Wx + BAx
```

假设模型隐藏层维度是 4096，LoRA 的秩 r 取 8，那么新增参数量是 4096×8×2 = 65,536，不到原权重 4096×4096 ≈ 1677 万的 0.4%。你只需保存这份"增量补丁"，几 MB 到几十 MB，部署时挂回基础模型即可。

这也是 LoRA 成为 2026 年个人开发者和小团队微调标配的原因：一张消费级显卡就能跑，数据量需求低，迭代成本可控。

## 第一步：准备数据

微调不是"把语料丢进去"，而是**构造输入输出对**。质量远比数量重要，1000 条高质量数据往往比 10000 条灌水数据效果好。

对大多数应用，推荐使用对话格式：

```json
[
  {
    "conversations": [
      {
        "role": "system",
        "content": "你是智能客服小墨，回答要求简洁准确，涉及退款问题时主动给出流程说明。"
      },
      {
        "role": "human",
        "content": "我昨天买的耳机一只不响了，能退吗？"
      },
      {
        "role": "assistant",
        "content": "可以的。您可以在订单页申请 7 天无理由退货，退回运费由我们承担。需要我帮您生成退货单吗？"
      }
    ]
  }
]
```

数据来源可以是：客服工单脱敏、人工编写的小样本、把已有高质量回复清洗成对。**一定要做脱敏**，敏感信息不进入训练集。

### 数据量级参考

- **几百条**：风格迁移、格式约束，效果立竿见影
- **几千条**：领域能力初步建立，推荐起点
- **几万条**：任务能力明显提升，进入数据迭代优化阶段

### 数据质检清单

1. 输入输出是否有明确的对应关系
2. 是否有重复、矛盾、过时的样本
3. 回答是否包含了我们希望模型"学会"的范式
4. 覆盖是否均匀，有没有某个场景占 90% 以上

## 第二步：选基座模型

原则：**先用小的，跑通再换大的**。

- 入门实验：7B 级模型，消费级显卡即可训练
- 效果优先：13B~70B，需要多卡或租用云 GPU
- 成本敏感：量化版 + LoRA 组合，一张 4090 也能训练 13B

选择基座时看两个指标：通用能力是否合格（这是底子），以及同领域任务上是否有社区验证。

## 第三步：配置训练脚本

以 Hugging Face 生态为例，核心依赖是 `transformers`、`peft`、`datasets` 和 `trl`：

```python
from datasets import load_dataset
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer, SFTConfig

model_name = "Qwen/Qwen2.5-7B-Instruct"
dataset = load_dataset("json", data_files="data/train.jsonl")

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    device_map="auto",
    torch_dtype="auto",
)
tokenizer = AutoTokenizer.from_pretrained(model_name)

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)

model = get_peft_model(model, lora_config)

train_config = SFTConfig(
    output_dir="./qwen-lora",
    per_device_train_batch_size=1,
    gradient_accumulation_steps=16,
    learning_rate=2e-4,
    num_train_epochs=3,
    logging_steps=10,
    save_steps=200,
    max_seq_length=2048,
    packing=True,
)

trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    tokenizer=tokenizer,
    args=train_config,
)
trainer.train()
```

几个关键参数的含义：

- **r（秩）**：16 是常用起点，数据量小用 8，任务复杂可试 32。越大表达能力越强，但过拟合风险也越高
- **lora_alpha**：一般设为 r 的两倍（32），控制 LoRA 分支的权重
- **target_modules**：对 LLM 通常覆盖全部 attention 和 MLP 的投影层
- **学习率**：LoRA 通常用 1e-4 ~ 3e-4，比全参微调高一个数量级

## 第四步：训练中的观察点

训练日志里的 `loss` 下降趋势值得关注，但**不要被单一指标绑架**。更重要的信号是：

1. 训练集 loss 是否在稳步下降（欠拟合信号：几乎不降）
2. 验证集 loss 与训练集差距是否过大（过拟合信号）
3. 早期 checkpoint 在几个"困难样本"上的表现

跑 1 个 epoch 就保存一个 checkpoint，方便后面比较"训练到什么程度最好"。

## 第五步：评测，微调的真正分水岭

训练完成的瞬间，真正的工程才开始。评测要做两件事：

**自动化评测**：准备一组不参与训练的测试题，用脚本批量调用模型，对比输出与参考答案。

**人工抽检**：随机抽 50~100 条输出，逐个看质量。重点看：格式是否符合要求、专业术语是否准确、有没有幻觉、风格是否稳定。

一个实用的做法是**对比评测**：把微调前的基座模型和微调后的模型放在同一批问题上，让人工标注者二选一，看微调版本赢得比例。如果赢的比例不显著，说明数据或训练设置有问题，需要回到数据迭代。

## 常见翻车点

| 现象 | 可能原因 |
| --- | --- |
| 训练 loss 降到很低但输出空洞 | 过拟合训练集，或数据本身缺少多样性 |
| 微调后通用能力下降 | 学习率过高、训练轮次过多、数据重复度过高 |
| 输出格式仍不对 | 数据里格式样本不够，或 max_seq_length 截断了格式模板 |
| 微调后还不如原来 | 基座选错、数据质量问题，先小批量验证再扩大 |

## 成本参考

一张 24GB 显存的消费级显卡，用 LoRA 训练 7B 模型，3 个 epoch、几千条数据，通常几小时到十几小时可完成。租用云 GPU 按小时计费，一次完整实验的成本大致在几十到几百元区间——这比全参微调动辄上万的成本低两个数量级。

## 总结

LoRA 微调是一条"用可控成本把模型调成自己的样子"的路径。完整流程可以压缩成一句话：**准备好高质量数据，选对基座，用 LoRA 训练，用对比评测验证**。

建议从一个小任务开始：挑一个你手头有数据的真实场景，用几百条数据跑通全流程，再逐步扩充数据、调整参数。先让流水线转起来，比追求参数最优重要得多。

> 推荐阅读：Hugging Face PEFT 文档、SFTTrainer 教程，以及本博客的「RAG 实战」系列了解替代方案。
