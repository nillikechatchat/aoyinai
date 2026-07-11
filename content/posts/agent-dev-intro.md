---
title: "AI Agent 开发入门：从第一个工具调用到多步推理"
date: 2026-07-11T10:00:00+08:00
draft: false
description: "Agent 是 2026 年 AI 应用的核心范式。本文从零开始，带你理解 Agent 的本质、核心组件和第一个可运行的 Agent。"
categories: ["tutorials"]
tags: ["教程", "Agent", "Function Calling", "LangChain", "工具调用"]
image: "covers/llm-basics.svg"
---

## Agent 不是聊天机器人

很多人对 Agent 的理解停留在"更智能的聊天机器人"。这个理解方向对了，但差了一个关键维度：**行动能力**。

聊天机器人只能回复文字。Agent 能调用工具、读写文件、访问数据库、操作浏览器、发起 API 请求——它不只是"想"，还能"做"。

这个差异来自一个核心机制：**Function Calling（函数调用）**。

## Function Calling：Agent 的手脚

传统 LLM 的流程是：用户输入 → 模型生成文本 → 输出。

Agent 的流程是：用户输入 → 模型判断是否需要调用工具 → 如果需要，生成工具调用指令 → 执行工具 → 将结果返回模型 → 模型生成最终回复。

```
用户: "今天北京天气怎么样？"
  ↓
模型判断: 需要调用 get_weather("北京")
  ↓
工具执行: 返回 {"temp": 28, "condition": "晴"}
  ↓
模型回复: "北京今天晴，28°C，适合出行。"
```

关键在于：模型**决定**调用什么工具、传什么参数，但**不执行**工具。执行是你的代码做的。这就是"手脚"的含义——模型是大脑，工具是手脚。

## 核心组件

一个最小可运行的 Agent 需要三样东西：

### 1. 工具定义（Tools）

用 JSON Schema 描述你的工具能做什么、接受什么参数：

```json
{
  "name": "get_weather",
  "description": "查询指定城市的天气",
  "parameters": {
    "type": "object",
    "properties": {
      "city": { "type": "string", "description": "城市名称" }
    },
    "required": ["city"]
  }
}
```

### 2. 工具执行器（Tool Executor）

实际调用天气 API、数据库查询、文件操作的代码：

```python
def get_weather(city: str) -> dict:
    response = requests.get(f"https://api.weather.com/{city}")
    return response.json()
```

### 3. 推理循环（Agent Loop）

Agent 的核心是一个 while 循环：调用模型 → 检查是否需要工具 → 执行工具 → 再次调用模型，直到模型认为可以给出最终回复。

```python
while True:
    response = llm.chat(messages, tools=tools)
    if response.has_tool_calls():
        for call in response.tool_calls:
            result = execute_tool(call.name, call.arguments)
            messages.append(tool_result(result))
    else:
        return response.content
```

## 第一个 Agent：30 行代码

用 OpenAI API 写一个最简单的 Agent：

```python
import json, openai

tools = [{
    "type": "function",
    "function": {
        "name": "calculate",
        "description": "计算数学表达式",
        "parameters": {
            "type": "object",
            "properties": {"expr": {"type": "string"}},
            "required": ["expr"]
        }
    }
}]

def calculate(expr): return str(eval(expr))

messages = [{"role": "user", "content": "123 * 456 + 789 等于多少？"}]

while True:
    r = openai.chat.completions.create(
        model="gpt-4o", messages=messages, tools=tools
    )
    msg = r.choices[0].message
    if msg.tool_calls:
        for tc in msg.tool_calls:
            result = calculate(json.loads(tc.function.arguments)["expr"])
            messages.append(msg)
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": result})
    else:
        print(msg.content)
        break
```

## 进阶方向

掌握了基础后，可以往这些方向探索：

- **多工具组合**：让 Agent 同时拥有搜索、计算、文件操作等多个工具
- **记忆系统**：短期记忆（对话上下文）+ 长期记忆（向量数据库）
- **规划能力**：让 Agent 先制定计划再逐步执行（Plan-and-Execute）
- **多 Agent 协作**：多个 Agent 分工合作，各司其职

Agent 是 LLM 应用的下一个范式。理解了 Function Calling 和推理循环，你就理解了 80% 的 Agent 原理。

> 推荐阅读：LangChain 文档、OpenAI Function Calling 指南、本博客 T-agent 栏目。
