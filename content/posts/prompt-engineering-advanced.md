---
title: "Prompt Engineering 进阶：从 Few-shot 到 Chain-of-Thought 的系统方法论"
date: 2026-07-11T16:00:00+08:00
draft: false
description: "系统梳理 Prompt Engineering 的核心技术路线：Zero-shot、Few-shot、Chain-of-Thought、Tree-of-Thought、ReAct，以及在实际工程中的应用模式和局限性分析。"
categories: ["tutorials"]
tags: ["教程", "Prompt", "Chain-of-Thought", "ReAct", "LLM"]
image: "covers/llm-basics.svg"
---

## 引言

Prompt Engineering 是 LLM 应用中最基础也最容易被低估的技术。多数开发者停留在"写清楚需求"的层面，但真正的 Prompt Engineering 是一门关于**如何引导模型推理**的工程学科。

本文系统梳理从 Zero-shot 到 ReAct 的技术演进路线，分析每种方法的适用场景、效果边界和工程实践中的陷阱。

## 一、Prompt 的基本范式

### 1.1 Zero-shot Prompting

最简单的形式：直接给模型一个任务描述，不提供示例。

```
请将以下英文翻译成中文：
"The quick brown fox jumps over the lazy dog."
```

**适用场景**：任务简单、模型能力足够强（GPT-4 级别）、不需要特定输出格式。

**局限**：对复杂任务的输出格式、推理路径缺乏控制。

### 1.2 Few-shot Prompting

提供几个输入-输出示例，让模型学习任务模式。

```
请将英文翻译成中文，保持翻译风格一致：

英文：Hello, how are you?
中文：你好，你怎么样？

英文：The weather is nice today.
中文：今天天气不错。

英文：The quick brown fox jumps over the lazy dog.
中文：
```

**关键发现**（Brown et al., 2020）：
- 示例数量与效果呈对数关系：3-5 个示例通常足够
- 示例质量比数量更重要：边界案例比普通案例更有价值
- 示例顺序影响结果：将最相似的示例放在最后效果更好

**工程陷阱**：
- 示例中的噪声会被放大：如果示例有错误，模型会学习错误模式
- 格式一致性至关重要：如果示例中用了 JSON 输出，模型也会尝试 JSON

### 1.3 Instruction Prompting

明确指定模型的行为规则。

```
你是一个专业的技术文档翻译员。请遵循以下规则：
1. 保持技术术语的英文原文，括号内附中文解释
2. 代码块不翻译
3. 保留原文的 Markdown 格式
4. 如果遇到不确定的术语，标注 [?]

请翻译以下内容：
...
```

**效果**：相比 Zero-shot，Instruction Prompting 在格式控制上提升 40-60%，在内容质量上提升 15-25%（根据 Anthropic 内部评测）。

## 二、推理增强 Prompting

### 2.1 Chain-of-Thought (CoT)

让模型在输出最终答案前，先展示推理过程。

**Zero-shot CoT**（Wei et al., 2022）：

```
请一步步思考，然后给出答案。

问题：一个商店有 15 个苹果，卖掉了 1/3，又进货 8 个，现在有多少个？
```

**Few-shot CoT**：

```
问题：Roger 有 5 个网球，他又买了 2 罐网球，每罐有 3 个。他现在有多少个？
推理：Roger 开始有 5 个球。2 罐各 3 个 = 6 个。5 + 6 = 11。
答案：11

问题：一个商店有 15 个苹果，卖掉了 1/3，又进货 8 个，现在有多少个？
推理：
```

**效果数据**（Google Research, 2022）：
- 在 GSM8K（数学推理）基准上，CoT 将 PaLM 540B 的准确率从 17.9% 提升到 58.1%
- 在多步推理任务上，CoT 平均提升 20-40%
- 对简单任务（如翻译）反而可能降低性能（增加噪声）

**适用边界**：
- 适用：数学推理、逻辑推理、多步决策、代码调试
- 不适用：翻译、摘要、情感分析等单步任务

### 2.2 Self-Consistency（Wang et al., 2022）

多次采样 CoT 路径，取多数投票的最终答案。

```
// 伪代码
for i in range(5):
    response = model.generate(prompt + "请一步步思考", temperature=0.7)
    answers.append(extract_answer(response))
final_answer = majority_vote(answers)
```

**效果**：在 CoT 基础上再提升 5-15%，但成本线性增加。

**工程权衡**：在成本敏感场景下，3 次采样 + 投票是性价比最优的选择。

### 2.3 Tree-of-Thought (ToT)（Yao et al., 2023）

将推理过程建模为树结构，支持回溯和分支。

```
请用以下步骤解决这个问题：
1. 生成 3 个可能的初始思路
2. 评估每个思路的可行性（1-10 分）
3. 选择最高分的思路，继续推理
4. 如果遇到死胡同，回溯到上一步选择次优思路
5. 最终给出答案
```

**适用场景**：创意写作、复杂规划、博弈策略。

**局限**：Token 消耗大（比 CoT 多 3-5 倍），不适合实时场景。

## 三、工具增强 Prompting

### 3.1 ReAct（Yao et al., 2022）

交替进行推理（Reasoning）和行动（Acting）。

