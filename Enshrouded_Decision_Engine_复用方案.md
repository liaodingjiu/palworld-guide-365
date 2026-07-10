# Enshrouded Decision Engine 复用方案

## 一、背景

Palworld 站已完成 Decision Engine Phase 0——建立了数据驱动的页面生成管道。现评估将同套管道复用到 Enshrouded 站的可行性和工作量。

---

## 二、已验证结论

### 已验证（通过实际代码测试）

**测试方法：** 用 Enshrouded 的 game.json + 1 个 Skill 实体数据，对比 Palworld 的 build.js 模板逻辑，逐字段检查兼容性。

| 管道组件 | 验证结果 | 说明 |
|---------|---------|------|
| JSON 数据文件格式 | ✅ 直接复用 | game.json / entities / decisions 三层结构不变 |
| 构建脚本架构 | ✅ 直接复用 | loadJSON → render → write 流程不变 |
| Decision Layer | ✅ 100% 兼容 | bestFor / scores / reasons / gameStage 四字段完全适用 |
| SEO 元数据生成 | ✅ 直接复用 | title / description / canonical / OG / JSON-LD 模式不变 |
| Sitemap 合并逻辑 | ✅ 直接复用 | 手动页面 + 生成页面 → 合并 sitemap |
| 内链蜘蛛网逻辑 | ✅ 直接复用 | 按 decision.bestFor 自动生成交叉链接 |

### 不能直接复用（实体层差异）

| Palworld 字段 | Enshrouded 对应 | 处理方式 |
|--------------|----------------|---------|
| `workSuitability` (12 种工作能力) | 不存在 — Enshrouded 没有工作系统 | 模板删除此区域 |
| `elements` (火/水/草等元素) | `tree` (Survivor/Assassin/Tank 等技能树) | 模板改为渲染 skill tree |
| `stats` (HP/ATK/DEF/SPD) | `cost` + `tier` (技能点消耗 + 层级) | 模板改为渲染 cost/tier |
| `breeding` (配种公式) | `prerequisites` (前置技能) | 模板改为渲染前置技能链 |
| `partnerSkill` (伙伴技能) | 不存在 | 模板删除此区域 |
| `drops` (掉落物) | 不存在于技能实体 | 移到 Boss 实体使用 |
| `acquisition` (栖息地/捕捉) | `unlockCondition` (解锁条件) | 字段重命名，模板调整 |

---

## 三、Enshrouded 实体模型设计（草案）

Enshrouded 的核心实体类型：

### 1. Skill（技能 — 对应 Palworld 的 Pal）

```yaml
Skill:
  id: "water-aura"
  gameId: "enshrouded"
  name: { en: "Water Aura" }
  slug: "water-aura"
  
  # Enshrouded 特有字段
  tree: "Survivor"           # 技能树：Survivor | Assassin | Tank | Mage | Ranger
  tier: 3                    # 层级：1-5
  cost: 4                    # 技能点消耗
  prerequisites: ["endurance-2"]
  effect: "Passive HP regen near water"
  
  # 决策层（直接复用）
  decision:
    bestFor: ["survivability", "exploration"]
    gameStage: { early: false, mid: true, late: true }
    scores: { survivability: 90, exploration: 75, combat: 20 }
    reasons:
      survivability: ["Constant HP regen near water", "Synergizes with high-HP builds"]
```

### 2. Weapon（武器）

```yaml
Weapon:
  id: "ignited-hammer"
  gameId: "enshrouded"
  name: { en: "Ignited Hammer" }
  slug: "ignited-hammer"
  
  type: "Melee"              # Melee | Ranged | Staff | Shield
  damage: 85
  elementalDamage: "Fire"
  durability: 300
  repairCost: [{ item: "iron-ingot", qty: 5 }]
  
  decision:
    bestFor: ["boss-fight", "crowd-control"]
    gameStage: { early: false, mid: true, late: true }
    scores: { "boss-fight": 88, "crowd-control": 75, "exploration": 40 }
```

### 3. Boss

```yaml
Boss:
  id: "fell-wyvern"
  gameId: "enshrouded"
  name: { en: "Fell Wyvern" }
  slug: "fell-wyvern"
  
  location: "Wyvern Peak"
  level: 35
  hp: 12000
  weaknesses: ["Ice", "Ranged"]
  resistances: ["Fire"]
  drops: [{ item: "wyvern-scale", rate: "100%", qty: [3, 8] }]
  
  decision:
    bestFor: []              # Boss 本身不需要决策标签
```

---

## 四、决策场景（Enshrouded 版）

| Palworld 场景 | Enshrouded 对应 | URL |
|-------------|----------------|-----|
| `/best-pals/mining/` | `/best-skills/survivability/` | 生存 build 必点技能排行 |
| `/best-pals/combat/` | `/best-weapons/boss-fight/` | Boss 战最优武器排行 |
| `/best-pals/base-worker/` | `/best-skills/base-building/` | 建造/制作必点技能 |
| `/best-pals/mount-flying/` | `/best-skills/exploration/` | 探索/跑图技能排行 |

---

## 五、实施计划

### Phase 0-E：管道适配（预计 2 小时）

| 步骤 | 内容 | 时间 |
|------|------|------|
| 1 | 复制 Palworld 的 `scripts/build.js` 到 Enshrouded 站 | 5min |
| 2 | 重写 `renderEntityPage()` 模板 — 删除 Pal 特有区块，替换为 Enshrouded 字段 | 40min |
| 3 | 创建 Enshrouded `data/game.json` | 5min |
| 4 | 创建 3 个参考实体数据文件（1 Skill + 1 Weapon + 1 Boss） | 30min |
| 5 | 创建 2 个 Decision 场景文件 | 20min |
| 6 | 本地构建验证 + 修 bug | 20min |

### Phase 1-E：首批数据填充（与 Palworld Phase 1 节奏一致）

- Top 20 Skills + Top 15 Weapons + Top 10 Bosses
- 6 个 Decision 场景页面
- ~50 个实体页 + 6 个决策页

---

## 六、风险和已知限制

| 风险 | 等级 | 应对 |
|------|------|------|
| Enshrouded 实体类型比 Palworld 多（Skills/Weapons/Bosses/Buildings），每种需要独立模板 | 🟡 中 | 先做 Skill + Weapon 两种，Boss 用问题页覆盖 |
| Enshrouded 1.0 10 月才发布 — 数据可能大改 | 🟡 中 | 先建立管道，数据文件独立，版本更新只改 JSON |
| Enshrouded 社区规模小于 Palworld，搜索量未知 | 🟢 低 | 小站先占坑，1.0 发布时已有完整内容矩阵 |
| 游戏机制差异大 — "Decision Engine" 定位可能需要调整措辞 | 🟢 低 | 保留 Decision 数据结构，面向用户的文案改为 Enshrouded 语境 |

---

## 七、不做的事情

- ❌ 不做配种计算器（Enshrouded 无配种）
- ❌ 不做资源计算器（优先度低，先做技能/武器排名）
- ❌ 不在一开始就生成 200 个页面（和 Palworld 一样渐进式发布）
- ❌ 不复制 Palworld 的 CSS 主题（Enshrouded 已经有了自己的 Google Font + shared.css）

---

## 八、最终判断

**Palworld Decision Engine 管道可以 70% 复用到 Enshrouded。** 基础设施层（数据格式、构建流程、Decision Layer、SEO 生成、sitemap）直接复用。实体 schema 和展示模板需要针对 Enshrouded 重写，约 2 小时适配工作。

建议等 Palworld Phase 1 验证完 Decision Engine 模式可行后，再启动 Enshrouded 适配。
