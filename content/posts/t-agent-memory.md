---
title: "T-agent 记忆系统设计：让 Agent 记住你说过的每一句话"
date: 2026-07-07T17:00:00+08:00
draft: false
description: "长期记忆是 Agent 从'一次性对话'进化为'持续陪伴'的关键。本文探讨 T-agent 的记忆系统架构设计。"
categories: ["t-agent"]
tags: ["T-agent", "记忆", "向量数据库", "RAG", "Agent"]
image: "covers/t-agent-architecture.svg"
---

## 为什么 Agent 需要记忆

没有记忆的 Agent 是一个金鱼——每次对话都是从零开始。你告诉它你的项目背景、技术栈、代码风格，下次对话它全忘了。

记忆系统让 Agent 能够：
- **记住你的偏好**：你喜欢函数式编程、用 pnpm 不用 npm
- **积累项目知识**：知道项目的架构、已解决的问题、已知的坑
- **学习经验**：把成功的操作模式沉淀下来，下次直接复用

## 记忆的三种类型

### 1. 短期记忆（Working Memory）

当前对话的上下文。对话结束后丢弃。

```
用户: "帮我改一下这个函数"
Agent: [记住当前文件内容、用户的修改意图]
用户: "再加一个参数"
Agent: [知道"这个函数"指的是哪个]
```

实现：直接放在 LLM 的 messages 数组里。

### 2. 长期记忆（Long-term Memory）

跨对话的持久化记忆。对话结束后保留。

```
对话 1: 用户说"我用 Next.js 14，App Router"
对话 2: Agent 自动生成 App Router 风格的代码，不用用户再提醒
```

实现：存入向量数据库，每次对话前检索相关记忆。

### 3. 程序性记忆（Procedural Memory）

把成功的操作序列沉淀为可复用的 Skill。

```
首次: 用户说"部署到 Vercel" → Agent 执行了 10 步操作 → 成功
沉淀: 存为 "deploy-to-vercel" Skill
后续: 用户说"部署" → Agent 直接调用 Skill，不用重新推理
```

实现：把成功的工具调用序列序列化存储，下次直接加载执行。

## 长期记忆的实现

### 存储结构

```python
memory = {
    "id": "mem_001",
    "content": "用户使用 Next.js 14 App Router，偏好 TypeScript",
    "metadata": {
        "type": "preference",
        "source": "conversation_20260701",
        "importance": 0.8
    },
    "embedding": [0.1, 0.2, ...]  # 向量
}
```

### 存储流程

```
对话结束 → 提取关键信息 → 生成 embedding → 存入向量数据库
```

### 检索流程

```
新对话开始 → 用户输入 → 生成 embedding → 检索相关记忆 → 注入 system prompt
```

### 代码示例

```python
class MemorySystem:
    def __init__(self):
        self.vectorstore = FAISS.load_local("memory_index")
    
    def remember(self, content: str, metadata: dict):
        embedding = get_embedding(content)
        self.vectorstore.add(content, embedding, metadata)
    
    def recall(self, query: str, k: int = 5) -> list:
        embedding = get_embedding(query)
        return self.vectorstore.search(embedding, k=k)
    
    def inject_into_prompt(self, query: str) -> str:
        memories = self.recall(query)
        if not memories:
            return ""
        return "相关记忆：\n" + "\n".join([m.content for m in memories])
```

## 记忆的挑战

### 1. 信息提取

对话内容很多，哪些值得记住？需要一个"记忆过滤器"：

- 用户的偏好（"我喜欢..."、"不要..."）
- 项目的关键信息（"数据库用 PostgreSQL"）
- 错误和解决方案（"这个 bug 是因为..."）

### 2. 记忆冲突

用户说"我用 Next.js"，后来又说"我改用 Nuxt 了"。记忆系统需要处理这种冲突——新信息覆盖旧信息。

### 3. 记忆衰减

不是所有记忆都同等重要。时间久远的记忆应该衰减，高频使用的记忆应该强化。

### 4. 隐私安全

记忆里可能包含敏感信息（密码、API Key、个人数据）。需要有机制过滤和保护。

## 设计建议

1. **分层存储**：短期记忆用 messages，长期记忆用向量数据库，Skill 用文件系统
2. **自动提取**：对话结束后自动提取关键信息，不需要用户手动"保存"
3. **记忆检索**：每次对话前检索最相关的 5-10 条记忆，不要全部注入
4. **记忆更新**：定期清理过期记忆，合并重复记忆
5. **用户控制**：让用户可以查看、编辑、删除记忆

> 推荐阅读：Hermes Agent 记忆系统文档、LangChain Memory 模块、本博客 T-agent 栏目。
