---
title: "DaT 帕金森挑战还剩一周：开源医疗模型如何交卷"
date: 2026-09-04T11:20:00+08:00
draft: false
description: "DrivenData DaT Parkinson's Challenge 提交截止 9 月 16 日 23:59 UTC，奖金 2.5 万欧元。获奖方案需 MIT 开源，并进入法国开放健康算法库。"
categories: ["events"]
tags: ["赛事", "医疗AI", "DrivenData", "开源", "影像"]
image: "covers/ai-competition.svg"
---

## 赛题与约束

法国核医学会与 Health Data Hub 联合主办的 DaT Parkinson's Challenge，要求把多巴胺转运体扫描分为正常 / 异常。奖金合计 2.5 万欧元，截止时间为 2026 年 9 月 16 日 23:59 UTC。平台显示仍有约一周窗口，已有八百余名参赛者。

> 来源：[DrivenData，DaT Parkinson's Challenge](https://www.drivendata.org/competitions/311/dat-parkinsons-challenge/)。

## 交卷前必须核对的规则

- 数据仅限本赛使用，赛后删除；禁止把扫描上传到会保留数据的云端编程助手。
- 外部数据与预训练模型可以使用，但要有合法授权；冲奖则要求外部数据对所有参赛者公开，且许可允许广泛商用（不能是 NC）。
- 获奖方案以 MIT 开源，并计划收录进法国开放健康算法库 BOAS。

没有医学影像经验的团队，这一周更适合把精力放在 CCF BDCI 或 CUHK-X。有相关积累的队伍，现在应转向容器化提交和本地 smoke test，避免截止日才发现运行时格式不合规。
