# Palworld Decision Engine — Data Schema v1.0

## 设计目标

> 同一套数据，支持 Finder、Database、Calculator、SEO 页面、多游戏扩展。

---

## 一、三层架构总览

```
                         Game
                          |
            ┌─────────────┼─────────────┐
            │             │             │
       Entity Layer   Relation Layer  Decision Layer
       (事实数据)       (关系数据)       (推荐逻辑)
            │             │             │
          Pal         Breeding      Recommendation
          Item        Drop          Ranking
          Boss        Location      BestFor
          Building    Recipe        GameStage
```

**为什么不是百科结构？**

| 百科结构（错误） | 三层架构（正确） |
|----------------|----------------|
| Pal、Item、Building 各自独立 | 所有实体共享 Game 上下文 |
| 数据之间没有关联 | Relation Layer 显式建模关系 |
| 没有推荐能力，只描述"是什么" | Decision Layer 回答"该选什么" |
| 页面需要手动编写 | 数据 → 模板 → 页面，全自动生成 |

---

## 二、Game 基础表

未来支持 Palworld / Minecraft / ARK / Valheim，所以 Game 必须是顶层概念。

```yaml
Game:
  id: "palworld"
  name: "Palworld"
  version: "1.0"
  platform: ["PC", "Xbox", "PS5"]
  lastUpdated: "2026-07-10"
  locale: "zh-CN"
```

所有后续实体都挂在 `gameId` 下，切换游戏 = 切换数据源，Schema 不变。

---

## 三、Entity Layer（事实数据）

### 3.1 Pal — 核心资产

```yaml
Pal:
  # ── 系统字段 ──
  id: "anubis"
  gameId: "palworld"
  number: 100                    # 图鉴编号

  # ── 基础信息 ──
  name:
    zh: "阿努比斯"
    en: "Anubis"
  slug: "anubis"
  image: "/images/pals/anubis.png"
  description: "曾经是某种大型建造工程的主管..."

  # ── 分类 ──
  classification:
    elements: ["Ground"]         # 元素属性
    rarity: "Rare"               # Common | Uncommon | Rare | Epic | Legendary
    role: ["Worker", "Combat"]    # Worker | Combat | Mount | Support
    size: "Medium"               # Small | Medium | Large | Huge
    isRideable: false
    isFlyable: false

  # ── 战斗属性 ──
  stats:
    hp: 120
    attack: 130
    defense: 100
    rangedAttack: 0
    speed: 80
    stamina: 100

  # ── 工作能力（核心字段，驱动决策页） ──
  workSuitability:
    kindling: 0                  # 生火
    watering: 0                  # 浇水
    planting: 0                  # 播种
    generating: 0                # 发电
    handiwork: 4                 # 手工
    gathering: 0                 # 采集
    lumbering: 0                 # 伐木
    mining: 3                    # 采矿 ⭐
    medicine: 0                  # 制药
    cooling: 0                   # 降温
    transporting: 2              # 搬运
    farming: 0                   # 牧场

  # ── 技能 ──
  skills:
    - name: "Sand Tornado"
      element: "Ground"
      power: 130
      cooldown: 18
      level: 1
    - name: "Stone Cannon"
      element: "Ground"
      power: 60
      cooldown: 4
      level: 7

  # ── 被动技能槽 ──
  partnerSkill:
    name: "Guardian of the Desert"
    description: "战斗时会跳到阿努比斯肩上使用机枪"

  # ── 获取方式 ──
  acquisition:
    habitats: ["desert_day"]       # → Location.id
    isBreedable: true
    isCatchable: true
    isBossEncounter: false
    dungeonBoss: false
    dropFrom: []                   # 击败掉落

  # ── 繁殖 ──
  breeding:
    breedingPower: 570
    # parentCombinations 放在 Relation Layer 中

  # ── 决策标签（★ 这是和 Wiki 的本质区别） ──
  decision:
    bestFor: ["mining", "base", "combat"]
    gameStage:
      early: false                 # 前期能获得吗？
      mid: true
      late: true
    scores:
      mining: 95                   # 综合采矿评分（含工作效率+速度+饮食）
      combat: 82
      transport: 60
      base: 90                     # 综合基地评分
      farming: 0
      gathering: 0
```

### 3.2 Item

```yaml
Item:
  id: "pal_metal_ingot"
  gameId: "palworld"
  name:
    zh: "帕鲁金属锭"
    en: "Pal Metal Ingot"
  slug: "pal-metal-ingot"
  type: ["Material"]
  rarity: "Uncommon"
  stackSize: 9999
  recipe:
    requires:
      - itemId: "ore"
        quantity: 4
      - itemId: "coal"
        quantity: 2
  sources:
    - type: "Craft"
      station: "Improved Furnace"
    - type: "PalDrop"
      palId: "anubis"
```

