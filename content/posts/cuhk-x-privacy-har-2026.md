---
title: "CUHK-X 不含 RGB：用深度和毫米波做隐私友好的行为识别"
date: 2026-09-04T11:10:00+08:00
draft: false
description: "CUHK-X 明确排除 RGB，要求模型从深度、IMU、毫米波和骨架学习 40 类日常动作。9 月 15 日 Kaggle 提交截止，决赛在 UbiComp 2026。"
categories: ["events"]
tags: ["赛事", "CUHK-X", "多模态", "隐私", "Kaggle"]
image: "covers/ai-competition.svg"
---

## 赛题本身就是产品约束

CUHK-X 由香港中文大学 AIoT Lab 主办，奖金池 2 万美元，两条赛道并行：小模型 HAR（模型体积不超过 100 MB，禁止大型预训练骨干）和大模型 VQA（不限参数，鼓励视觉语言模型）。共同约束是 **训练、验证、推理全程不用 RGB**，改用深度、IMU、毫米波、骨架、热红外等模态。

这不是为了出题刁钻，而是在模拟养老、家庭和医疗现场：摄像头进不了卧室，雷达和深度相机可以。

> 来源：[CUHK-X Multimodal Human Activity Challenge](https://openaiotlab.github.io/CUHK-X-Challenge/)，赛程 2026-06-20 至 2026-09-15，决赛 2026-10-11 上海。

## 9 月 15 日之后还有两关

Kaggle 私榜前 15 名每赛道进入 Zoom 复现，精度与私榜差距超过 10% 会被刷掉；通过后每赛道 6 队参加 UbiComp 现场私有测试。想冲决赛的队伍，现在就要准备 `inference.sh`、权重和可复现 README，而不是只刷公榜。

小模型赛道适合课程项目：跨被试划分、严格体积限制、效率分计入决赛。大模型赛道适合已有 LVLM 微调经验的团队。两条都报可以，但 9 月 15 日前应先保证一条赛道有稳定提交。
