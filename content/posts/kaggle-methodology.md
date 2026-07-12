---
title: "Kaggle 竞赛完整方法论：从 EDA 到模型集成的系统策略"
date: 2026-07-11T18:00:00+08:00
draft: false
description: "基于 Kaggle Grandmaster 的经验，系统梳理竞赛全流程：EDA、特征工程、模型选择、超参调优、模型集成、提交策略，附实战代码模板。"
categories: ["events"]
tags: ["赛事", "Kaggle", "特征工程", "模型集成", "数据科学"]
image: "covers/ai-competitions-2026.svg"
---

## 引言

Kaggle 竞赛是数据科学领域最权威的实战平台。但很多参赛者停留在"跑 baseline"的阶段，缺乏系统性的方法论。

本文基于 Kaggle Grandmaster 的公开分享，梳理从 EDA 到模型集成的完整竞赛策略。

## 一、竞赛前期：理解问题

### 1.1 赛题分析

拿到赛题后，第一件事不是写代码，而是理解问题：

1. **任务类型**：分类、回归、排序、检测、生成？
2. **评估指标**：AUC、RMSE、MAP@K、F1？（决定优化目标）
3. **数据规模**：行数、列数、特征类型？
4. **提交格式**：概率值、类别标签、排序列表？
5. **时间限制**：赛程多长？每天能提交几次？

### 1.2 Leaderboard 分析

```
# 分析 Leaderboard 分数分布
- 公榜（Public LB）和私榜（Private LB）的 split 比例
- 历届比赛的 shake up 程度
- Top 选手的分数差距
```

**关键洞察**：
- 公榜分数高不代表最终成绩好（过拟合公榜）
- 私榜 shake up 大的比赛，模型稳定性更重要
- 分数差距小的比赛，细节决定胜负

## 二、EDA：数据探索

### 2.1 基础 EDA 检查清单

```python
import pandas as pd
import numpy as np

# 1. 数据概览
df.shape
df.info()
df.describe()

# 2. 缺失值分析
missing = df.isnull().sum()
missing_pct = missing / len(df) * 100
missing_df = pd.DataFrame({'count': missing, 'pct': missing_pct})
print(missing_df[missing_df['count'] > 0].sort_values('pct', ascending=False))

# 3. 目标变量分布
df['target'].value_counts(normalize=True)

# 4. 数值特征分布
for col in df.select_dtypes(include=[np.number]).columns:
    print(f"{col}: mean={df[col].mean():.2f}, std={df[col].std():.2f}, skew={df[col].skew():.2f}")

# 5. 类别特征分布
for col in df.select_dtypes(include=['object']).columns:
    print(f"{col}: {df[col].nunique()} unique values")
```

### 2.2 高级 EDA

**特征相关性**：
```python
# 数值特征相关性矩阵
corr = df.select_dtypes(include=[np.number]).corr()
# 找高相关特征对
high_corr = corr.where(np.triu(np.ones(corr.shape), k=1).astype(bool))
high_corr_pairs = high_corr.stack().sort_values(ascending=False)
print(high_corr_pairs[high_corr_pairs > 0.95])
```

**目标泄漏检测**：
```python
# 检查特征与目标的相关性
for col in df.columns:
    if col != 'target':
        if df[col].dtype in ['int64', 'float64']:
            corr = df[col].corr(df['target'])
            if abs(corr) > 0.9:
                print(f"WARNING: {col} has high correlation with target: {corr:.3f}")
```

## 三、特征工程

### 3.1 数值特征

```python
# 1. 对数变换（处理偏态分布）
df['log_feature'] = np.log1p(df['feature'])

# 2. 分箱
df['binned'] = pd.qcut(df['feature'], q=10, labels=False)

# 3. 交叉特征
df['feature_ratio'] = df['feature_a'] / (df['feature_b'] + 1e-8)
df['feature_diff'] = df['feature_a'] - df['feature_b']

# 4. 聚合特征
agg = df.groupby('category')['value'].agg(['mean', 'std', 'min', 'max'])
df = df.merge(agg, on='category', how='left')
```

### 3.2 类别特征

```python
# 1. Target Encoding
from sklearn.model_selection import KFold

def target_encode(train, col, target, n_splits=5):
    encoded = pd.Series(index=train.index, dtype=float)
    kf = KFold(n_splits=n_splits, shuffle=True, random_state=42)
    for train_idx, val_idx in kf.split(train):
        means = train.iloc[train_idx].groupby(col)[target].mean()
        encoded.iloc[val_idx] = train.iloc[val_idx][col].map(means)
    return encoded

# 2. Frequency Encoding
freq = df[col].value_counts(normalize=True)
df[f'{col}_freq'] = df[col].map(freq)

# 3. Label Encoding
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
df[f'{col}_encoded'] = le.fit_transform(df[col])
```