### 3.3 Building

```yaml
Building:
  id: "improved_furnace"
  gameId: "palworld"
  name:
    zh: "改良熔炉"
    en: "Improved Furnace"
  level: 37                       # 科技解锁等级
  requirements:
    - itemId: "stone"
      quantity: 100
    - itemId: "cement"
      quantity: 30
    - itemId: "flame_organ"
      quantity: 15
  unlocks: ["Pal Metal Ingot"]
```

### 3.4 Location

```yaml
Location:
  id: "desert_day"
  gameId: "palworld"
  name:
    zh: "沙漠（白天）"
    en: "Desert (Day)"
  biome: "Desert"
  pals: ["anubis", "digtoise", "tocotoco"]
  levelRange: [15, 45]
```

---

## 四、Relation Layer（关系数据）

> 游戏站真正的价值不是数据本身，而是数据之间的关系。

### 4.1 Breeding Relationship

```yaml
Breeding:
  parentA: "foxparks"             # Pal.id
  parentB: "lamball"              # Pal.id
  child: "anubis"                 # Pal.id
  priority: 1                     # 是否有特殊配方（1=特殊, 0=通用公式）
  note: "特殊配方：Foxparks + Lamball → Anubis"
```

**生成规则：** Priority=1 的配方在详情页优先展示，0 的由 Calculator 用 breedingPower 公式动态计算。

### 4.2 Best Use Relationship

```yaml
Recommendation:
  target: "mining"                # 决策场景
  entityId: "anubis"              # Pal.id
  score: 95                       # 综合评分
  rank: 1                         # 排名
  reason:
    - "Mining 工作适应性 3 级"
    - "手工 4 级，挖完还能搬"
    - "可夜间工作"
    - "通过配种可在中期获得"
```

这条关系直接驱动 `/best-pals/mining` 页面内容。

### 4.3 Drop Relationship

```yaml
Drop:
  sourceId: "anubis"              # Pal.id（击败/捕获掉落）
  targetId: "bone"                # Item.id
  dropRate: "100%"
  quantity: [1, 3]
```

### 4.4 Location-Pal Relationship

```yaml
Habitat:
  palId: "anubis"
  locationId: "desert_day"
  spawnRate: "Rare"               # Common | Uncommon | Rare | Boss
  timeRestriction: "day"          # day | night | always
```

---

## 五、Decision Layer（推荐逻辑）

> 这是和 Wiki 的本质区别。Wiki 告诉你 Anubis 是什么，Decision Engine 告诉你在你的情况下该不该用 Anubis。

### 5.1 Decision 结构

```yaml
Decision:
  id: "best-pals-mining"
  gameId: "palworld"
  type: "ranking"                 # ranking | compare | recommend

  # 玩家在想什么
  question:
    zh: "我的基地缺矿工，应该用哪个帕鲁？"
    en: "What is the best Pal for mining?"

  # 筛选/排序逻辑
  logic:
    primarySort: "scores.mining"  # 按决策评分降序
    secondarySort: "stats.speed"  # 副排序
    filters:                      # 硬筛选条件
      - field: "workSuitability.mining"
        operator: "gte"
        value: 2                  # 至少采矿2级以上
    weightings:                   # 综合评分的权重
      workEfficiency: 0.5         # 工作效率
      speed: 0.15                 # 移动速度（影响实际产出）
      foodConsumption: 0.1        # 饮食消耗（反向）
      accessibility: 0.25         # 获取难度（前期可获取加分）

  # SEO
  seo:
    title: "Best Mining Pals in Palworld 2026"
    keywords: ["palworld best mining pal", "mining pal tier list"]
    description: "Ranked list of the best Pals for mining..."
```

### 5.2 MVP 第一版决策场景（6 个）

```
1. Mining      → /best-pals/mining       "采矿用哪个帕鲁？"
2. Transport   → /best-pals/transport    "搬运用哪个帕鲁？"
3. Farming     → /best-pals/farming      "种地用哪个帕鲁？"
4. Combat      → /best-pals/combat       "战斗用哪个帕鲁？"
5. Flying Mount → /best-mounts/flying    "飞行坐骑选哪个？"
6. Base Worker → /best-pals/base         "基地工人怎么配？"
```

### 5.3 Pal 上的 decision 字段如何驱动决策页

```
决策页 /best-pals/mining 的生成逻辑：

1. 查询所有 Pal 中 decision.bestFor 包含 "mining" 的
2. 按 decision.scores.mining 降序排列
3. 取 Top 20
4. 对每个结果，输出：
   - Pal 名称、图片、基础属性
   - workSuitability.mining 值
   - decision.scores.mining 及上榜理由
   - 获取难度（decision.gameStage）
   - 链接到 /pal/{slug} 详情页
   - 链接到 /breeding-calculator（"想培育它？"）
```

