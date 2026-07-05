---
title: "RAG 实战：从零搭建一个文档问答系统"
date: 2026-07-03T14:00:00+08:00
draft: false
description: "RAG（检索增强生成）是 LLM 应用最广泛的架构。本文用 Python 从零搭建一个能回答私有文档问题的系统。"
categories: ["tutorials"]
tags: ["教程", "RAG", "向量数据库", "Embedding", "LangChain"]
image: "covers/llm-basics.svg"
---

## 为什么需要 RAG

LLM 的知识是训练时学到的，它不知道你公司的内部文档、你昨天写的笔记、你刚发布的文章。直接问它"我们公司的请假流程是什么"，它只能回答"我不知道"。

RAG（Retrieval-Augmented Generation）的思路是：**先从你的文档中检索相关内容，再把检索结果作为上下文交给 LLM 生成回答。**

```
用户提问 → 检索相关文档片段 → 拼接成 prompt → LLM 生成回答
```

## 核心流程

### 1. 文档处理

把文档切分成小块（chunk），每块通常 200-500 字：

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50  # 相邻块重叠 50 字，避免语义断裂
)
chunks = splitter.split_documents(documents)
```

### 2. 向量化

把每个文本块转成向量（embedding），存入向量数据库：

```python
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_documents(chunks, embeddings)
```

### 3. 检索

用户提问时，把问题也转成向量，在数据库中找最相似的文本块：

```python
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
relevant_docs = retriever.invoke("请假流程是什么？")
```

### 4. 生成

把检索到的文本块拼进 prompt，让 LLM 基于这些内容回答：

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("""
基于以下上下文回答问题。如果上下文中没有相关信息，请说"我不知道"。

上下文：
{context}

问题：{question}
""")

chain = prompt | ChatOpenAI(model="gpt-4o")
answer = chain.invoke({"context": relevant_docs, "question": "请假流程是什么？"})
```

## 完整代码（50 行）

```python
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.document_loaders import DirectoryLoader

# 1. 加载文档
loader = DirectoryLoader("./docs", glob="**/*.md")
documents = loader.load()

# 2. 切分
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(documents)

# 3. 向量化并存储
vectorstore = FAISS.from_documents(chunks, OpenAIEmbeddings())

# 4. 检索 + 生成
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
prompt = ChatPromptTemplate.from_template(
    "基于以下上下文回答问题。\n\n上下文：{context}\n\n问题：{question}"
)
chain = {"context": retriever, "question": lambda x: x} | prompt | ChatOpenAI()

# 5. 提问
print(chain.invoke("请假流程是什么？").content)
```

## 优化方向

- **分块策略**：按段落、按标题、按语义分块，比固定长度分块效果好
- **重排序**：检索后用 reranker 重新排序，提高相关性
- **混合检索**：向量检索 + 关键词检索，互补短板
- **多轮对话**：把历史对话也纳入上下文

> 推荐阅读：LangChain RAG 教程、FAISS 文档、本博客 RAG 教程系列。