### 3.3 文本特征

```python
# 1. TF-IDF
from sklearn.feature_extraction.text import TfidfVectorizer
tfidf = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
tfidf_features = tfidf.fit_transform(df['text'])

# 2. 文本长度
df['text_len'] = df['text'].str.len()
df['word_count'] = df['text'].str.split().str.len()

# 3. Embedding（使用预训练模型）
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(df['text'].tolist())
```

## 四、模型选择与训练

### 4.1 Baseline 模型

```python
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from catboost import CatBoostClassifier

models = {
    'rf': RandomForestClassifier(n_estimators=100, random_state=42),
    'xgb': XGBClassifier(n_estimators=1000, learning_rate=0.05, random_state=42),
    'lgb': LGBMClassifier(n_estimators=1000, learning_rate=0.05, random_state=42),
    'cat': CatBoostClassifier(iterations=1000, learning_rate=0.05, random_state=42, verbose=0)
}
```

### 4.2 超参调优

```python
import optuna

def objective(trial):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 500, 3000),
        'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3, log=True),
        'max_depth': trial.suggest_int('max_depth', 3, 10),
        'subsample': trial.suggest_float('subsample', 0.6, 1.0),
        'colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0),
        'reg_alpha': trial.suggest_float('reg_alpha', 1e-8, 10.0, log=True),
        'reg_lambda': trial.suggest_float('reg_lambda', 1e-8, 10.0, log=True),
    }
    model = LGBMClassifier(**params, random_state=42)
    score = cross_val_score(model, X, y, cv=5, scoring='roc_auc').mean()
    return score

study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=100)
```

## 五、模型集成

### 5.1 Stacking

```python
from sklearn.model_selection import KFold

def stacking_oof(models, X, y, n_splits=5):
    kf = KFold(n_splits=n_splits, shuffle=True, random_state=42)
    oof_preds = np.zeros((len(X), len(models)))
    
    for i, (name, model) in enumerate(models.items()):
        for train_idx, val_idx in kf.split(X):
            model.fit(X[train_idx], y[train_idx])
            oof_preds[val_idx, i] = model.predict_proba(X[val_idx])[:, 1]
    
    return oof_preds

# Level 1: 基模型 OOF 预测
level1_preds = stacking_oof(base_models, X_train, y_train)

# Level 2: 元模型
meta_model = LogisticRegression()
meta_model.fit(level1_preds, y_train)
```

### 5.2 加权平均

```python
# 简单加权平均
weights = [0.3, 0.3, 0.2, 0.2]  # 根据 CV 分数调整
final_pred = sum(w * pred for w, pred in zip(weights, model_preds))
```

### 5.3 Blending

```python
# 使用 holdout 集进行 blending
from sklearn.model_selection import train_test_split

X_train_blend, X_holdout, y_train_blend, y_holdout = train_test_split(
    X_train, y_train, test_size=0.2, random_state=42
)

blend_preds = []
for model in models:
    model.fit(X_train_blend, y_train_blend)
    pred = model.predict_proba(X_holdout)[:, 1]
    blend_preds.append(pred)

# 在 holdout 上找最优权重
from scipy.optimize import minimize

def loss(weights):
    weighted_pred = sum(w * p for w, p in zip(weights, blend_preds))
    return -roc_auc_score(y_holdout, weighted_pred)

result = minimize(loss, x0=[1/len(models)]*len(models), bounds=[(0,1)]*len(models))
optimal_weights = result.x
```

## 六、提交策略

### 6.1 避免过拟合 Leaderboard

- **以 CV 分数为主要参考**，LB 分数为辅助
- **不要为了 LB 分数牺牲 CV 分数**
- **保持模型多样性**，不要只优化一个模型

### 6.2 最终提交选择

```
选择标准：
1. CV 分数最高的模型
2. CV 和 LB 分数一致的模型
3. 多个模型集成的结果
4. 稳定性最好的模型（多次运行分数方差小）
```

## 七、竞赛复盘

比赛结束后，无论名次如何，都应该复盘：

1. **Winner Solution**：学习获胜者的思路
2. **自己的差距**：在哪些环节可以改进
3. **新学到的技术**：记录下来，应用到下一个比赛
4. **社区讨论**：参与 Discussion，学习他人经验

## 总结

Kaggle 竞赛的核心是**系统性**和**迭代性**。不要期望一次就做出最好的方案，而是通过不断迭代（EDA → 特征 → 模型 → 集成）逐步提升。

**关键原则**：
- 理解问题比写代码更重要
- 特征工程比模型调参更有效
- 模型集成是提升成绩的关键
- CV 分数比 LB 分数更可靠

> 本文代码模板可直接用于 Kaggle 竞赛，具体参数需根据赛题调整。
