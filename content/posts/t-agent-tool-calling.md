---
title: "T-agent 工具调用实战：让 Agent 学会使用外部工具"
date: 2026-07-03T13:00:00+08:00
draft: false
description: "工具调用是 Agent 的核心能力。本文通过实战案例，演示如何让 T-agent 调用搜索、数据库和 API 等外部工具。"
categories: ["t-agent"]
tags: ["T-agent", "工具调用", "MCP", "Function Calling", "Agent"]
image: "covers/t-agent-architecture.svg"
---

## 工具调用的本质

Agent 和聊天机器人的区别在于：Agent 能做事，聊天机器人只能说话。

"做事"的具体含义就是**调用工具**——搜索网页、查询数据库、读写文件、调用第三方 API、操作浏览器。模型负责决定"调用什么工具"和"传什么参数"，你的代码负责实际执行。

## 工具调用的三种模式

### 模式一：Function Calling

最基础的模式。你在请求中定义工具的 JSON Schema，模型返回调用指令。

```
用户: "帮我查一下北京今天限行几号"
  ↓
模型返回: tool_call(get_traffic_limit, {city: "北京"})
  ↓
你的代码执行: 调用限行查询 API → 返回结果
  ↓
模型回复: "今天限行尾号 3 和 8"
```

优点：简单直接，所有主流模型都支持。
缺点：工具定义在每次请求中重复发送，token 消耗大。

### 模式二：MCP（Model Context Protocol）

Anthropic 提出的协议，把工具定义从请求中分离出来，变成独立的 MCP Server。

```
MCP Server（工具提供方）
  ├── 搜索工具 server
  ├── 数据库 server
  └── 文件系统 server

Agent（工具使用方）
  └── 通过 MCP 协议连接所有 server
```

优点：工具可复用、可共享、可热插拔。
缺点：需要额外的 server 进程。

### 模式三：Skills（技能沉淀）

把成功的工具调用序列沉淀为可复用的 Skill，下次遇到类似任务直接调用。

```
首次：用户 → "分析这个 CSV" → Agent 调用 pandas → 生成图表 → 成功
沉淀：把"读取 CSV → 分析统计 → 生成图表"存为 Skill
后续：用户 → "分析这个数据" → Agent 直接调用 Skill
```

优点：减少重复推理，提升速度和一致性。
缺点：需要设计 Skill 的存储和检索机制。

## 实战：给 T-agent 添加搜索工具

### 1. 定义工具

```python
tools = [{
    "type": "function",
    "function": {
        "name": "web_search",
        "description": "搜索互联网获取最新信息",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "搜索关键词"
                }
            },
            "required": ["query"]
        }
    }
}]
```

### 2. 实现执行器

```python
import requests

def web_search(query: str) -> str:
    response = requests.get(
        "https://api.search.com/search",
        params={"q": query, "limit": 5}
    )
    results = response.json()["results"]
    return "\n".join([f"- {r['title']}: {r['snippet']}" for r in results])
```

### 3. 接入 Agent 循环

```python
def agent_loop(user_input, tools, executor):
    messages = [{"role": "user", "content": user_input}]
    while True:
        response = llm.chat(messages, tools=tools)
        if response.tool_calls:
            for call in response.tool_calls:
                result = executor(call.function.name, call.function.arguments)
                messages.append({"role": "tool", "tool_call_id": call.id, "content": result})
        else:
            return response.content
```

## 常见坑

- **工具描述不清**：模型会根据描述决定是否调用，描述模糊会导致误调用或不调用
- **参数类型错误**：模型生成的参数可能类型不对，需要做校验
- **工具返回格式**：返回内容太长会浪费 token，太短会丢失信息
- **循环调用**：模型可能反复调用同一个工具，需要设置最大循环次数

## 进阶方向

- **多工具组合**：搜索 → 读取 → 分析 → 写入，一个任务串联多个工具
- **工具选择策略**：给 Agent 20+ 个工具时，如何让它选对工具
- **错误处理**：工具调用失败时，Agent 应该怎么重试或回退
- **安全控制**：哪些工具需要人工审批，哪些可以自动执行

> 推荐阅读：MCP 协议官方文档、OpenAI Function Calling 指南、本博客 T-agent 栏目其他文章。
