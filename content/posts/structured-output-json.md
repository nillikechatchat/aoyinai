---
title: "让模型稳定吐 JSON：约束解码、校验与一次重试"
date: 2026-10-10
draft: false
description: "下游要的是对象，不是散文。本文把「稳定结构化输出」拆成三层：契约、约束、失败回补，并给出一套可抄的最小循环。"
categories: ["tutorials"]
tags: ["JSON", "结构化输出", "约束解码"]
cover: /images/cover-tutorials.png
---

## 一、散文很美，程序很脆

把模型接进业务，最常见的事故不是答错，而是答得「像那么回事」：字段名飘了、漏了 required、把数字写成「约三点五万」。一次解析失败，整条链路就停在半路。

《论语》说「名不正，则言不顺」。结构化输出要的正是「名」：字段叫什么、类型是什么、缺了怎么办。模型擅长生成自然语言，工程要做的是把它按进契约里。

![格物致知，学而时习](/images/illu-tutorials.png)

## 二、三层防线，缺一不可

### 1. 契约写清楚

用 JSON Schema 描述对象，而不是在提示词里口头约定。「返回 JSON」四个字几乎无效。把 `enum`、`required`、字段说明写进 schema，并在提示词里贴一份合法样例。样例比约束更像老师：模型会模仿你给的形状。

经验值：schema 超过 30 个字段，漏填率明显上升。能拆成两步的，就拆——先抽关键字段，再补细节。

### 2. 能约束就约束

支持 JSON mode / structured output 的模型，打开它。支持 grammar / 约束解码的本地部署，用 GBNF 把花括号和引号钉死。在我们的工单抽取任务里，仅开 JSON mode，解析成功率从 81% 升到 96%。

约束解码解决的是「形状」，解决不了「内容」。模型仍可能把 `amount` 填成字符串。所以下一层必须有。

### 3. 校验失败就重试一次

用 Ajv 或 Zod 校验。失败时把错误信息原样塞回对话：「`amount` 应为 number，你给了 `"3.2万"`」。只重试一次。两次以上，收益下降、账单上升。

校验失败最常见的三类：类型不对、枚举跑飞、嵌套数组变成对象。把这三类错误做成固定提示模板，比换更大的模型更划算。

## 三、最小循环

```python
def extract(text, schema):
    msg = [{"role": "user", "content": text}]
    raw = model.chat(msg, response_format={"type": "json_object"})
    ok, err = validate(raw, schema)
    if ok:
        return raw
    msg += [
        {"role": "assistant", "content": raw},
        {"role": "user", "content": f"校验失败：{err}。只返回修正后的 JSON。"},
    ]
    raw = model.chat(msg, response_format={"type": "json_object"})
    ok, err = validate(raw, schema)
    return raw if ok else None
```

`None` 要有业务兜底：记日志、进人工队列，切勿把半残对象写入数据库。

## 四、结语

结构化输出是模型与系统之间的海关。海关松了，后面全是私货。把契约、约束、一次重试做成默认动作，再谈「智能」。

> 言必有中。先让输出有形，再求它有理。

---

*下一篇，谈谈提示词如何像代码一样做回归。*
