# Palworld Decision Engine — 最终执行方案

## 战略定位

> 不要建立一个 Palworld Wiki，而要建立一个**"玩家遇到任何选择问题时，第一个想到打开的网站"**。
>
> 最终产品不是 Palworld Guide，不是工具集——而是 **Palworld Decision Engine（帕鲁决策引擎）**。

---

## 产品架构

```
                 Decision Engine
                      |
          ┌───────────┴───────────┐
          │                       │
    Decision Layer           Data Layer
          │                       │
     ┌────▼────┐          ┌───────▼──────┐
     │ Finder  │          │ Pal Database │
     └─────────┘          └──────────────┘
          │
     ┌────▼────────┐
     │ Calculator  │
     └─────────────┘
```

- **左分支（Decision Layer）**：帮用户做选择 — Finder → Calculator
- **右分支（Data Layer）**：帮用户查资料 — Pal Database
- 两条分支共享同一份底层 Pal 数据模型

---

## Phase 0：统一数据模型 + 决策层（Day 1-3）

### 交付物

**1. Unified Game Schema**

```typescript
// 游戏无关的基础 Schema，预留 game 字段用于多游戏扩展

Pal {
  id: string
  name: string
  game: string              // 预留：palworld | minecraft | ark | valheim
  number: number            // 图鉴编号
  elements: Element[]
  workSuitability: {
    kindling: number
    watering: number
    planting: number
    generating: number      // 发电
    handiwork: number
    gathering: number
    lumbering: number
    mining: number
    medicine: number        // 制药
    cooling: number
    transporting: number
    farming: number         // 牧场
  }
  stats: {
    hp: number
    attack: number
    defense: number
    meleeAttack?: number
    shotAttack?: number
  }
  skills: Skill[]
  drops: Drop[]
  habitat: Habitat[]
  breedingPower: number
  // ... 更多字段
}
```

**2. Decision Layer Schema**（老师的核心补充）

```typescript
// 决策层：把"玩家要做的选择"建模为结构化数据

Decision {
  id: string                    // e.g. "best-pals-mining"
  question: string              // 玩家在想的："我需要一个采矿帕鲁，哪个最好？"
  type: 'ranking' | 'compare' | 'build' | 'recommend'
  
  // 筛选条件
  criteria: {
    primary: Criterion[]        // 主维度：采矿能力 ≥ 3
    secondary: Criterion[]      // 副维度：搬运速度、饮食消耗
    filters: Filter[]           // 硬筛选：可夜间工作、非传说
  }
  
  // 输出
  results: RankedResult[]       // 排序后的推荐列表
  reasoning: string             // 为什么这样排
}
```

**3. 决策页模板设计**

两类页面的内容模板：
- 实体页 `/pal/anubis`：属性、技能、掉落、获取方式
- 决策页 `/best-pals/mining`：场景说明 → 排名逻辑 → 推荐结果 → 对比表

---

## Phase 1：数据资产 + SEO 入口（Day 4-21）

### 交付物

| 交付物 | 数量 | 说明 |
|--------|------|------|
| Pal 数据填充 | 200 条 | 完整的 Pal 结构化数据 |
| 实体页 `/pal/{name}` | 50-200 页 | 自动生成，SEO 长尾覆盖 |
| 决策页 `/best-pals/{scenario}` | 20-50 页 | 场景化排名，高意图 SEO |
| Pal Finder 工具 | 1 个 | 交互式多维度筛选器 |

### 两类页面的 SEO 分工

```
实体页（Data Layer）：
  /pal/anubis       → "anubis palworld"
  /pal/jetragon     → "jetragon palworld"
  /pal/frostallion  → "frostallion palworld"
  
决策页（Decision Layer）：
  /best-pals/mining      → "best pal for mining"
  /best-pals/base        → "best base pals"
  /best-pals/transport   → "best transport pal"
  /best-pals/combat      → "best combat pal"
  /best-mounts/flying    → "best flying mount"
  /best-mounts/ground    → "best ground mount"
```

### Pal Finder 工具功能

- 多维度筛选：工作适应性、元素、属性范围
- 实时排序：按指定维度排序
- 对比模式：并排比较 2-3 个 Pal
- URL 状态同步：筛选条件反映在 URL 上，可分享
- 移动优先设计

---

## Phase 2：核心壁垒（Day 22-40）

### 交付物

1. **Breeding Calculator MVP**
   - 双亲查子代
   - 目标 Pal 反查亲代组合
   - 育种路径推荐
   - 基于 Phase 0 同一份 Pal 数据

2. **SEO 基础设施完善**
   - 全站内链体系
   - Schema.org 结构化数据标记
   - XML Sitemap 更新
   - 面包屑导航

---

## Phase 3：深度 Palworld 生态（Day 41-90）

### 交付物

| 功能 | 说明 |
|------|------|
| Resource Calculator | 材料树正向/反向计算，批量物品规划 |
| Base Builder | 基地建筑规划，所需资源总预算 |
| Team Recommendation | 基于元素克制 + 被动技能协同的队伍推荐 |
| 收藏系统 | 用户可标记"已捕获""收藏"的 Pal |
| 用户账户 | 收藏同步、跨设备访问 |

---

## 最终目标

> 成为玩家遇到任何 Palworld 选择问题时，**第一个想到打开**的网站。

### 成功指标

- 200 个实体页 + 50 个决策页 = 250+ SEO 着陆页
- Pal Finder 日活用户持续增长
- Breeding Calculator 形成搜索品牌词
- 用户在 Discord/Reddit 自然分享 Finder 链接

---

## 核心原则（来自老师）

1. **先建数据资产，再做工具** — Schema 是一切的基础
2. **决策页 + 实体页双线并进** — 覆盖不同搜索意图
3. **不要和 Wiki 拼内容，和计算器拼体验** — 工具 > 内容
4. **移动优先** — 玩家在游戏中用手机查，不是 PC
5. **多游戏扩展推迟到验证后** — 先把 Palworld 做透

---

## 开发原则

- 纯静态优先：Finder 和 Database 页面都可以在构建时预生成
- 数据驱动：所有页面从同一份 JSON/YAML 数据源生成
- 渐进增强：先做静态可用，再做客户端交互，最后加后端
- 可分享性：每个筛选状态/结果都有唯一 URL