---

## 六、SEO 页面生成系统

### 6.1 总体规则

> **数据 → 模板 → 页面。零人工。**

```
数据源（YAML/JSON）
    ↓
构建脚本（Node.js）
    ↓
模板渲染（Handlebars/Mustache）
    ↓
静态 HTML 页面
    ↓
部署到 Cloudflare Pages
```

### 6.2 四类页面及生成规则

#### 类型 1：Pal 实体页 `/pal/{slug}`

| 属性 | 值 |
|------|-----|
| 数量 | 200 页 |
| SEO 意图 | "anubis palworld"、"jetragon stats" |
| 数据源 | Pal 实体 + Relation Layer |

**模板区域：**
```
1. 标题：{name} - Palworld Guide
2. 基本信息：元素、稀有度、体型
3. Stats 面板：HP/ATK/DEF/SPD
4. 工作能力面板：各 workSuitability 值可视化
5. 最佳用途（来自 decision.bestFor）→ 链接到决策页
6. 技能列表
7. 获取方式：栖息地、捕捉、配种
8. 繁殖配方（来自 Relation Layer）→ 链接到 Breeding Calculator
9. 掉落物品（来自 Drop Relation）→ 链接到 Item 页
10. 相关决策页链接
11. 相关工具链接
```

#### 类型 2：决策页 `/best-pals/{scenario}`

| 属性 | 值 |
|------|-----|
| 数量 | 30 页（MVP 先做 6 个核心场景） |
| SEO 意图 | "best pal for mining"、"best mining pal palworld" |
| 数据源 | Decision Layer + Pal 实体 |

**模板区域：**
```
1. 标题：Best {Scenario} Pals in Palworld
2. 场景说明
3. 排名表格（自动生成 Top 20）
   - Rank | 图片 | 名称 | 评分 | 核心优势 | 获取难度
4. 每个 Pal 的详细说明卡片
5. 对比工具入口 → Pal Finder
6. 相关工具：Breeding Calculator、Resource Calculator
```

**生成规则（伪代码）：**
```javascript
function generateDecisionPage(decision) {
  const pals = getAllPals()
    .filter(p => p.decision.bestFor.includes(decision.target))
    .sort((a, b) => b.decision.scores[decision.target] - a.decision.scores[decision.target])
    .slice(0, 20)
  
  // pals 已排序，直接渲染模板
  return renderTemplate('decision-page', { decision, pals })
}
```

#### 类型 3：问题页 `/how-to-{action}`

| 属性 | 值 |
|------|-----|
| 数量 | 按需（MVP 先做 10 个高频问题） |
| SEO 意图 | "how to get anubis"、"how to catch legendaries" |
| 数据源 | 多实体组合查询 |

```
示例 /how-to-get-anubis：
  1. 栖息地信息（来自 Habitat Relation）
  2. 捕捉建议
  3. 配种配方（来自 Breeding Relation）
  4. 替代方案：如果太难，可以先用这些 Pal...
  5. 链接到 Pal Finder / Breeding Calculator
```

#### 类型 4：工具页 `/pal-finder` `/breeding-calculator`

| 属性 | 值 |
|------|-----|
| 数量 | 3 页 |
| SEO 意图 | "palworld breeding calculator" |
| 实现 | 客户端交互（纯前端，读取同一份数据 JSON） |

---

## 七、SEO 内部链接蜘蛛网

### 7.1 链接规则

**每个实体页必须包含以下出链：**

```
/pal/anubis
  ├── → /best-pals/mining          (Anubis 的 bestFor 包含 mining)
  ├── → /best-pals/base            (Anubis 的 bestFor 包含 base)
  ├── → /best-pals/combat          (Anubis 的 bestFor 包含 combat)
  ├── → /pal-finder                (工具入口)
  ├── → /breeding-calculator       (工具入口)
  ├── → /how-to-get-anubis         (获取方式)
  └── → 相关 Pal 实体页            (同栖息地/同元素)
```

**每个决策页必须包含以下出链：**

```
/best-pals/mining
  ├── → /pal/anubis                (排名第1的Pal)
  ├── → /pal/digtoise              (排名第2的Pal)
  ├── → ...                        (Top 10 每个都有链接)
  ├── → /pal-finder                (工具入口)
  ├── → /best-pals/base            (相关决策页)
  └── → /breeding-calculator       (想培育这些Pal？)
```

### 7.2 数据结构驱动的内链生成

