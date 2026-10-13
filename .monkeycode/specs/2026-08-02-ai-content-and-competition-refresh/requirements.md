# Requirements Document

## Introduction

为敖胤AI更新一篇可由全部内容栏目发现的 AI 周报，并将赛事统计数据核验日期更新为 2026-08-02。

## Glossary

- **全栏目周报**：Front Matter 同时关联站点全部内容栏目的一篇 AI 动态文章。
- **核验日期**：赛事统计数据最后一次完成来源检查的日期。

## Requirements

### Requirement 1: 全栏目动态

**User Story:** 作为站点读者，我希望从任意栏目看到最新 AI 动态，以便快速了解本周值得关注的模型、开发和赛事信息。

#### Acceptance Criteria

1. WHEN 读者访问任一内容栏目，站点 SHALL 展示 2026-08-02 发布的 AI 周报。
2. WHEN 周报描述模型更新，周报 SHALL 提供原始公告链接和可核验的发布日期、价格或性能信息。
3. WHEN 周报给出实践建议，周报 SHALL 将建议关联到对应的内容栏目。

### Requirement 2: 赛事统计刷新

**User Story:** 作为参赛者，我希望赛事统计显示最新核验日期和有效赛事，以便安排报名计划。

#### Acceptance Criteria

1. WHEN 用户访问赛事统计页，页面 SHALL 显示 2026-08-02 作为数据核验日期。
2. WHEN 赛事截止日期早于核验日期，赛事统计页 SHALL 将赛事归入历史赛事。
3. WHEN 赛事在官方平台公开报名截止信息，赛事统计页 SHALL 保留该平台链接与截止日期。