```
问题：2026 年诺贝尔物理学奖得主是谁？

Thought: 我需要查找 2026 年诺贝尔物理学奖的信息，这超出了我的训练数据。
Action: search("2026 Nobel Prize Physics")
Observation: [搜索结果...]
Thought: 根据搜索结果，我找到了获奖者信息。
Answer: ...
```

**核心价值**：让模型能够使用外部工具（搜索、计算、数据库查询），突破训练数据的限制。

**工程实现**：
```python
def react_loop(question, tools, max_steps=5):
    prompt = build_react_prompt(question, tools)
    for step in range(max_steps):
        response = llm.generate(prompt)
        if response.has_action:
            result = execute_tool(response.action)
            prompt += f"\nObservation: {result}"
        else:
            return response.answer
    return "超过最大步数，未能得出结论"
```

### 3.2 ReWOO（Xu et al., 2023）

将规划和执行解耦：先生成完整计划，再批量执行工具调用。

**优势**：减少 LLM 调用次数（从 ReAct 的 N 次降到 2 次），降低成本和延迟。

**适用场景**：工具调用链较长、需要批量执行的场景。

## 四、结构化输出 Prompting

### 4.1 JSON Mode

```
请以 JSON 格式输出分析结果，包含以下字段：
{
  "sentiment": "positive" | "negative" | "neutral",
  "confidence": 0.0-1.0,
  "keywords": ["关键词1", "关键词2"],
  "summary": "一句话摘要"
}

文本：...
```

**工程建议**：
- 使用 OpenAI 的 `response_format: { type: "json_object" }` 参数强制 JSON 输出
- 在 prompt 中提供 JSON Schema 作为约束
- 对输出做 JSON 解析 + 类型校验，不要信任模型输出

### 4.2 XML Tag 分隔

Anthropic 推荐的结构化方式：

```
请将你的回答放在 <answer> 标签中，推理过程放在 <thinking> 标签中。

<thinking>
...
</thinking>

<answer>
...
</answer>
```

**优势**：比 JSON 更灵活，支持嵌套和混合内容。

## 五、Prompt 工程的系统性方法

### 5.1 Prompt 版本管理

```
# prompt_v1.txt
你是一个客服助手。请回答用户的问题。

# prompt_v2.txt  
你是一个专业的技术支持工程师。请用技术语言回答用户的问题，如果需要代码示例，请提供。

# prompt_v3.txt
你是一个技术支持工程师。请遵循以下规则：
1. 先确认问题类型（bug/feature/question）
2. 如果是 bug，要求用户提供复现步骤
3. 提供解决方案时附带代码示例
4. 结尾询问是否解决
```

**实践建议**：
- 使用 Git 管理 prompt 文件
- 每个 prompt 版本附带评测结果
- A/B 测试不同 prompt 版本的效果

### 5.2 Prompt 评测框架

```python
def evaluate_prompt(prompt_template, test_cases):
    results = []
    for case in test_cases:
        response = llm.generate(prompt_template.format(**case.input))
        score = case.evaluate(response)
        results.append(score)
    return {
        "avg_score": mean(results),
        "min_score": min(results),
        "pass_rate": sum(1 for s in results if s > threshold) / len(results)
    }
```

### 5.3 常见 Prompt 反模式

| 反模式 | 问题 | 改进 |
|--------|------|------|
| 指令过长 | 模型注意力分散，关键指令被忽略 | 分层指令：系统 prompt 放规则，用户 prompt 放任务 |
| 示例不一致 | 模型学习混乱的模式 | 确保示例格式、风格、质量一致 |
| 否定指令 | "不要做 X"效果差 | 改为肯定指令："请做 Y" |
| 模糊约束 | "回答要好" | 量化标准："回答长度 100-200 字，包含 3 个要点" |

## 六、Prompt Engineering 的局限

1. **不可复现性**：相同 prompt 在不同模型、不同温度下结果不同
2. **脆弱性**：微小的 prompt 改动可能导致输出大幅变化
3. **模型依赖**：针对 GPT-4 优化的 prompt 可能在 Claude 上效果差
4. **能力天花板**：Prompt Engineering 无法让模型做超出其能力范围的事

**正确的心态**：Prompt Engineering 是"引导"而非"创造"能力。它能释放模型已有的潜力，但不能赋予模型新的能力。

## 总结

| 方法 | 适用场景 | Token 成本 | 效果提升 |
|------|---------|-----------|---------|
| Zero-shot | 简单任务 | 低 | 基线 |
| Few-shot | 格式控制 | 中 | +15-25% |
| CoT | 多步推理 | 中 | +20-40% |
| Self-Consistency | 高精度需求 | 高 | +5-15% |
| ToT | 创意/规划 | 很高 | +10-30% |
| ReAct | 需要工具 | 中 | 突破性 |

Prompt Engineering 不是银弹，但它是 LLM 应用中最可控、最可优化的环节。掌握这些方法，能让你的 LLM 应用从"能用"变成"好用"。

> 参考文献：Brown et al. 2020 (GPT-3)、Wei et al. 2022 (CoT)、Wang et al. 2022 (Self-Consistency)、Yao et al. 2023 (ToT)、Yao et al. 2022 (ReAct)、Xu et al. 2023 (ReWOO)