```javascript
function generateInternalLinks(pal) {
  const links = []
  
  // 1. 决策页链接
  pal.decision.bestFor.forEach(scenario => {
    links.push({ url: `/best-pals/${scenario}`, text: `Best ${scenario} Pals` })
  })
  
  // 2. 工具页链接
  links.push({ url: '/pal-finder', text: 'Pal Finder' })
  
  if (pal.breeding.isBreedable) {
    links.push({ url: '/breeding-calculator', text: 'Breeding Calculator' })
  }
  
  // 3. 获取方式页
  links.push({ url: `/how-to-get-${pal.slug}`, text: `How to Get ${pal.name.en}` })
  
  // 4. 同元素 Pal
  const sameElement = getPalsByElement(pal.classification.elements[0])
    .filter(p => p.id !== pal.id)
    .slice(0, 5)
  sameElement.forEach(p => {
    links.push({ url: `/pal/${p.slug}`, text: p.name.en })
  })
  
  return links
}
```

### 7.3 结构化数据标记

每个页面带上 Schema.org JSON-LD：

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "Palworld",
  "character": {
    "@type": "Thing",
    "name": "Anubis",
    "description": "Ground element Pal..."
  }
}
</script>
```

---

## 八、MVP 第一阶段数据范围

### 8.1 数据量

| 实体类型 | 数量 | 字段完整度 |
|---------|------|-----------|
| Pal | 200 | 必填字段 100% |
| Item | 80（常用物品） | 核心字段 |
| Building | 40（核心建筑） | 核心字段 |
| Location | 30（主要区域） | 基础字段 |
| Breeding | 50（特殊配方）+ 通用公式 | 核心 |
| Recommendation | 6 场景 × 20 Pal | 完整 |
| Decision | 6 个场景 | 完整 |

### 8.2 页面量

| 页面类型 | URL 模式 | 数量 | 优先级 |
|---------|---------|------|--------|
| Pal 实体页 | `/pal/{slug}` | 200 | P0 |
| 决策页 | `/best-pals/{scenario}` | 6（核心）→ 30（扩展） | P0 |
| 问题页 | `/how-to-{action}` | 10 | P1 |
| 工具页 | `/pal-finder` 等 | 3 | P0 |
| 静态页 | `/` `/about` `/privacy` | 5 | P0 |

**总计：~218 个 SEO 着陆页（第一阶段）**

---

## 九、数据文件组织

```
/data/
  game.yaml              # Game 基础信息
  pals/
    anubis.yaml          # 每个 Pal 一个文件
    jetragon.yaml
    digtoise.yaml
    ...（200 个）
  items/
    ore.yaml
    pal_metal_ingot.yaml
    ...（80 个）
  buildings/
    improved_furnace.yaml
    ...（40 个）
  locations/
    desert_day.yaml
    ...（30 个）
  relations/
    breeding.yaml        # 所有 Breeding 关系
    recommendations.yaml  # 所有 Best Use 关系
    drops.yaml           # 所有 Drop 关系
  decisions/
    mining.yaml          # 每个决策场景一个文件
    transport.yaml
    farming.yaml
    combat.yaml
    flying-mount.yaml
    base-worker.yaml
  seo/
    internal-links.yaml  # 内链规则配置
```

---

## 十、数据流转关系

```
┌─────────────────────────────────────────────────────┐
│                    DATA LAYER                        │
│  /data/pals/*.yaml  /data/items/*.yaml  ...         │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│                 BUILD PROCESS                        │
│                                                      │
│  1. 读取所有 YAML → 合并为 palData.json              │
│  2. 模板引擎渲染：                                    │
│     ├── /pal/{slug}      ← Pal entities              │
│     ├── /best-pals/{s}   ← Decision + Pal            │
│     ├── /how-to-{action} ← Relations + Pal           │
│     └── /tools/*         ← 客户端读取 palData.json   │
│  3. 生成 sitemap.xml                                 │
│  4. 注入 Schema.org JSON-LD                          │
│  5. 部署到 Cloudflare Pages                           │
│                                                      │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│               OUTPUT (Cloudflare Pages)              │
│                                                      │
│  /pal/anubis.html            实体页                  │
│  /best-pals/mining.html      决策页                  │
│  /pal-finder.html            工具页（SPA）            │
│  /api/palData.json           客户端 API              │
│  /sitemap.xml                                         │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 十一、设计原则总结

| 原则 | 说明 |
|------|------|
| **数据驱动** | 所有页面从数据生成，零手动 HTML 编写 |
| **关系显式化** | 不用隐式关联，所有关系都是数据 |
| **决策优先** | 每个 Pal 必须有 decision 标签，否则只是半成品 |
| **游戏无关** | Schema 顶层的 Game + Entity + Relation + Decision 结构直接复用到 Minecraft/ARK |
| **静态优先** | 能构建时生成的绝不在运行时计算 |
| **移动优先** | 所有模板以移动端为第一视口设计 |
| **链接蜘蛛网** | 每个页面自动织入内链网络，不断手动添加 |
