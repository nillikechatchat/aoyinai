---
title: "AG2 1.3 把共享状态分成三种作用域：多智能体变量污染有了标准解法"
date: 2026-11-10T15:00:00+08:00
draft: false
description: "AG2 v1.3.0（2026-11-04）引入 ScopedValue 显式作用域与跨委托树事件观测，把多智能体系统的共享状态问题变成了可声明的工程对象。本文讲清 COPIED、LOCAL、SHARED 三种语义与落地骨架；API 细节以官方文档为准。"
categories: ["t-agent"]
tags: ["T-agent", "多智能体", "AG2", "ScopedValue", "状态管理", "可观测性"]
image: "covers/t-agent.svg"
cover:
  image: "covers/t-agent.svg"
  alt: "君子和而不同"
  hidden: false
---

## 一、多智能体的「全局变量」难题

多智能体系统写崩的第一现场，几乎都是同一个：两个 agent 改了同一个字典。协调者把「用户偏好」放进共享上下文，检索 agent 中途覆写了它，写作 agent 拿到的是被污染的版本，最后产出的报告里混进了上一轮任务的残留。这类 bug 在单 agent 时代不存在——单 agent 的状态生命周期就是一次会话；多 agent 的状态要在「谁可见、谁可写、何时复制」三个维度上做决定，而大多数框架把决定权留给了程序员的自觉。

AG2（原 AutoGen 社区延续版本）在 2026 年 11 月 4 日发布的 v1.3.0 里，把这件事变成了显式声明：ScopedValue 提供三种变量作用域——COPIED（复制传递）、LOCAL（本地私有）、SHARED（显式共享），配合跨委托树（delegation tree）的事件观测能力（来源：AG2 官方 GitHub Releases v1.3.0，2026-11-04）。本文讲清三种语义的边界、给出落地骨架。所有 API 名称与行为以 AG2 官方文档为准，版本演进请跟踪官方 Releases。

![君子和而不同](/images/illu-t-agent.png)

《论语》说「君子和而不同」。多智能体协作的理想态正是如此：目标一致（和），状态边界清晰（不同）。ScopedValue 的价值在于把「边界」从口头约定升级为框架约束。

### 2. 三种作用域的语义边界

三种作用域回答三个不同的问题。**SHARED** 回答「谁需要看到最新值」：跨 agent 协同的共享事实，比如研究任务里不断追加的 findings 列表、全局预算计数器。所有持有者看到同一份状态，写操作需要考虑并发顺序。**LOCAL** 回答「谁的状态只属于谁」：单个 agent 的工作草稿、中间推理、重试计数。它天然隔离，他人不可见也不可改。**COPIED** 回答「传出去之后要不要跟源头脱钩」：把协调者的任务说明传给子 agent 时，子 agent 内部的任何修改都不应回流——COPIED 语义在传递时做深拷贝，保证源与副本从此互不影响。

选型的心法是按「写权限」分配作用域：只有一个 agent 该写的，用 LOCAL；多个 agent 都该写的，用 SHARED 并明确写入时序；传给下游后下游随便改但不许污染上游的，用 COPIED。示意对照：假设一个「研究小组」系统，findings 列表 SHARED（所有人追加）、每位研究员的草稿 LOCAL（自己可见）、分发给写作 agent 的研究简报 COPIED（写作 agent 随意批注，不影响研究组）。三句话定清边界，一半的协作 bug 在设计阶段就消失了。

### 3. 跨委托树观测：让「谁改了什么」可见

v1.3.0 的另一半是可观测性：委托树事件让父 agent（与开发者）能看到子 agent 树里发生的事件流。它与 ScopedValue 是一对互补机制——作用域管「权限边界」，事件观测管「运行时事实」。调试变量污染问题时的标准动作因此固定下来：先看作用域声明是否正确（设计审计），再开事件观测复跑一次（运行取证），定位到具体哪个 agent 在哪个委托层级写了不该写的状态。

这个能力指向的更大趋势是「多智能体的可观测性正在成为默认项」。同一周内的可参照动态：LangGraph 1.2.20 引入 strict resume 模式并规范 interrupt 标识（官方 Releases，2026-11-05）；OpenAI Agents SDK 的 0.24.0-alpha.7 预发布加入 RunBudget 用量预算与 CustomStorage 会话存储（官方 Releases，2026-11-08）；Claude Agent SDK 0.2.177 为 HookMatcher 增加 on_failure 处理选项（官方 Releases，2026-11-03）。各家框架在同一时间窗补齐的都是同一类东西：状态边界、预算约束、失败路径——多智能体工程从「能跑通」进入「可控可信」阶段。

### 4. 落地骨架：三作用域的研究小组

以下骨架展示声明方式（示意代码，基于 v1.3.0 公开的 ScopedValue 概念整理，具体 API 签名以官方文档与示例为准）：

```python
from autogen import ConversableAgent
from autogen.scoped_values import ScopedValue, Scope

# SHARED：全员可追加的研究发现
findings = ScopedValue(value=[], scope=Scope.SHARED, name="findings")

# COPIED：分发出去的任务简报，下游修改不回流
brief_for_writer = ScopedValue(value=brief, scope=Scope.COPIED)

# LOCAL：每个 agent 的私有草稿（agent 内部自行持有）
# coordinator 侧
for paper in search_results:
    findings.append(extract(paper))        # 写入共享态

writer = build_writer_agent(input=brief_for_writer)
# writer 内部对 brief 的任何修改不影响 coordinator 持有的原版
```

配套两个纪律。写入时序：SHARED 状态的并发写要定义合并规则（追加类结构天然安全，覆盖类结构需要约定以谁为准）。边界评审：每次新增一个跨 agent 传递的状态，先回答「它属于三种作用域中的哪一种」，答不出就不允许上线。评审成本一分钟，换回来的是上线后不再有「谁改了我的变量」式事故。

### 5. 升级决策：谁现在就该动

三类团队值得把 v1.3.0 列入近期升级计划。第一类，已有协调者-工人架构且出现过状态串扰的系统——ScopedValue 是对症药。第二类，正在做多轮委托、层级超过两层的系统——委托树观测补的是深层调试能力。第三类，准备引入 A2A 协议做跨进程协作的团队——AG2 v1.2.0（2026-10-11）已支持 A2A server 多副本运行，加上 10 月 1 日官方发布的 A2A CLI（来源：A2A 协议官方博客），进程间协作的链路同样需要作用域纪律兜底。升级前注意版本要求：v1.3.0 要求 Python 3.11+，部分旧 API 官方标注将在 1.4 迁移（来源：官方 Releases 说明）。

《大学》讲「物有本末，事有终始，知所先后，则近道矣」。多智能体的「本」是状态边界，「末」才是能力编排。先把三种作用域声明清楚，再去追更强的模型与更复杂的编排——边界清楚的系统，坏也坏得明白；边界含糊的系统，好也好得偶然。本文基于 2026-11-10 前的公开版本信息核验，API 与行为以 AG2 官方文档最新版为准。
