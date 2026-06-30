---
title: "大模型入门：从零认识 GPT 与 Transformer"
date: 2026-06-15T10:00:00+08:00
draft: false
description: "用最通俗的方式讲清楚大语言模型的工作原理。"
categories: ["tutorials"]
tags: ["LLM", "Transformer", "入门"]
image: "covers/llm-basics.svg"
cover:
  image: "covers/llm-basics.svg"
  alt: "Transformer 架构图"
  hidden: false
---

## 什么是大语言模型

大语言模型（LLM）是一类基于 Transformer 架构的深度学习模型，通过在海量文本数据上进行预训练，学习语言的统计规律与世界知识。代表产品包括 GPT-4、Claude、Gemini、Llama、通义千问、文心一言等。

## Transformer 三件套

1. **自注意力（Self-Attention）**：让模型在处理每个词时关注句子中的所有词。
2. **多头注意力（Multi-Head）**：并行多个注意力头捕捉不同类型的关联。
3. **位置编码（Positional Encoding）**：为序列注入位置信息。

## 一次推理的流程

```python
from transformers import AutoTokenizer, AutoModelForCausalLM

model_id = "Qwen/Qwen2.5-0.5B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id, device_map="auto")

prompt = "请用一句话介绍大语言模型。"
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
output = model.generate(**inputs, max_new_tokens=64, do_sample=True, temperature=0.7)
print(tokenizer.decode(output[0], skip_special_tokens=True))
```

## 下一步学习路径

- 提示工程（Prompt Engineering）基础
- RAG 检索增强生成
- Agent 工具调用与 Function Calling
- LoRA / QLoRA 微调实战

> 推荐阅读：《Hands-On Large Language Models》与 Hugging Face 官方课程。
