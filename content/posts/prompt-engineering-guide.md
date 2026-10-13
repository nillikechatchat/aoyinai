---
title: "Prompt Engineering 入门：如何写出高质量的提示词"
date: 2026-07-02T10:00:00+08:00
draft: false
description: "系统讲解 Prompt Engineering 的核心技巧，从基础原则到高级模式，帮助你更好地使用大语言模型。"
categories: ["tutorials"]
tags: ["Prompt", "LLM", "入门", "教程"]
image: "covers/prompt-engineering.svg"
cover:
  image: "covers/prompt-engineering.svg"
  alt: "Prompt Engineering"
  hidden: false
---

## 什么是 Prompt Engineering

Prompt Engineering（提示词工程）是设计和优化输入给大语言模型的文本，以获得更准确、更有用输出的技术。它不仅仅是"问问题"，而是一门系统性的工程实践。

## 核心原则

### 1. 明确性原则

**差的提示词**：
```
帮我写个程序
```

**好的提示词**：
```
请用 Python 写一个函数，功能是：
1. 输入：一个整数列表
2. 输出：列表中所有偶数的平方和
3. 要求：包含类型注解和docstring
```

### 2. 结构化原则

使用清晰的结构组织你的提示词：

```
## 任务
请帮我分析这段代码的性能问题

## 代码
```python
def find_duplicates(lst):
    duplicates = []
    for i in range(len(lst)):
        for j in range(i+1, len(lst)):
            if lst[i] == lst[j] and lst[i] not in duplicates:
                duplicates.append(lst[i])
    return duplicates
```

## 要求
1. 指出时间复杂度
2. 提供优化方案
3. 给出优化后的代码
```

### 3. 示例驱动原则（Few-shot）

通过提供示例来引导模型：

```
请将以下句子转换为正式商务语气：

输入：这个方案不太行，得改改
输出：该方案尚有优化空间，建议进行调整

输入：客户说价格太贵了
输出：客户反馈预算方面存在顾虑

输入：这个bug赶紧修一下
输出：请优先处理此缺陷问题
```

## 高级技巧

### 角色设定

```
你是一位资深的 Python 架构师，擅长设计可扩展的系统架构。
请根据以下需求，设计一个用户认证系统的架构...
```

### 思维链（Chain of Thought）

引导模型逐步思考：

```
请逐步分析以下问题：
1. 首先，理解问题的核心需求
2. 然后，列出可能的解决方案
3. 接着，评估每个方案的优缺点
4. 最后，给出推荐方案及理由

问题是：如何设计一个高并发的秒杀系统？
```

### 输出格式控制

```
请以 JSON 格式返回以下信息：
{
  "name": "项目名称",
  "description": "简短描述",
  "tech_stack": ["技术1", "技术2"],
  "difficulty": "easy/medium/hard"
}
```

## 常见错误

### 1. 提示词过短
```
# 错误
写个爬虫

# 正确
请用 Python + requests + BeautifulSoup 写一个爬虫，功能是：
1. 目标网站：https://example.com/news
2. 抓取内容：新闻标题、发布时间、摘要
3. 输出格式：CSV文件
4. 包含异常处理和重试机制
```

### 2. 缺乏约束
```
# 错误
帮我优化这段代码

# 正确
请优化这段代码，要求：
1. 时间复杂度从 O(n²) 降到 O(n log n)
2. 保持代码可读性
3. 添加必要的注释
4. 不使用额外的库
```

### 3. 忽略上下文
```
# 错误
这个函数有bug吗？

# 正确
这是一个用户注册函数，预期行为是：
1. 验证邮箱格式
2. 检查密码强度
3. 创建用户记录
4. 发送验证邮件

请检查是否有逻辑错误或安全漏洞：
[代码]
```

## 实战案例

### 案例1：代码审查

```
你是一位代码审查专家。请审查以下代码，关注：
1. 代码规范（PEP 8）
2. 潜在bug
3. 性能问题
4. 安全漏洞
5. 可读性改进建议

```python
def process_data(data):
    result = []
    for i in range(len(data)):
        if data[i] != None:
            if data[i]['status'] == 'active':
                if data[i]['score'] > 60:
                    result.append(data[i])
    return result
```

请以结构化的方式输出审查结果。
```

### 案例2：文档生成

```
请为以下函数生成完整的文档，包含：
1. 功能描述
2. 参数说明（类型、含义、默认值）
3. 返回值说明
4. 使用示例
5. 异常情况说明

```python
def paginate(query, page=1, per_page=20):
    # ... 实现代码
```
```

## 总结

Prompt Engineering 的核心是**清晰、具体、有结构**：

1. **明确你的需求**：不要让模型猜你想要什么
2. **提供足够的上下文**：背景、约束、期望输出
3. **使用结构化格式**：分点、分步骤、使用Markdown
4. **迭代优化**：根据输出调整提示词
5. **积累模板**：建立自己的提示词库

> 更新于 2026 年 7 月 2 日。
