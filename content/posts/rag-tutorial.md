---
title: "RAG 实战：手把手搭建企业知识库问答系统"
date: 2026-06-10T14:30:00+08:00
draft: false
description: "用 LangChain + 向量数据库构建一个可落地的 RAG 系统。"
categories: ["tutorials"]
tags: ["RAG", "LangChain", "向量数据库"]
image: "covers/rag-system.svg"
cover:
  image: "covers/rag-system.svg"
  alt: "RAG 架构图"
  hidden: false
---

## RAG 是什么

RAG（Retrieval-Augmented Generation）= 检索 + 生成。让大模型在回答前先从知识库中检索相关片段，再基于这些片段生成答案，从而缓解幻觉并支持私域知识。

## 整体架构

```
用户问题 → 嵌入模型 → 向量检索 → Top-K 片段
                                ↓
                        提示词组装（Context + Question）
                                ↓
                          LLM 生成答案
```

## 关键模块

| 模块 | 选型建议 |
|------|---------|
| Embedding | BGE-M3、text-embedding-3-small |
| 向量库 | Milvus、Qdrant、Chroma、Pinecone |
| 文档解析 | Unstructured、LlamaParse |
| 重排序 | BGE-Reranker、Cohere Rerank |
| 切分策略 | 语义切分、父子段落检索 |

## 评估指标

- **上下文召回率（Context Recall）**
- **答案忠实度（Faithfulness）**
- **答案相关性（Answer Relevance）**

建议使用 RAGAS 框架做端到端评估。
