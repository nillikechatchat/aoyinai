---
title: "开源项目：windows-universal-skill — 面向 AI Agent 的 Windows 操作脚本模板库"
date: 2026-07-11T21:00:00+08:00
draft: false
description: "介绍 windows-universal-skill 开源项目：~80 种 Windows 操作脚本模板，覆盖文件/应用/系统诊断全场景，PowerShell + CMD 双版本输出，安全加固设计。"
categories: ["tutorials"]
tags: ["教程", "开源", "Windows", "自动化", "Agent", "Skill", "PowerShell"]
image: "covers/llm-basics.svg"
---

## 项目简介

**windows-universal-skill** 是一个面向 AI Agent 的 Windows 操作脚本参考模板库，托管在 AtomGit 开源平台。

**核心理念**：通过"模板驱动 + 参数填充"方式生成 PowerShell 5.1 / CMD 双版本脚本，**仅供学习和参考，不可由 Agent 自动执行**。所有写操作需人工审核后手动复制执行。

**仓库地址**：[https://atomgit.com/u012823422/windows-universal-skill](https://atomgit.com/u012823422/windows-universal-skill)

**许可证**：MIT

## 为什么需要这个项目

AI Agent 在 Windows 平台面临一个尴尬的问题：大多数 Agent 框架（Claude Code、AtomCode、Cursor）的技能库主要面向 macOS/Linux，Windows 用户经常遇到兼容性问题。

**windows-universal-skill** 填补了这一空白，为 AI Agent 提供了一套完整的 Windows 操作模板库，同时通过严格的安全策略确保 Agent 不会在用户系统上自动执行危险操作。

## 核心特性

| 特性 | 说明 |
|------|------|
| ~80 种可用操作 | 覆盖文件、应用、系统诊断全场景 |
| ~30 种高风险操作已禁用 | 仅保留模板供代码审查 |
| 双脚本输出 | 每个操作同时生成 PowerShell 5.1 和 CMD 版本 |
| 三包管理器 | winget / Chocolatey / Scoop 自动降级链 |
| 两阶段确认 | 所有操作先预览、确认后才输出脚本 |
| 安全强化 | 已移除 ExecutionPolicy Bypass、自动提权、Invoke-Expression 等危险模式 |

## 安全策略

这是该项目最值得关注的设计——**安全优先**。

| 规则 | 说明 |
|------|------|
| 只读优先 | 诊断/查询类操作可直接输出脚本 |
| 写操作管控 | 修改系统的操作必须人工审核 |
| 禁止自动执行 | Agent 不在用户系统上自动运行脚本 |
| 禁止提权 | 不生成 RunAs 代码，管理员权限由用户自行提升 |

**安全等级**：

| 等级 | 说明 |
|------|------|
| safe | 只读/查询操作 — 预览 → 确认 → 输出脚本 |
| moderate | 修改操作 — 预览 → 确认 → 输出脚本（含人工审核警告） |
| dangerous | 系统级修改 — 仅输出参考模板 + 警告 |
| forbidden | 不可逆操作 — 直接拒绝 |

## 模块覆盖

### 文件操作（file）— 20 项可用 + 4 项已禁用

**可用**：create / move / search / rename / read / tail / compress / hash / duplicate / attributes / split / type-detect / pdf-info / metadata / download / csv / lock-detect / json / shortcut / xml

**已禁用**：encrypt / permission / sync / temp

### 应用管理（app）— 18 项可用（需人工审核）

install / uninstall / update / query / start / config / export-list / find-install / scoop-manage / winget-config / path / chocolatey / git-config / npm-global / pip-packages / dotnet-tools / extensions / defaults

### 系统运维（system）— 22 项可用 + 11 项已禁用

**可用**：info / env-get / env-set / service-query / registry-read / power / time / device / clipboard / display / audio / users / printer / notification / bitlocker / proxy / mapped-drives / fonts / speech / env-refresh / lockscreen / startup

**已禁用**：registry-write / service-control / firewall / scheduled-tasks / remote-desktop / hosts / updates / features / sharing / winrm / recovery

### 系统诊断（diagnose）— 22 项全部可用

port / disk / process / network / performance / event-log / battery / services / startup-time / network-adapters / network-speed / windows-errors / ram-info / crash-dumps / memory-dump / system-restore / dns-cache / bluetooth / gpu / usb / powercfg-report / virtual-memory

### 自动化脚本（script）— 6 项可用 + 5 项已禁用

**可用**：generate / convert / validate / encode / template-render / log-wrapper

**已禁用**：obfuscate / schedule / run-as / parallel / cron

### 开发环境（dev-setup）— 3 项（需人工审核）

detect / install / verify（Node.js / Python / Java / .NET / Go 五栈支持）

## 架构设计

```
windows-universal-skill/
├── SKILL.md                 # 路由表、工作流、安全策略、FAQ
├── SECURITY.md              # 安全指南
├── README.md
├── templates/
│   ├── file.md              # 文件操作
│   ├── app.md               # 应用管理
│   ├── system.md            # 系统运维
│   ├── script.md            # 自动化脚本
│   ├── dev-setup.md         # 开发环境搭建
│   └── diagnose.md          # 系统诊断
└── .evolution/
    └── tracker.txt          # 100 轮进化记录
```

## 使用示例

```
# 诊断场景（可直接执行）
用户: "检查端口 3000 被谁占用了"
Agent: [diagnose/port] -> 预览 -> 确认 -> 输出诊断脚本

# 写操作场景（需人工审核）
用户: "安装 Visual Studio Code"
Agent: [app/install] -> 预览（含人工审核警告） -> 确认 -> 输出脚本
提示: "请人工审核后手动复制到目标机器执行"

# 禁用操作场景
用户: "配置远程桌面"
Agent: [system/remote-desktop] -> 操作已禁用 -> 仅输出参考模板
```

## 快速开始

### 一句话安装

```bash
curl -fsSL https://gitcode.com/u012823422/windows-universal-skill/raw/main/install.sh | bash
```

自动检测 opencode/Claude/Cursor/Cline 等 Agent 的 skills 目录，克隆并安装。

### 一句话更新

```bash
curl -fsSL https://gitcode.com/u012823422/windows-universal-skill/raw/main/install.sh | bash -s -- --update
```

### 一句话调用

```
/windows-universal-skill operation=diagnose action=port payload={"port":3000}
```

指定操作大类、动作和参数即可，Agent 自动匹配模板、预览确认后输出双版本脚本。

## 质量保障

| 项目 | 说明 |
|------|------|
| CI/CD | GitHub Actions — 每次提交自动运行安全扫描和模板验证 |
| 安全测试 | Pester 测试套件 — 危险模式零残留验证 |
| 结构测试 | 模板完整性 + 路由表一致性 |
| 兼容性矩阵 | Windows 10 1809+ / Windows Server 2019+ |

## 技术栈

- **基线**：PowerShell 5.1
- **平台**：Windows 10 1809+ / Windows Server 2019+
- **包管理器**：winget / Chocolatey / Scoop
- **许可证**：MIT

## 开发历史

本 Skill 通过 **100 轮迭代进化**生成。安全加固版移除了自动提权、ExecutionPolicy Bypass、Invoke-Expression 等危险模式，30+ 高风险操作已禁用且代码体替换为只读安全桩，所有可执行写入操作已剥离。

## 为什么这个项目值得关注

1. **安全设计理念**：在 AI Agent 自动化时代，安全是第一位的。这个项目展示了如何在提供强大功能的同时确保安全
2. **模板驱动**：通过模板化的方式，让 Agent 的操作可预测、可审计
3. **双版本输出**：同时支持 PowerShell 和 CMD，覆盖更多 Windows 环境
4. **持续进化**：100 轮迭代的开发历史，展示了 AI 辅助开发的实践

## 开源贡献

欢迎提交 Issue 和 Pull Request：

- **仓库**：[https://atomgit.com/u012823422/windows-universal-skill](https://atomgit.com/u012823422/windows-universal-skill)
- **Issues**：[提交问题](https://atomgit.com/u012823422/windows-universal-skill/issues)
- **Pull Requests**：[提交代码](https://atomgit.com/u012823422/windows-universal-skill/pulls)

## 相关资源

- **作者主页**：[https://atomgit.com/u012823422](https://atomgit.com/u012823422)
- **AtomGit 平台**：[https://atomgit.com](https://atomgit.com)
- **AtomCode 使用指南**：[https://atomcode.atomgit.com/docs/zh/index.html](https://atomcode.atomgit.com/docs/zh/index.html)
