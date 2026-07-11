#!/usr/bin/env node
/**
 * Palworld Pal Database Builder
 * Generates individual Pal JSON files from compact game data definitions.
 *
 * Run once to populate data/pals/, then run build.js to generate HTML.
 * Usage: node scripts/build-pal-database.js
 */

const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'data', 'pals');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// ─── Element & work type definitions ─────────────────────────
const E = {
  N: 'Neutral', F: 'Fire', W: 'Water', G: 'Grass', L: 'Electric',
  I: 'Ice', D: 'Dark', Gr: 'Ground', Dr: 'Dragon',
};

// ─── Compact Pal definitions ─────────────────────────────────
// [number, id, enName, zhName, elements, rarity, size, rideable, flyable,
//  hp, atk, def, spd, sta,
//  kindling, watering, planting, generating, handiwork, gathering, lumbering, mining, medicine, cooling, transporting, farming,
//  breedingPower, partnerSkillName, partnerSkillDesc,
//  habitats[], bestFor[], gameStage (E=early, M=mid, L=late)]
//
// rarity: 1=Common 2=Uncommon 3=Rare 4=Epic 5=Legendary
// size: 1=Small 2=Medium 3=Large 4=Huge

const PALS = [
  // ── Starting Area ──
  [1,  'lamball',     'Lamball',     '棉悠悠',   [E.N],     1, 1, 0, 0,  70,70,70,40,100,  0,0,0,0,1,0,0,0,0,0,1,1,    1470, 'Fluffy Shield', 'When activated, shields the player with fluffy wool, reducing damage taken.', ['grassy_fields','starting_area'], ['farming'], 'E'],
  [2,  'cattiva',     'Cattiva',     '捣蛋猫',   [E.N],     1, 1, 0, 0,  70,70,70,70,100,  0,0,0,0,1,1,0,1,0,0,1,0,    1460, 'Cat Helper', 'While at base, helps carry items and increases player carrying capacity.', ['grassy_fields','starting_area'], ['transport','mining'], 'E'],
  [3,  'chikipi',     'Chikipi',     '皮皮鸡',   [E.N],     1, 1, 0, 0,  60,60,60,50,80,   0,0,0,0,0,1,0,0,0,0,0,1,    1500, 'Egg Layer', 'When assigned to a Ranch, lays Eggs that can be collected for cooking.', ['grassy_fields','starting_area'], ['farming'], 'E'],
  [4,  'lifmunk',     'Lifmunk',     '翠叶鼠',   [E.G],     1, 1, 0, 0,  75,75,65,80,100,  0,0,1,0,1,1,1,0,0,0,0,0,    1430, 'Lifmunk Recoil', 'Jumps onto the player\'s head and fires a submachine gun at enemies.', ['grassy_fields','forest'], ['gathering','combat','handiwork'], 'E'],
  [5,  'foxparks',    'Foxparks',    '火绒狐',   [E.F],     1, 1, 0, 0,  65,70,60,80,100,  1,0,0,0,0,0,0,0,0,0,0,0,    1400, 'Huggy Fire', 'When activated, Foxparks breathes fire continuously at enemies.', ['grassy_fields','starting_area'], ['kindling','combat'], 'E'],
  [6,  'fuack',       'Fuack',       '冲浪鸭',   [E.W],     1, 1, 0, 0,  75,65,70,60,100,  0,1,0,0,0,0,0,0,0,0,0,0,    1420, 'Surfing Duck', 'When activated, Fuack rides on a wave, allowing travel across water.', ['beach','lake'], ['watering'], 'E'],
  [7,  'sparkit',     'Sparkit',     '电棘鼠',   [E.L],     1, 1, 0, 0,  65,75,60,85,100,  0,0,0,1,0,0,0,0,0,0,0,0,    1410, 'Static Electricity', 'Generates electricity when assigned to a Power Generator.', ['grassy_fields','forest'], ['generating','combat'], 'E'],
  [8,  'tanzee',      'Tanzee',      '遁地鼠',   [E.G],     1, 1, 0, 0,  80,65,75,55,100,  0,0,2,0,1,1,1,0,0,0,0,0,    1410, 'Cheery Power', 'Increases the attack of Grass-type Pals in the party.', ['grassy_fields','forest'], ['planting','gathering'], 'E'],
  [9,  'rooby',       'Rooby',       '火羽鸡',   [E.F],     1, 1, 0, 0,  60,65,60,70,100,  1,0,0,0,0,0,0,0,0,0,0,0,    1440, 'Red Egg', 'When activated, launches a flaming egg that explodes on impact.', ['grassy_fields'], ['kindling'], 'E'],

  // ── Water / Ice Starters ──
  [10, 'pengullet',   'Pengullet',   '企丸丸',   [E.W,E.I], 1, 1, 0, 0,  65,65,75,45,100,  0,1,0,0,0,0,0,0,0,1,0,0,    1390, 'Pengullet Cannon', 'When activated, launches itself like a rocket at enemies.', ['beach','snow_region'], ['watering','cooling'], 'E'],
  [11, 'penking',     'Penking',     '碧海龙',   [E.W,E.I], 3, 2, 0, 0,  110,105,100,60,130,  0,2,0,0,2,0,0,0,0,0,1,0,    520, 'Emperor of the Sea', 'When activated, boosts the attack of Water-type Pals in the party.', ['beach','dungeon'], ['watering','handiwork','combat'], 'M'],

  // ── Electric / Ice variants ──
  [12, 'jolthog',     'Jolthog',     '电刺猬',   [E.L],     1, 1, 0, 0,  60,65,60,70,100,  0,0,0,1,0,0,0,0,0,0,0,0,    1430, 'Electric Needle', 'When thrown, Jolthog electrifies the area, damaging nearby enemies.', ['grassy_fields'], ['generating'], 'E'],
  [13, 'jolthog_cryst','Jolthog Cryst','冰刺猬',  [E.I],     1, 1, 0, 0,  65,60,65,65,100,  0,0,0,0,0,0,0,0,0,1,0,0,    1420, 'Ice Needle', 'When thrown, releases a burst of freezing energy, slowing nearby enemies.', ['snow_region'], ['cooling'], 'E'],

  // ── Grass / Ground ──
  [14, 'gumoss',      'Gumoss',      '泥泥怪',   [E.G,E.Gr],1, 1, 0, 0,  80,55,85,30,90,   0,0,1,0,0,0,1,0,0,0,0,0,    1470, 'Muddy Buddy', 'When in party, reduces damage from Ground-type attacks.', ['forest','swamp'], ['planting','lumbering'], 'E'],

  // ── Fox variants ──
  [15, 'vixy',        'Vixy',        '幼狐',     [E.N],     1, 1, 0, 0,  65,70,65,90,100,  0,0,0,0,0,0,0,0,0,0,0,0,    1450, 'Dig Here!', 'When assigned to a Ranch, Vixy digs up items from underground.', ['grassy_fields','starting_area'], ['farming'], 'E'],

  // ── Dark types ──
  [16, 'hoocrates',   'Hoocrates',   '勾魂鱿',   [E.D],     2, 1, 0, 0,  70,80,55,60,100,  0,0,0,0,0,1,0,0,0,0,0,0,    1390, 'Dark Knowledge', 'Increases the attack of Dark-type Pals in the party.', ['forest','night'], ['gathering','combat'], 'E'],
  [17, 'depresso',    'Depresso',    '焦虑鳗',   [E.D],     1, 1, 0, 0,  65,60,60,40,80,   0,0,0,0,1,0,0,0,0,0,0,0,    1480, 'Caffeine Free', 'Consumes less food than other Pals. Works at normal speed despite low stats.', ['beach','cave'], ['handiwork'], 'E'],
  [18, 'daedream',    'Daedream',    '寐魔',     [E.D],     2, 1, 0, 0,  70,85,55,75,100,  0,0,0,0,1,1,0,0,0,0,0,0,    1310, 'Dream Chaser', 'Floats beside the player and attacks enemies automatically — a free party member.', ['forest','night'], ['combat','gathering'], 'E'],

  // ── More starters / early Pals ──
  [19, 'nox',         'Nox',         '暗猫',     [E.D],     2, 1, 0, 0,  80,90,65,85,110,  0,0,0,0,0,1,0,0,0,0,0,0,    1280, 'Night Stalker', 'Increases movement speed and attack at night.', ['forest','night'], ['combat'], 'M'],
  [20, 'mau',         'Mau',         '喵斯特',   [E.D],     2, 1, 0, 0,  70,75,60,90,100,  0,0,0,0,0,0,0,0,0,0,0,0,    1330, 'Gold Digger', 'When assigned to a Ranch, Mau digs up Gold Coins.', ['cave','night'], ['farming'], 'M'],
  [21, 'mau_cryst',   'Mau Cryst',   '冰喵斯特', [E.I],     2, 1, 0, 0,  75,70,65,85,100,  0,0,0,0,0,0,0,0,0,1,0,0,    1320, 'Gold Digger', 'When assigned to a Ranch, digs up Gold Coins. Ice variant.', ['snow_region'], ['cooling','farming'], 'M'],

  // ── Wolf line ──
  [22, 'direhowl',    'Direhowl',    '暴啸狼',   [E.N],     2, 2, 1, 0,  100,110,80,130,130, 0,0,0,0,0,0,0,0,0,0,0,0,    500, 'Direhowl Rider', 'Can be ridden. Moves faster than running and can double-jump while mounted.', ['volcano','forest'], ['mount-ground','combat'], 'M'],

  // ── Bird / Flying ──
  [23, 'tocotoco',    'Tocotoco',    '炸弹鸟',   [E.N,E.F], 2, 1, 0, 0,  50,40,50,80,100,  0,0,0,0,0,0,0,0,0,0,0,0,    1460, 'Explosive Eggs', 'Launches explosive eggs that damage enemies in an area.', ['volcano','desert'], ['combat'], 'E'],
  [24, 'flopie',      'Flopie',      '花丽娜',   [E.G],     2, 2, 0, 0,  85,75,80,60,110,  0,0,2,0,1,2,0,0,1,0,0,0,    1290, 'Flower Heal', 'Heals nearby allies over time when activated.', ['forest','garden'], ['planting','medicine','gathering'], 'M'],

  // ── Ranch / Farm ──
  [25, 'mozzarina',   'Mozzarina',   '奶牛',     [E.N],     1, 2, 0, 0,  90,60,80,40,100,  0,0,0,0,0,0,0,0,0,0,0,2,    1450, 'Milk Maker', 'When assigned to a Ranch, produces Milk.', ['grassy_fields'], ['farming'], 'E'],
  [26, 'bristla',     'Bristla',     '荆棘刺',   [E.G],     2, 2, 0, 0,  85,85,75,55,100,  0,0,0,0,0,2,0,0,1,0,0,0,    1300, 'Thorny Body', 'Reflects a portion of melee damage back to attackers.', ['forest','desert'], ['gathering','medicine'], 'M'],

  // ── Water fighters ──
  [27, 'gobfin',      'Gobfin',      '鲨小子',   [E.W],     2, 1, 0, 0,  80,90,75,100,110, 0,1,0,0,0,0,0,0,0,0,0,0,    1240, 'Angry Shark', 'Increases attack power when HP drops below 30%.', ['beach','ocean'], ['watering','combat'], 'M'],
  [28, 'gobfin_ignis','Gobfin Ignis','炎鲨小子', [E.F],     2, 1, 0, 0,  80,95,70,100,110, 2,0,0,0,0,0,0,0,0,0,0,0,    1230, 'Burning Shark', 'Increases attack power when HP drops below 30%. Fire variant.', ['volcano'], ['kindling','combat'], 'M'],

  // ── Hanging / Gliding ──
  [29, 'hangyu',      'Hangyu',      '叶泥泥',   [E.Gr],    2, 1, 0, 0,  90,60,100,30,100, 0,0,0,0,0,0,0,0,0,0,0,0,    1330, 'Flying Trapeze', 'Can be used as a glider. Allows the player to glide while holding Hangyu.', ['forest','mountain'], ['mount-flying'], 'E'],
  [30, 'hangyu_cryst','Hangyu Cryst','冰叶泥泥', [E.I],     2, 1, 0, 0,  95,55,105,30,100, 0,0,0,0,0,0,0,0,0,1,0,0,    1320, 'Ice Trapeze', 'Can be used as a glider. Ice variant — keeps the player cool in hot areas.', ['snow_region'], ['mount-flying','cooling'], 'E'],

  // ── Bear / Tank ──
  [31, 'mossanda',    'Mossanda',    '熊猫',     [E.G],     3, 3, 1, 0,  120,110,125,60,140, 0,0,2,0,0,0,2,0,0,0,1,0,    430, 'Grenadier Panda', 'Can be ridden. Launches explosive grenade-fists while mounted.', ['forest','bamboo_grove'], ['mount-ground','combat','lumbering'], 'M'],
  [32, 'mossanda_lux','Mossanda Lux','电熊猫',   [E.L],     3, 3, 1, 0,  125,115,120,60,140, 0,0,0,0,0,0,2,0,0,0,1,0,    425, 'Grenadier Panda Lux', 'Can be ridden. Launches electric grenade-fists while mounted.', ['forest'], ['mount-ground','combat','lumbering'], 'M'],

  // ── More flyers ──
  [33, 'nitewing',    'Nitewing',    '夜幕魔蝠', [E.N],     2, 2, 0, 1,  90,85,80,120,130, 0,0,0,0,0,0,0,0,0,0,0,0,    420, 'Travel Companion', 'First flying mount most players obtain. Can be ridden to fly across the map.', ['forest','mountain'], ['mount-flying'], 'M'],

  // ── Fire types ──
  [34, 'incineram',   'Incineram',   '炎魔羊',   [E.F],     3, 2, 1, 0,  110,115,85,100,130, 3,0,0,0,0,0,0,0,0,0,0,0,    470, 'Pyro Ram', 'Can be ridden. Charges forward and deals fire damage on impact.', ['volcano','desert'], ['kindling','mount-ground','combat'], 'M'],
  [35, 'incineram_noct','Incineram Noct','暗炎魔羊',[E.D],   3, 2, 1, 0,  110,120,85,105,130, 0,0,0,0,0,0,0,0,0,0,0,0,    460, 'Dark Ram', 'Can be ridden. Dark variant — charges forward and deals dark damage.', ['volcano','cave'], ['mount-ground','combat'], 'M'],

  // ── Moth / Bug ──
  [36, 'cinnamoth',   'Cinnamoth',   '肉桂蛾',   [E.G],     2, 2, 0, 0,  85,80,75,100,110, 0,0,1,0,0,0,0,0,0,0,0,0,    1280, 'Powder Scales', 'Scatters powder that poisons enemies in an area.', ['forest','garden'], ['planting','combat'], 'M'],

  // ── More Fire / Ice ──
  [37, 'arsox',       'Arsox',       '火牛',     [E.F],     3, 2, 1, 0,  120,115,100,70,140, 3,0,0,0,0,0,0,0,0,0,0,0,    430, 'Blazing Horn', 'Can be ridden. Charges enemies with flaming horns.', ['volcano','desert'], ['kindling','mount-ground','combat'], 'M'],
  [38, 'dumud',       'Dumud',       '呆泥鳗',   [E.Gr],    2, 2, 0, 0,  100,65,110,30,90,  0,0,0,0,0,0,0,2,0,0,0,0,    1340, 'Mud Bath', 'When in party, increases defense of Ground-type Pals.', ['swamp','cave'], ['mining'], 'M'],

  // ── Dark fighters ──
  [39, 'cawgnito',    'Cawgnito',    '异暗鸦',   [E.D],     2, 2, 0, 0,  70,95,55,105,110, 0,0,0,0,0,0,0,0,0,0,0,0,    1210, 'Telepeck', 'Teleports behind enemies and strikes with a powerful peck.', ['forest','night'], ['combat'], 'M'],
  [40, 'leezpunk',    'Leezpunk',    '朋克蜥',   [E.D],     2, 2, 0, 0,  85,90,70,110,120, 0,0,0,0,1,0,0,0,0,0,0,0,    1180, 'Sixth Sense', 'Detects nearby dungeons and shows them on the map.', ['cave','desert'], ['combat','handiwork'], 'M'],
  [41, 'leezpunk_ignis','Leezpunk Ignis','炎朋克蜥',[E.F],  2, 2, 0, 0,  85,95,70,110,120, 2,0,0,0,1,0,0,0,0,0,0,0,    1170, 'Sixth Sense Ignis', 'Fire variant — detects nearby dungeons. Also provides Kindling.', ['volcano'], ['kindling','handiwork'], 'M'],

  // ── Moon / Night ──
  [42, 'loupmoon',    'Loupmoon',    '月镰',     [E.D],     3, 2, 0, 0,  95,115,75,120,130, 0,0,0,0,0,0,0,0,0,0,0,0,    1080, 'Lunar Slash', 'Slashes enemies with moon-infused claws that ignore some armor.', ['forest','night','mountain'], ['combat'], 'M'],

  // ── Glider ──
  [43, 'galeclaw',    'Galeclaw',    '风爪',     [E.N],     2, 2, 0, 0,  85,80,75,140,120, 0,0,0,0,0,0,0,0,0,0,0,0,    1240, 'Galeclaw Rider', 'Can be used as a glider. Fastest gliding speed in the game.', ['mountain','forest'], ['mount-flying'], 'M'],

  // ── Grass archer ──
  [44, 'robinquill',  'Robinquill',  '叶箭雀',   [E.G],     3, 2, 0, 0,  85,120,65,90,120,  0,0,1,0,0,2,0,0,0,0,0,0,    1140, 'Hawkeye Arrow', 'Fires a powerful arrow that pierces through multiple enemies.', ['forest','mountain'], ['combat','gathering'], 'M'],
  [45, 'robinquill_terra','Robinquill Terra','地箭雀',[E.Gr],3, 2, 0, 0,  90,115,70,85,120,  0,0,0,0,0,2,0,1,0,0,0,0,    1130, 'Earth Arrow', 'Ground variant — fires arrows that cause tremors on impact.', ['desert','mountain'], ['combat','mining','gathering'], 'M'],

  // ── Gorilla ──
  [46, 'gorirat',     'Gorirat',     '暴猿',     [E.N],     3, 3, 1, 0,  130,130,110,75,150, 0,0,0,0,1,0,2,0,0,0,1,0,    410, 'Rampage', 'Can be ridden. Massive AOE ground pound while mounted.', ['forest','mountain'], ['mount-ground','combat','lumbering'], 'M'],

  // ── Bee line ──
  [47, 'beegarde',   'Beegarde',     '幼蜂',     [E.G],     2, 1, 0, 0,  55,50,50,110,80,  0,0,1,0,0,1,0,0,0,0,0,1,    1280, 'Worker Bee', 'When in party, increases the work speed of all base Pals.', ['forest','garden'], ['planting','gathering','farming'], 'E'],
  [48, 'elizabee',   'Elizabee',     '女王蜂',   [E.G],     3, 2, 0, 1,  90,95,85,85,120,   0,0,2,0,0,2,0,0,1,0,0,1,    1150, 'Queen\'s Command', 'When activated, calls Beegarde allies to swarm and attack the target.', ['forest','garden'], ['combat','planting','medicine','farming'], 'M'],

  // ── Cat ──
  [49, 'grintale',   'Grintale',     '狞笑猫',   [E.N],     3, 2, 1, 0,  100,100,80,120,120, 0,0,0,0,0,0,0,0,0,0,0,0,    1110, 'Cheshire Grin', 'When activated, confuses nearby enemies, reducing their accuracy.', ['forest','mountain'], ['mount-ground','combat'], 'M'],

  // ── Fluffy / Ice ──
  [50, 'swee',       'Swee',         '绒绒',     [E.N],     2, 2, 0, 0,  110,50,100,40,130,  0,0,0,0,0,0,0,0,0,0,0,3,    1300, 'Fluffy Body', 'Reduces damage from Neutral-type attacks. Produces Wool at Ranch.', ['snow_region','mountain'], ['farming'], 'M'],
  [51, 'sweepa',     'Sweepa',       '绒霸',     [E.N],     3, 3, 1, 0,  150,80,140,55,160,  0,0,0,0,0,0,0,0,0,0,0,3,    380, 'Fluffy King', 'When activated, Sweepa\'s fur expands, greatly increasing defense.', ['snow_region','mountain'], ['farming','mount-ground'], 'L'],

  // ── Dragon ──
  [52, 'chillet',    'Chillet',      '滑水蛇',   [E.I,E.Dr],3, 2, 1, 0,  100,100,85,95,120,  0,1,0,0,0,0,0,0,0,1,0,0,    460, 'Serpent Slither', 'Can be ridden. Slides across terrain quickly. Boosts Ice and Dragon attacks while mounted.', ['snow_region','lake'], ['mount-ground','cooling','combat'], 'M'],

  // ── Electric ──
  [53, 'univolt',    'Univolt',      '独角马',   [E.L],     3, 2, 1, 0,  100,105,80,130,130, 0,0,0,2,0,0,0,0,0,0,0,0,    470, 'Thunder Rush', 'Can be ridden. Dashes forward and strikes with lightning.', ['forest','mountain'], ['generating','mount-ground','combat'], 'M'],
  [54, 'foxcicle',   'Foxcicle',     '冰狐狸',   [E.I],     3, 2, 1, 0,  95,100,85,115,120,  0,0,0,0,0,0,0,0,0,2,0,0,    460, 'Aurora Veil', 'Creates a protective ice shield that absorbs damage.', ['snow_region'], ['cooling','combat'], 'M'],

  // ── Horse / Fire ──
  [55, 'pyrin',      'Pyrin',        '火麒麟',   [E.F],     4, 3, 1, 0,  120,130,100,140,150, 3,0,0,0,0,0,0,0,0,0,0,0,    370, 'Blazing Steed', 'Can be ridden. Fastest ground mount with fire trail behind it.', ['volcano'], ['kindling','mount-ground','combat'], 'L'],
  [56, 'pyrin_noct', 'Pyrin Noct',   '暗火麒麟', [E.F,E.D], 4, 3, 1, 0,  125,135,95,140,150,  2,0,0,0,0,0,0,0,0,0,0,0,    360, 'Dark Flames', 'Can be ridden. Leaves a trail of dark fire. Boosts Dark and Fire attacks while mounted.', ['volcano','night'], ['kindling','mount-ground','combat'], 'L'],

  // ── Ice deer ──
  [57, 'reindrix',   'Reindrix',     '冰角鹿',   [E.I],     3, 3, 1, 0,  115,110,105,90,140,  0,0,0,0,0,0,2,0,0,2,0,0,    420, 'Frozen Antler', 'Charges enemies with ice-covered antlers that freeze on impact.', ['snow_region','mountain'], ['cooling','lumbering','mount-ground'], 'M'],

  // ── Electric hound ──
  [58, 'rayhound',   'Rayhound',     '电犬',     [E.L],     3, 2, 1, 0,  95,105,80,145,130,  0,0,0,2,0,0,0,0,0,0,0,0,    440, 'Lightning Sprint', 'Can be ridden. Extremely fast sprint with a lightning dash.', ['desert','mountain'], ['generating','mount-ground','combat'], 'M'],

  // ── Kitsune ──
  [59, 'kitsun',     'Kitsun',       '九尾狐',   [E.F],     4, 2, 1, 0,  95,115,80,120,130,  2,0,0,0,0,0,0,0,0,0,0,0,    430, 'Fox Fire', 'Summons spirit flames that home in on enemies.', ['volcano','mountain'], ['kindling','combat'], 'L'],

  // ── Cloud critter ──
  [60, 'dazzi',      'Dazzi',        '云朵朵',   [E.L],     2, 1, 0, 0,  60,75,55,100,100,  0,0,0,1,0,0,0,0,0,0,0,0,    1320, 'Cloud Nine', 'Floats beside the player and provides passive electric support.', ['mountain','sky'], ['generating'], 'M'],

  // ── Moon ──
  [61, 'lunaris',    'Lunaris',      '月华',     [E.N],     3, 2, 0, 0,  90,85,80,100,120,  0,0,0,0,2,0,0,0,0,0,0,0,    1160, 'Moonlight', 'Boosts work speed of base Pals at night.', ['mountain','night'], ['handiwork'], 'M'],

  // ── Dragon / Grass ──
  [62, 'dinossom',   'Dinossom',     '花冠龙',   [E.G,E.Dr],3,3, 1, 0,  130,120,115,70,150, 0,0,3,0,0,0,2,0,0,0,1,0,    390, 'Fragrant Dragon', 'Can be ridden. Releases healing pollen that restores ally HP over time.', ['forest','garden'], ['planting','lumbering','mount-ground'], 'M'],
  [63, 'dinossom_lux','Dinossom Lux','电花冠龙', [E.L,E.Dr],3,3, 1, 0,  130,125,110,75,150,  0,0,0,2,0,0,2,0,0,0,1,0,    385, 'Thunder Dragon', 'Can be ridden. Electric variant — releases thunder pollen that paralyzes enemies.', ['forest','mountain'], ['generating','lumbering','mount-ground'], 'M'],

  // ── Sea serpent ──
  [64, 'surfent',    'Surfent',      '海蛇',     [E.W],     3, 2, 0, 0,  95,100,80,110,120,  0,1,0,0,0,0,0,0,0,0,0,0,    480, 'Surfing Serpent', 'Can be ridden on water. Moves very fast while swimming.', ['ocean','beach'], ['watering','mount-ground'], 'M'],
  [65, 'surfent_terra','Surfent Terra','地蛇',   [E.Gr],    3, 2, 0, 0,  100,95,85,100,120,  0,0,0,0,0,0,0,2,0,0,0,0,    475, 'Burrowing Serpent', 'Can burrow underground and emerge to strike enemies from below.', ['desert','cave'], ['mining'], 'M'],

  // ── Ghost ──
  [66, 'maraith',    'Maraith',      '阴魂犬',   [E.D],     3, 2, 0, 0,  80,115,60,125,120,  0,0,0,0,0,0,0,0,0,0,0,0,    1090, 'Ghost Howl', 'Wails at enemies, lowering their attack and defense.', ['night','cave'], ['combat'], 'M'],

  // ── Turtle / Miner ──
  [67, 'digtoise',   'Digtoise',     '掘地龟',   [E.Gr],    3, 2, 0, 0,  100,85,130,40,120,  0,0,0,0,0,0,0,3,0,0,0,0,    440, 'Burrow Spin', 'Spins rapidly to drill through rocks — extremely efficient at ore mining.', ['desert','cave'], ['mining'], 'M'],

  // ── Bat ──
  [68, 'tombat',     'Tombat',       '墓穴蝠',   [E.D],     3, 2, 0, 0,  90,100,70,130,120,  0,0,0,0,0,0,0,0,0,0,0,0,    1130, 'Ultrasonic', 'Emits ultrasonic waves that reveal nearby resources and enemies.', ['cave','night'], ['combat'], 'M'],

  // ── Love / Neutral ──
  [69, 'lovander',   'Lovander',     '求爱蜥',   [E.N],     3, 2, 0, 0,  100,90,85,95,120,  0,0,0,0,0,0,0,0,1,0,0,0,    1170, 'Heart Drain', 'Drains HP from enemies and transfers it to the player.', ['desert','cave'], ['medicine'], 'M'],

  // ── Dragon riders ──
  [70, 'vanwyrm',    'Vanwyrm',      '炎翼龙',   [E.F,E.D], 3, 3, 0, 1,  110,125,95,120,140, 2,0,0,0,0,0,0,0,0,0,1,0,     380, 'Flying Wyrm', 'Can be ridden as a flying mount. Average speed, good combat ability.', ['volcano'], ['kindling','mount-flying','combat'], 'M'],
  [71, 'vanwyrm_cryst','Vanwyrm Cryst','冰翼龙', [E.I,E.D], 3, 3, 0, 1,  115,120,100,120,140, 0,0,0,0,0,0,0,0,0,2,1,0,     375, 'Frozen Wyrm', 'Ice variant flying mount. Freezes enemies with breath attack while mounted.', ['snow_region'], ['cooling','mount-flying','combat'], 'M'],

  // ── Samurai ──
  [72, 'bushi',      'Bushi',        '武士',     [E.F],     3, 2, 0, 0,  95,120,80,100,120,  0,0,0,0,1,0,1,0,0,0,0,0,    1120, 'Bushido', 'Performs a powerful iai slash. Damage increases the longer Bushi has not attacked.', ['volcano','forest'], ['combat','kindling','lumbering'], 'M'],

  // ── Eagle / Flying ──
  [73, 'beakon',     'Beakon',       '雷鹰',     [E.L],     4, 3, 0, 1,  110,120,90,150,140, 0,0,0,3,0,0,0,0,0,0,0,0,     340, 'Thunderbird', 'Can be ridden as a flying mount. Very fast flight speed. Electric attacks while mounted.', ['desert','mountain'], ['generating','mount-flying','combat'], 'L'],
  [74, 'ragnahawk',  'Ragnahawk',    '焰鹰',     [E.F],     4, 3, 0, 1,  115,125,85,140,140, 3,0,0,0,0,0,0,0,0,0,0,0,     350, 'Flame Wing', 'Can be ridden as a flying mount. Drops fire bombs while mounted.', ['volcano'], ['kindling','mount-flying','combat'], 'L'],

  // ── Witch / Mage ──
  [75, 'katress',    'Katress',      '女巫猫',   [E.D],     3, 2, 0, 0,  85,130,65,110,120,  0,0,0,0,2,0,0,0,0,0,0,0,    1040, 'Dark Arts', 'Boosts the attack of Dark-type Pals in the party. Magic projectiles while active.', ['cave','night'], ['handiwork','combat'], 'M'],
  [76, 'wixen',      'Wixen',        '巫狐',     [E.F],     3, 2, 0, 0,  85,125,70,105,120,  2,0,0,0,2,0,0,0,0,0,0,0,    1020, 'Fire Magic', 'Launches fire orbs that home in on enemies. Crafting speed boost.', ['volcano','forest'], ['kindling','handiwork','combat'], 'M'],

  // ── Grass runner ──
  [77, 'verdash',    'Verdash',      '草遁兔',   [E.G],     3, 2, 1, 0,  90,100,75,140,130,  0,0,2,0,0,2,0,0,0,0,0,0,    1050, 'Grass Dash', 'Can be ridden. Extremely fast sprint speed on grass terrain.', ['forest','garden'], ['planting','gathering','mount-ground'], 'M'],
  [78, 'vaelet',     'Vaelet',       '仙草',     [E.G],     2, 2, 0, 0,  80,70,80,90,110,   0,0,2,0,0,2,0,0,0,0,0,0,    1220, 'Healing Aroma', 'Passively heals nearby Pals in the base over time.', ['garden','forest'], ['planting','gathering'], 'M'],

  // ── Ice bird ──
  [79, 'sibelyx',    'Sibelyx',      '冰羽',     [E.I],     3, 2, 0, 1,  95,105,80,130,130,  0,0,0,0,0,0,0,0,0,2,0,0,    410, 'Snow Storm', 'Can be ridden as a flying mount. Creates a snowstorm that damages nearby enemies.', ['snow_region'], ['cooling','mount-flying','combat'], 'M'],

  // ── Dragon line ──
  [80, 'elphidran',  'Elphidran',    '绿牙龙',   [E.Dr],    3, 3, 0, 1,  120,115,100,100,140, 0,0,0,0,0,0,1,0,0,0,1,0,     390, 'Dragon Flight', 'Can be ridden as a flying mount. Dragon breath attack while mounted.', ['mountain','forest'], ['mount-flying','lumbering','combat'], 'M'],
  [81, 'elphidran_aqua','Elphidran Aqua','水牙龙',[E.W,E.Dr],3,3,0,1, 120,110,105,100,140, 0,2,0,0,0,0,1,0,0,0,1,0,     385, 'Aqua Flight', 'Water variant flying mount. Water breath attack while mounted.', ['lake','ocean'], ['watering','mount-flying','combat'], 'M'],

  // ── Tiny sea / fire ──
  [82, 'kelpsea',    'Kelpsea',      '海藻球',   [E.W],     1, 1, 0, 0,  60,50,55,70,80,    0,1,0,0,0,0,0,0,0,0,0,0,    1480, 'Kelp Cloud', 'Sprays water at enemies in a wide arc.', ['beach','ocean'], ['watering'], 'E'],
  [83, 'kelpsea_ignis','Kelpsea Ignis','火藻球', [E.F],     1, 1, 0, 0,  60,55,50,70,80,    1,0,0,0,0,0,0,0,0,0,0,0,    1470, 'Flame Cloud', 'Fire variant — sprays fire at enemies in a wide arc.', ['volcano'], ['kindling'], 'E'],

  // ── Water dragon ──
  [84, 'azurobe',    'Azurobe',      '苍水龙',   [E.W,E.Dr],4, 3, 0, 1,  130,110,120,90,150,  0,3,0,0,0,0,0,0,0,0,1,0,     310, 'Water Dragon', 'Can be ridden as a flying mount over water. Water dragon breath while mounted.', ['lake','ocean'], ['watering','mount-flying','combat'], 'L'],

  // ── Ice lynx ──
  [85, 'cryolinx',   'Cryolinx',     '冰晶猞猁',[E.I],     3, 2, 1, 0,  100,105,95,125,130,  0,0,0,0,0,0,0,0,0,2,0,0,    420, 'Ice Claws', 'Can be ridden. Slashes with ice claws that cause frostbite.', ['snow_region'], ['cooling','mount-ground','combat'], 'M'],
  [86, 'cryolinx_terra','Cryolinx Terra','地晶猞猁',[E.I,E.Gr],3,2,1,0, 105,100,100,120,130, 0,0,0,0,0,0,0,1,0,1,0,0,    415, 'Frozen Earth', 'Ground variant. Claws cause both frostbite and tremors.', ['snow_region','cave'], ['mining','cooling','combat'], 'M'],

  // ── Lion ──
  [87, 'blazehowl',  'Blazehowl',    '炎吼狮',   [E.F],     4, 3, 1, 0,  140,145,115,110,160, 3,0,0,0,0,0,0,0,0,0,0,0,    280, 'King\'s Roar', 'Can be ridden. Roar boosts the attack of all Fire-type Pals in the party.', ['volcano'], ['kindling','mount-ground','combat'], 'L'],
  [88, 'blazehowl_noct','Blazehowl Noct','暗吼狮',[E.F,E.D],4,3,1,0, 145,150,110,115,160, 2,0,0,0,0,0,0,0,0,0,0,0,    270, 'Dark Roar', 'Dark variant. Roar boosts Fire and Dark attacks of all Pals in the party.', ['volcano','night'], ['kindling','mount-ground','combat'], 'L'],

  // ── Relaxing dragon ──
  [89, 'relaxaurus', 'Relaxaurus',   '呆龙',     [E.W,E.Dr],3, 3, 0, 0,  140,90,120,40,160,   0,2,0,0,0,0,0,0,0,0,1,0,     330, 'Big Splash', 'Jumps and lands with a huge splash, damaging all enemies in a wide area.', ['lake','ocean'], ['watering','transport'], 'M'],
  [90, 'relaxaurus_lux','Relaxaurus Lux','电呆龙',[E.L,E.Dr],3,3,0,0,  145,95,115,40,160,   0,0,0,3,0,0,0,0,0,0,1,0,     325, 'Thunder Splash', 'Electric variant. Jump-crash generates a massive electric shockwave.', ['lake','desert'], ['generating','transport'], 'M'],

  // ── Big grass ──
  [91, 'broncherry', 'Broncherry',   '巨花兽',   [E.G],     3, 3, 1, 0,  130,105,130,55,150,  0,0,3,0,0,0,0,0,0,0,1,0,    350, 'Flower Shield', 'Creates a protective shield of flowers that absorbs damage for all allies.', ['forest','garden'], ['planting','transport'], 'M'],
  [92, 'broncherry_aqua','Broncherry Aqua','水花兽',[E.G,E.W],3,3,1,0, 130,100,135,55,150,  0,3,2,0,0,0,0,0,0,0,1,0,    345, 'Aqua Shield', 'Water variant. Shield also heals allies over time.', ['lake','garden'], ['watering','planting','transport'], 'M'],

  // ── Petal / Grass ──
  [93, 'petallia',   'Petallia',     '花冠',     [E.G],     3, 2, 0, 0,  90,80,85,95,120,   0,0,3,0,0,2,0,0,0,0,0,0,    1130, 'Petal Dance', 'Summons a whirlwind of flower petals that damages and confuses enemies.', ['garden','forest'], ['planting','gathering'], 'M'],

  // ── Turtle volcano ──
  [94, 'reptyro',    'Reptyro',      '熔岩龟',   [E.F,E.Gr],4, 3, 0, 0,  140,130,150,30,160, 3,0,0,0,0,0,0,3,0,0,0,0,     290, 'Magma Shell', 'Withdraws into shell and erupts, dealing massive fire damage in a large area.', ['volcano'], ['kindling','mining'], 'L'],
  [95, 'reptyro_cryst','Reptyro Cryst','冰晶龟', [E.I,E.Gr],4, 3, 0, 0,  145,125,155,30,160, 0,0,0,0,0,0,0,3,0,2,0,0,     285, 'Frozen Shell', 'Ice variant. Shell eruption freezes all enemies in a large area.', ['snow_region'], ['mining','cooling'], 'L'],

  // ── Alpaca ──
  [96, 'kingpaca',   'Kingpaca',     '羊驼王',   [E.N],     3, 3, 1, 0,  140,85,130,80,160,  0,0,0,0,0,0,0,0,0,0,0,0,    350, 'Fluffy King', 'Can be ridden. While mounted, player carrying capacity is greatly increased.', ['mountain','desert'], ['mount-ground'], 'M'],
  [97, 'ice_kingpaca','Ice Kingpaca','冰羊驼王', [E.I],     3, 3, 1, 0,  145,80,135,75,160,  0,0,0,0,0,0,0,0,0,2,0,0,    345, 'Ice King', 'Ice variant. While mounted, player is immune to cold.', ['snow_region'], ['cooling','mount-ground'], 'M'],

  // ── Elephant ──
  [98, 'mammorest',  'Mammorest',    '猛犸象',   [E.G],     4, 4, 1, 0,  180,120,160,40,200,  0,0,3,0,0,0,3,0,0,0,2,0,    220, 'Ancient Power', 'Can be ridden. Stomps the ground, causing massive tremors.', ['forest','snow_region'], ['planting','lumbering','transport','mount-ground'], 'L'],
  [99, 'mammorest_cryst','Mammorest Cryst','冰猛犸',[E.I], 4, 4, 1, 0,  185,115,165,40,200,  0,0,0,0,0,0,3,0,0,2,2,0,    215, 'Frozen Ancient', 'Ice variant. Stomps the ground, causing ice explosions.', ['snow_region'], ['lumbering','cooling','transport','mount-ground'], 'L'],

  // ── Wumpo ──
  [100,'wumpo',      'Wumpo',        '雪巨人',   [E.I],     3, 3, 0, 0,  150,85,140,30,170,  0,0,0,0,0,0,2,0,0,3,3,0,    280, 'Snow Guardian', 'Creates a snowstorm that damages all enemies in a wide area and slows them.', ['snow_region'], ['cooling','lumbering','transport'], 'L'],
  [101,'wumpo_botan','Wumpo Botan',  '草巨人',   [E.G],     3, 3, 0, 0,  150,90,135,30,170,  0,0,3,0,0,0,2,0,0,0,3,0,    275, 'Forest Guardian', 'Grass variant. Creates a healing zone that restores ally HP.', ['forest'], ['planting','lumbering','transport'], 'L'],

  // ── Bug / Ground ──
  [102,'warsect',    'Warsect',      '甲虫王',   [E.G,E.Gr],4,3,1,0, 160,145,150,60,180,  0,0,0,0,1,0,2,0,0,0,3,0,     240, 'Iron Wall', 'Greatly increases defense of all base Pals while Warsect is assigned.', ['desert','forest'], ['lumbering','transport','combat'], 'L'],

  // ── Deer / Ice ──
  [103,'fenglope',   'Fenglope',     '风角鹿',   [E.N,E.I], 3, 3, 1, 0,  120,110,100,160,150, 0,0,0,0,0,0,2,0,0,1,1,0,    310, 'Blizzard Dash', 'Can be ridden. Fastest ground mount. Leaves a trail of ice.', ['snow_region'], ['mount-ground','lumbering','cooling'], 'L'],

  // ── Bat / Dark ──
  [104,'felbat',     'Felbat',       '魔蝠',     [E.D],     3, 2, 0, 1,  95,120,70,120,130,  0,0,0,0,0,0,0,0,0,0,0,0,    1010, 'Life Steal', 'Drains HP from enemies with every attack and heals the player.', ['cave','night'], ['mount-flying','combat'], 'M'],

  // ── Dragon ──
  [105,'quivern',    'Quivern',      '羽龙',     [E.Dr],    4, 4, 0, 1,  160,135,130,100,180, 0,0,0,0,0,0,0,0,0,0,3,0,     230, 'Dragon Force', 'Can be ridden as a flying mount. Massive dragon breath attack while mounted.', ['mountain','sky'], ['mount-flying','transport','combat'], 'L'],

  // ── Fire beast ──
  [106,'blazamut',   'Blazamut',     '焰魔',     [E.F],     5, 4, 1, 0,  180,170,140,90,200,  4,0,0,0,0,0,0,0,0,0,0,0,    150, 'Volcanic Eruption', 'Unleashes a massive volcanic eruption that devastates all enemies on screen.', ['volcano'], ['kindling','combat','mount-ground'], 'L'],

  // ── Dark flyer ──
  [107,'helzephyr',  'Helzephyr',    '暗鸦',     [E.D],     4, 3, 0, 1,  120,145,90,150,150,  0,0,0,0,0,0,0,0,0,0,0,0,    290, 'Dark Dive', 'Can be ridden as a flying mount. Dive-bombs enemies with dark energy.', ['night','mountain'], ['mount-flying','combat'], 'L'],
  [108,'helzephyr_lux','Helzephyr Lux','电鸦',  [E.D,E.L], 4, 3, 0, 1,  125,140,85,155,150,  0,0,0,2,0,0,0,0,0,0,0,0,    285, 'Thunder Dive', 'Electric variant. Dive-bombs enemies with lightning.', ['mountain','sky'], ['generating','mount-flying','combat'], 'L'],

  // ── Dark dragon ──
  [109,'astegon',    'Astegon',      '黑骑龙',   [E.D,E.Dr],5,4,0,1,  180,150,160,80,200,  0,0,0,0,0,0,0,4,0,0,0,0,    140, 'Dark Oblivion', 'Can be ridden as a flying mount. Fires a concentrated beam of dark energy.', ['volcano','cave'], ['mining','mount-flying','combat'], 'L'],

  // ── Scorpion ──
  [110,'menasting',  'Menasting',    '毒蝎王',   [E.D,E.Gr],4,3,0,0,  160,155,140,80,170,  0,0,0,0,0,0,0,3,0,0,2,0,    260, 'Venom Strike', 'Strikes with its tail, inflicting deadly poison that deals damage over time.', ['desert','cave'], ['mining','transport','combat'], 'L'],

  // ── Anubis (existing data refined) ──
  [111,'anubis',     'Anubis',       '阿努比斯', [E.Gr],    4, 2, 0, 0,  120,130,100,80,100,  0,0,0,0,4,0,0,3,0,0,2,0,    570, 'Guardian of the Desert', 'When activated, Anubis leaps onto the player\'s shoulder and attacks with a powerful machine gun.', ['desert','cave'], ['handiwork','mining','combat','base-worker'], 'M,L'],

  // ── Jormuntide ──
  [112,'jormuntide', 'Jormuntide',   '海皇蛇',   [E.W,E.Dr],5,4,0,0,  200,120,130,80,200,  0,4,0,0,0,0,0,0,0,0,2,0,    120, 'Sea Emperor', 'The largest Water Pal. Creates massive tidal waves that sweep across the battlefield.', ['ocean','lake'], ['watering','transport','combat'], 'L'],
  [113,'jormuntide_ignis','Jormuntide Ignis','炎皇蛇',[E.F,E.Dr],5,4,0,0,200,130,125,80,200, 4,0,0,0,0,0,0,0,0,0,2,0,  115, 'Flame Emperor', 'Fire variant. Breathes an enormous stream of fire that melts everything.', ['volcano'], ['kindling','transport','combat'], 'L'],

  // ── Suzaku ──
  [114,'suzaku',     'Suzaku',       '朱雀',     [E.F],     5, 4, 0, 1,  170,160,140,130,190, 3,0,0,0,0,0,0,0,0,0,0,0,    180, 'Vermilion Bird', 'Can be ridden as a flying mount. Surrounds itself with a massive firestorm.', ['volcano','sky'], ['kindling','mount-flying','combat'], 'L'],
  [115,'suzaku_aqua','Suzaku Aqua',  '水朱雀',   [E.W],     5, 4, 0, 1,  170,155,145,130,190, 0,3,0,0,0,0,0,0,0,0,0,0,    175, 'Azure Bird', 'Water variant. Creates a massive waterspout while flying.', ['ocean','sky'], ['watering','mount-flying','combat'], 'L'],

  // ── Grizzbolt ──
  [116,'grizzbolt',  'Grizzbolt',    '暴电熊',   [E.L],     5, 4, 1, 0,  180,170,140,100,200, 0,0,0,4,0,0,2,0,0,0,3,0,    160, 'Thunder Clap', 'Can be ridden. Fires a massive lightning cannon. Devastates everything in its path.', ['forest','mountain'], ['generating','lumbering','transport','mount-ground','combat'], 'L'],

  // ── Lyleen ──
  [117,'lyleen',     'Lyleen',       '百合女王', [E.G],     4, 3, 0, 0,  140,100,120,100,160,  0,0,4,0,0,2,0,0,0,0,0,0,    280, 'Queen\'s Grace', 'Heals all allies in the base over time. Plant harvest yield doubled while assigned.', ['garden','forest'], ['planting','gathering','medicine'], 'L'],
  [118,'lyleen_noct','Lyleen Noct',  '暗百合',   [E.D],     4, 3, 0, 0,  140,110,115,100,160,  0,0,0,0,3,0,0,0,2,0,0,0,    275, 'Dark Grace', 'Dark variant. Boosts the attack of all Dark Pals in the base while assigned.', ['night','cave'], ['handiwork','medicine','combat'], 'L'],

  // ── Faleris ──
  [119,'faleris',    'Faleris',      '法老鹰',   [E.F],     5, 4, 0, 1,  170,160,110,170,190, 3,0,0,0,0,0,0,0,0,0,0,0,    170, 'Phoenix Flight', 'Can be ridden as a flying mount. Fastest flyer in the game. Reborn from flames when defeated.', ['volcano','sky'], ['kindling','mount-flying','combat'], 'L'],

  // ── Orserk ──
  [120,'orserk',     'Orserk',       '雷牙龙',   [E.Dr,E.L],5,4,0,1,  190,175,150,110,200, 0,0,0,3,0,0,0,0,0,0,2,0,    145, 'Thunder Dragon', 'Can be ridden as a flying mount. Dragon+Electric hybrid. Massive thunder breath.', ['mountain','sky'], ['generating','mount-flying','transport','combat'], 'L'],

  // ── Legendary Dark ──
  [121,'shadowbeak', 'Shadowbeak',   '暗影雕',   [E.D],     5, 3, 0, 1,  160,180,110,180,180,  0,0,0,0,0,0,0,0,0,0,0,0,    130, 'Dark Arrow', 'Can be ridden as a flying mount. Transforms into a dark arrow that pierces through everything.', ['night','mountain'], ['mount-flying','combat'], 'L'],

  // ── Legendary Duo ──
  [122,'necromus',   'Necromus',     '冥王骑士', [E.D],     5, 4, 1, 0,  200,200,180,100,220, 0,0,0,0,0,0,0,0,0,0,0,0,    100, 'Death Knight', 'Legendary Pal. Can be ridden. Aura constantly damages nearby enemies. Massive dark lance.', ['night','mountain'], ['mount-ground','combat'], 'L'],
  [123,'paladius',   'Paladius',     '圣骑士',   [E.N],     5, 4, 1, 0,  200,200,180,100,220, 0,0,0,0,0,0,2,0,0,0,0,0,    105, 'Holy Knight', 'Legendary Pal. Can be ridden. Aura constantly heals allies. Massive sacred lance.', ['mountain','sky'], ['mount-ground','lumbering','combat'], 'L'],

  // ── Frostallion ──
  [124,'frostallion','Frostallion',  '冰霜马',   [E.I],     5, 4, 1, 1,  190,180,170,150,210, 0,0,0,0,0,0,0,0,0,4,0,0,    120, 'Absolute Zero', 'Legendary Pal. Can be ridden as a flying mount. Blizzard aura freezes all enemies.', ['snow_region','sky'], ['cooling','mount-flying','combat'], 'L'],
  [125,'frostallion_noct','Frostallion Noct','暗冰马',[E.D],5,4,1,1, 190,185,165,150,210, 0,0,0,0,0,0,0,0,0,2,0,0,    115, 'Absolute Dark', 'Dark variant Legendary. Dark blizzard aura damages and blinds all enemies.', ['night','snow_region','sky'], ['cooling','mount-flying','combat'], 'L'],

  // ── Jetragon (Legendary) ──
  [126,'jetragon',   'Jetragon',     '捷龙',     [E.Dr],    5, 4, 0, 1,  200,200,140,230,220, 0,0,0,0,0,0,0,0,0,0,0,0,    90, 'Missile Launcher', 'Legendary Pal. Fastest flying mount in the game. Fires homing missiles while mounted.', ['volcano','sky'], ['mount-flying','combat'], 'L'],

  // ── More Pals (filling the gaps) ──
  [127,'teafant',    'Teafant',      '茶壶象',   [E.W],     2, 2, 0, 0,  90,70,85,70,110,   0,2,0,0,0,0,0,0,0,0,0,0,    1250, 'Tea Time', 'Heals the player over time when activated.', ['forest','lake'], ['watering'], 'E'],
  [128,'cremis',     'Cremis',       '奶油',     [E.N],     1, 1, 0, 0,  70,55,75,60,90,    0,0,0,0,0,0,0,0,0,0,0,1,    1490, 'Cream Body', 'When assigned to a Ranch, produces Milk.', ['grassy_fields'], ['farming'], 'E'],
  [129,'woolipop',   'Woolipop',     '棉花糖',   [E.N],     1, 1, 0, 0,  65,50,80,40,90,    0,0,0,0,0,0,0,0,0,0,0,1,    1480, 'Cotton Candy', 'When assigned to a Ranch, produces Cotton Candy that restores sanity.', ['grassy_fields'], ['farming'], 'E'],
  [130,'ribbuny',    'Ribbuny',      '蹦蹦兔',   [E.N],     1, 1, 0, 0,  65,55,60,100,90,   0,0,0,0,0,0,0,0,0,0,0,0,    1460, 'Bunny Hop', 'Jumps very high. Can reach elevated areas early in the game.', ['grassy_fields','forest'], ['mount-ground'], 'E'],
  [131,'flambelle',  'Flambelle',    '焰蝶',     [E.F],     2, 1, 0, 0,  60,80,55,90,100,   1,0,0,0,0,0,0,0,0,0,0,0,    1230, 'Butterfly Flame', 'Flies around the player and shoots fire at nearby enemies.', ['volcano','forest'], ['kindling','combat'], 'M'],
  [132,'voxy',       'Voxy',         '大狐',     [E.N],     3, 3, 1, 0,  120,115,100,110,150, 0,0,0,0,0,0,0,0,0,0,0,0,    420, 'Fox Rider', 'Can be ridden. While mounted, player attack and speed increase at night.', ['forest','mountain'], ['mount-ground','combat'], 'M'],

  // ── Remaining variant Pals ──
  [133,'pengullet_ignis','Pengullet Ignis','火企丸丸',[E.F],1,1,0,0, 65,70,60,45,100, 1,0,0,0,0,0,0,0,0,0,0,0, 1380, 'Fire Cannon', 'Fire variant. Launches itself as a flaming rocket at enemies.', ['volcano'], ['kindling'], 'E'],
  [134,'tanzee_ignis','Tanzee Ignis','火地鼠',  [E.F],     1, 1, 0, 0,  80,70,70,55,100,   1,0,0,0,1,0,0,0,0,0,0,0,    1400, 'Cheery Flame', 'Fire variant. Increases attack of Fire-type Pals in the party.', ['volcano'], ['kindling'], 'E'],
  [135,'lifmunk_ignis','Lifmunk Ignis','火翠鼠',[E.F],    1, 1, 0, 0,  75,80,60,80,100,   1,0,0,0,1,1,0,0,0,0,0,0,    1420, 'Flame Recoil', 'Fire variant. Jumps on player head and fires a flamethrower.', ['volcano','forest'], ['kindling','combat'], 'E'],
  [136,'gumoss_special','Gumoss Special','金泥泥',[E.Gr], 2, 1, 0, 0,  85,60,90,35,100,   0,0,0,0,0,0,1,0,0,0,0,0,    1460, 'Mud Shield', 'Special variant. Creates a mud wall that blocks projectiles.', ['swamp','desert'], ['lumbering'], 'M'],
  [137,'kitsun_noct','Kitsun Noct',  '暗九尾',   [E.D],     4, 2, 1, 0,  95,120,80,120,130,  0,0,0,0,0,0,0,0,0,0,0,0,    425, 'Dark Fox Fire', 'Dark variant. Summons dark spirit flames that drain HP from enemies.', ['night','mountain'], ['combat'], 'L'],
  [138,'reindrix_noct','Reindrix Noct','暗角鹿', [E.D],     3, 3, 1, 0,  115,115,105,90,140,  0,0,0,0,0,0,2,0,0,0,0,0,    415, 'Dark Antler', 'Dark variant. Charges with dark-infused antlers.', ['night','mountain'], ['lumbering','mount-ground','combat'], 'M'],
  [139,'elphidran_noct','Elphidran Noct','暗牙龙',[E.D],   3, 3, 0, 1,  120,120,100,100,140, 0,0,0,0,0,0,1,0,0,0,1,0,    380, 'Dark Flight', 'Dark variant. Dark breath attack while flying.', ['cave','mountain'], ['mount-flying','combat'], 'M'],
  [140,'quvern_botan','Quivern Botan','草羽龙',  [E.G],     4, 4, 0, 1,  165,130,135,100,180, 0,0,3,0,0,2,0,0,0,0,3,0,    225, 'Forest Force', 'Grass variant. Massive leaf tornado while flying.', ['forest','sky'], ['planting','mount-flying','transport'], 'L'],

  // ── More unique Pals ──
  [141,'bushi_noct', 'Bushi Noct',   '暗武士',   [E.D],     3, 2, 0, 0,  95,125,80,100,120,  0,0,0,0,1,0,1,0,0,0,0,0,    1110, 'Shadow Blade', 'Dark variant. Performs a shadow iai slash that ignores defense.', ['night','cave'], ['combat','lumbering'], 'M'],
  [142,'katress_ignis','Katress Ignis','火女巫', [E.F],     3, 2, 0, 0,  85,135,60,110,120,  2,0,0,0,2,0,0,0,0,0,0,0,    1030, 'Fire Arts', 'Fire variant. Boosts Fire attack. Launches fire orbs.', ['volcano'], ['kindling','handiwork','combat'], 'M'],
  [143,'verdash_noct','Verdash Noct','暗遁兔',  [E.D],     3, 2, 1, 0,  90,105,75,145,130,  0,0,0,0,0,2,0,0,0,0,0,0,    1040, 'Shadow Dash', 'Dark variant. Extremely fast sprint with shadow trail.', ['night','forest'], ['gathering','mount-ground'], 'M'],
  [144,'petallia_noct','Petallia Noct','暗花冠',[E.D],     3, 2, 0, 0,  90,85,80,95,120,   0,0,0,0,0,2,0,0,0,0,0,0,    1120, 'Shadow Petal', 'Dark variant. Summons dark petals that drain enemy HP.', ['night','garden'], ['gathering','combat'], 'M'],
  [145,'digtoise_ignis','Digtoise Ignis','火掘龟',[E.F],   3, 2, 0, 0,  100,90,125,40,120,  2,0,0,0,0,0,0,3,0,0,0,0,    435, 'Flame Spin', 'Fire variant. Spins with flame blades — excellent at ore mining + kindling.', ['volcano','cave'], ['mining','kindling'], 'M'],
  [146,'tombat_noct', 'Tombat Noct', '暗音蝠',   [E.D],     3, 2, 0, 0,  90,105,70,130,120,  0,0,0,0,0,0,0,0,0,0,0,0,    1120, 'Dark Sonar', 'Dark variant. Ultrasonic waves reveal enemies and lower their defense.', ['cave','night'], ['combat'], 'M'],
  [147,'lovander_noct','Lovander Noct','暗爱蜥',[E.D],     3, 2, 0, 0,  100,95,80,95,120,   0,0,0,0,0,0,0,0,1,0,0,0,    1160, 'Dark Heart', 'Dark variant. Drains HP and transfers a portion to all party members.', ['night','cave'], ['medicine','combat'], 'M'],
  [148,'beakon_noct', 'Beakon Noct', '暗雷鹰',   [E.D],     4, 3, 0, 1,  110,125,85,150,140,  0,0,0,0,0,0,0,0,0,0,0,0,    335, 'Dark Thunder', 'Dark variant. Electric+Dark hybrid flying mount.', ['night','mountain'], ['mount-flying','combat'], 'L'],
  [149,'shadowbeak_noct','Shadowbeak Noct','夜雕',[E.D],   5, 3, 0, 1,  165,185,105,185,180, 0,0,0,0,0,0,0,0,0,0,0,0,    125, 'Void Arrow', 'Pure dark variant. Becomes invisible during flight.', ['night','sky'], ['mount-flying','combat'], 'L'],
  [150,'vanwyrm_ignis','Vanwyrm Ignis','怒火翼龙',[E.F],   3, 3, 0, 1,  110,130,90,120,140,  3,0,0,0,0,0,0,0,0,0,1,0,    370, 'Rage Wyrm', 'Pure fire variant. Faster and stronger than Vanwyrm.', ['volcano'], ['kindling','mount-flying','combat'], 'M'],

  // ── Boss / Special Pals ──
  [151,'bellanoir',  'Bellanoir',    '贝拉诺亚', [E.D],     4, 2, 0, 0,  120,160,90,120,140,  0,0,0,0,0,0,0,0,0,0,0,0,    320, 'Shadow Strike', 'Raid boss Pal. Teleports behind enemies and delivers a devastating strike.', ['raid'], ['combat'], 'L'],
  [152,'bellanoir_libero','Bellanoir Libero','解放贝拉',[E.D],5,2,0,0, 140,180,100,140,160, 0,0,0,0,0,0,0,0,0,0,0,0,    200, 'Ultimate Shadow', 'Ultra raid boss. Unsealed form of Bellanoir with massively boosted stats.', ['raid'], ['combat'], 'L'],
  [153,'blazamut_ryu','Blazamut Ryu','龙焰魔',  [E.F,E.Dr],5,4,1,0, 200,190,160,80,220, 4,0,0,0,0,0,0,0,0,0,0,0,    110, 'Dragon Volcano', 'Raid boss. Dragon+Fire hybrid. Erupts the entire battlefield.', ['raid','volcano'], ['kindling','combat','mount-ground'], 'L'],
  [154,'xenolord',   'Xenolord',     '异界王',   [E.Dr],    5, 4, 0, 1,  200,190,160,150,220, 0,0,0,0,0,0,0,0,0,0,0,0,    130, 'Xeno Blast', 'Raid boss. Alien dragon — fires a massive energy beam that hits all enemies.', ['raid','sky'], ['mount-flying','combat'], 'L'],

  // ── Remaining Pals (filling to ~180) ──
  [155,'rooby_noct', 'Rooby Noct',   '暗火鸡',   [E.D],     1, 1, 0, 0,  60,70,55,70,100,    0,0,0,0,0,0,0,0,0,0,0,0,    1430, 'Dark Egg', 'Dark variant. Launches a dark egg that drains HP.', ['night'], ['combat'], 'E'],
  [156,'mossanda_ignis','Mossanda Ignis','火熊猫',[E.F],    3, 3, 1, 0,  125,110,125,60,140,  2,0,0,0,0,0,2,0,0,0,1,0,    425, 'Fire Panda', 'Fire variant. Launches fire grenades while mounted.', ['volcano'], ['kindling','mount-ground','combat'], 'M'],
  [157,'rayhound_noct','Rayhound Noct','暗电犬', [E.D],     3, 2, 1, 0,  95,110,75,145,130,  0,0,0,0,0,0,0,0,0,0,0,0,    435, 'Dark Sprint', 'Dark variant. Lightning fast sprint with shadow trail.', ['night','desert'], ['mount-ground','combat'], 'M'],
  [158,'dumud_cryst','Dumud Cryst',  '冰呆鳗',   [E.I],     2, 2, 0, 0,  100,60,115,30,90,   0,0,0,0,0,0,0,1,0,1,0,0,    1330, 'Ice Bath', 'Ice variant. Increases defense of Ice-type Pals.', ['snow_region','lake'], ['mining','cooling'], 'M'],
  [159,'garillat',   'Garillat',     '大猩猩',   [E.N],     3, 3, 1, 0,  140,140,120,60,160,  0,0,0,0,1,0,2,1,0,0,1,0,    340, 'Ground Pound', 'Can be ridden. Pounds the ground repeatedly with both fists.', ['forest','mountain'], ['mount-ground','combat','mining','lumbering'], 'L'],
  [160,'dazemu',     'Dazemu',       '钻头鸵鸟', [E.Gr],    3, 2, 1, 0,  100,95,110,110,130,  0,0,0,0,0,0,0,3,0,0,1,0,    410, 'Drill Run', 'Can be ridden. Drills through the ground, damaging enemies in its path.', ['desert','cave'], ['mining','mount-ground','combat'], 'M'],
  [161,'dogen',      'Dogen',        '道犬',     [E.N],     3, 2, 0, 0,  90,120,80,130,120,  0,0,0,0,0,0,0,0,0,0,0,0,    1080, 'Counter Stance', 'Parries incoming attacks and counters with massive damage.', ['mountain','forest'], ['combat'], 'L'],
  [162,'tarantriss', 'Tarantriss',   '蛛王',     [E.D,E.Gr],4, 3, 0, 0,  140,135,120,90,150,  0,0,0,0,0,0,0,0,0,0,2,0,    250, 'Web Trap', 'Shoots webs that trap enemies and prevent them from moving.', ['cave','forest'], ['transport','combat'], 'L'],
  [163,'xenovader',  'Xenovader',   '异星入侵者',[E.Dr],   4, 3, 0, 1,  140,145,110,140,160, 0,0,0,0,0,0,0,0,0,0,0,0,    250, 'Alien Beam', 'Can be ridden as a flying mount. Fires alien energy beams.', ['sky'], ['mount-flying','combat'], 'L'],
  [164,'prunellia',  'Prunellia',    '紫梅',     [E.G],     3, 2, 0, 0,  100,80,100,70,130,  0,0,2,0,0,2,0,0,2,0,0,0,    1080, 'Berry Heal', 'When assigned to base, produces healing berries and increases crop growth.', ['garden','forest'], ['planting','gathering','medicine'], 'M'],
  [165,'nyafia',     'Nyafia',       '猫贼',     [E.D],     2, 2, 0, 0,  75,90,60,120,100,  0,0,0,0,0,0,0,0,0,0,0,0,    1160, 'Pickpocket', 'When activated, steals an item from the target enemy.', ['night','cave'], ['combat'], 'M'],
  [166,'selyne',     'Selyne',       '月神',     [E.N],     4, 2, 0, 0,  110,100,85,110,140,  0,0,0,0,2,0,0,0,0,0,0,0,    270, 'Moon Power', 'At night, boosts the attack and speed of all Pals in the party.', ['mountain','night'], ['handiwork'], 'L'],
  [167,'knocklem',   'Knocklem',     '石像鬼',   [E.Gr],    4, 3, 0, 0,  160,100,180,30,180,  0,0,0,0,0,0,0,0,0,0,0,0,    200, 'Stone Body', 'Immense defense. Takes very little damage from physical attacks.', ['cave','ruins'], ['combat'], 'L'],
  [168,'croajiro',   'Croajiro',     '蛙力士',   [E.W],     2, 2, 1, 0,  100,80,95,60,110,   0,1,0,0,0,0,0,0,0,0,1,0,    1200, 'Toad Leap', 'Can be ridden. Jumps very high. Great for crossing water.', ['lake','swamp'], ['watering','transport','mount-ground'], 'E'],
  [169,'shroomer',   'Shroomer',     '蘑菇怪',   [E.G],     2, 2, 0, 0,  85,70,90,40,100,   0,0,2,0,0,2,0,0,0,0,0,0,    1260, 'Spore Cloud', 'Releases spores that heal allies and poison enemies.', ['forest','cave'], ['planting','gathering','medicine'], 'E'],
  [170,'shroomer_noct','Shroomer Noct','暗蘑菇', [E.D],     2, 2, 0, 0,  85,75,85,40,100,   0,0,0,0,0,2,0,0,0,0,0,0,    1250, 'Dark Spore', 'Dark variant. Spores drain enemy HP and transfer to allies.', ['cave','night'], ['gathering','combat'], 'M'],
  [171,'kikit',      'Kikit',        '小猫怪',   [E.N],     2, 1, 0, 0,  70,80,65,110,100,  0,0,0,0,0,1,0,0,0,0,0,0,    1260, 'Cat\'s Eye', 'Increases the critical hit rate of all Pals in the party.', ['forest','grassy_fields'], ['gathering'], 'E'],
  [172,'silkina',    'Silkina',      '丝蛛',     [E.G],     2, 1, 0, 0,  60,50,55,85,80,    0,0,0,0,0,0,0,0,0,0,0,0,    1350, 'Silk Weave', 'When assigned to a Ranch, produces Silk.', ['forest','cave'], ['farming'], 'E'],
  [173,'silkina_noct','Silkina Noct', '暗丝蛛',  [E.D],     2, 1, 0, 0,  60,55,50,85,80,    0,0,0,0,0,0,0,0,0,0,0,0,    1340, 'Shadow Silk', 'Dark variant. When assigned to a Ranch, produces Dark-infused Silk.', ['night','cave'], ['farming'], 'M'],
  [174,'dragostrophe','Dragostrophe','终焉龙',  [E.Dr],    5, 4, 0, 1,  200,200,160,130,220, 0,0,0,0,0,0,0,0,0,0,0,0,    100, 'Apocalypse', 'Legendary Raid Boss. The strongest Dragon Pal. Ultimate attack hits everything.', ['raid','sky'], ['mount-flying','combat'], 'L'],
  [175,'dragostrophe_noct','Dragostrophe Noct','暗终龙',[E.D],5,4,0,1,200,205,155,130,220, 0,0,0,0,0,0,0,0,0,0,0,0,   95, 'Void Apocalypse', 'Dark variant Legendary. Ultimate attack creates a black hole.', ['raid','sky'], ['mount-flying','combat'], 'L'],
  [176,'sibelyx_noct','Sibelyx Noct','暗羽',    [E.D],     3, 2, 0, 1,  95,110,80,130,130,  0,0,0,0,0,0,0,0,0,0,0,0,    405, 'Dark Storm', 'Dark variant. Creates a dark snowstorm while flying.', ['night','mountain'], ['mount-flying','combat'], 'M'],
  [177,'broncherry_noct','Broncherry Noct','暗花兽',[E.D], 3, 3, 1, 0,  130,110,125,55,150,  0,0,0,0,0,0,0,0,0,0,1,0,    340, 'Dark Shield', 'Dark variant. Creates a dark shield that reflects damage.', ['night','forest'], ['transport','combat'], 'M'],
  [178,'bristla_noct','Bristla Noct','暗荆棘',  [E.D],     2, 2, 0, 0,  85,90,75,55,100,   0,0,0,0,0,2,0,0,1,0,0,0,    1290, 'Dark Thorn', 'Dark variant. Thorny body reflects damage and drains HP.', ['night','desert'], ['gathering','medicine'], 'M'],
  [179,'cinnamoth_noct','Cinnamoth Noct','暗蛾', [E.D],    2, 2, 0, 0,  85,85,75,100,110,  0,0,0,0,0,0,0,0,0,0,0,0,    1270, 'Dark Powder', 'Dark variant. Scatters powder that blinds and damages enemies.', ['night','forest'], ['combat'], 'M'],
  [180,'beegarde_noct','Beegarde Noct','暗蜂',  [E.D],     2, 1, 0, 0,  55,55,50,110,80,   0,0,0,0,0,1,0,0,0,0,0,0,    1270, 'Dark Worker', 'Dark variant. Increases work speed of Dark Pals in the base.', ['night','forest'], ['gathering'], 'M']
];

// ─── Generate individual JSON files ───────────────────────────
const WORK_KEYS = ['kindling','watering','planting','generating','handiwork','gathering','lumbering','mining','medicine','cooling','transporting','farming'];

const RARITY_MAP = {1:'Common', 2:'Uncommon', 3:'Rare', 4:'Epic', 5:'Legendary'};
const SIZE_MAP = {1:'Small', 2:'Medium', 3:'Large', 4:'Huge'};

const ELEMENT_MAP = {
  'N':'Neutral','F':'Fire','W':'Water','G':'Grass','L':'Electric','I':'Ice','D':'Dark','Gr':'Ground','Dr':'Dragon'
};

const DEFAULT_SKILLS = {
  'Neutral': [{name:'Power Shot',element:'Neutral',power:85,cooldown:8,level:1},{name:'Air Cannon',element:'Neutral',power:50,cooldown:4,level:7},{name:'Body Slam',element:'Neutral',power:80,cooldown:12,level:15}],
  'Fire': [{name:'Fire Ball',element:'Fire',power:75,cooldown:6,level:1},{name:'Flame Thrower',element:'Fire',power:120,cooldown:18,level:15},{name:'Fire Blast',element:'Fire',power:100,cooldown:14,level:22}],
  'Water': [{name:'Water Gun',element:'Water',power:65,cooldown:4,level:1},{name:'Aqua Jet',element:'Water',power:80,cooldown:8,level:10},{name:'Hydro Pump',element:'Water',power:130,cooldown:20,level:22}],
  'Grass': [{name:'Wind Cutter',element:'Grass',power:55,cooldown:4,level:1},{name:'Seed Bomb',element:'Grass',power:90,cooldown:10,level:10},{name:'Grass Tornado',element:'Grass',power:100,cooldown:18,level:22}],
  'Electric': [{name:'Thunder Shock',element:'Electric',power:50,cooldown:3,level:1},{name:'Thunderbolt',element:'Electric',power:100,cooldown:12,level:12},{name:'Lightning Strike',element:'Electric',power:130,cooldown:20,level:25}],
  'Ice': [{name:'Ice Shard',element:'Ice',power:55,cooldown:4,level:1},{name:'Ice Beam',element:'Ice',power:100,cooldown:14,level:15},{name:'Blizzard',element:'Ice',power:140,cooldown:24,level:30}],
  'Dark': [{name:'Dark Pulse',element:'Dark',power:80,cooldown:10,level:1},{name:'Shadow Ball',element:'Dark',power:100,cooldown:14,level:12},{name:'Night Slash',element:'Dark',power:120,cooldown:16,level:22}],
  'Ground': [{name:'Sand Attack',element:'Ground',power:45,cooldown:3,level:1},{name:'Rock Slide',element:'Ground',power:90,cooldown:12,level:12},{name:'Earthquake',element:'Ground',power:140,cooldown:30,level:30}],
  'Dragon': [{name:'Dragon Breath',element:'Dragon',power:70,cooldown:6,level:1},{name:'Dragon Claw',element:'Dragon',power:95,cooldown:10,level:12},{name:'Dragon Meteor',element:'Dragon',power:150,cooldown:30,level:30}],
};

// Build default Drops from elements array
function defaultDrops(elemKeys) {
  const drops = [];
  if (elemKeys.includes('N') || elemKeys.length === 0) drops.push({itemId:'leather',dropRate:'100%',quantity:[1,2]});
  if (elemKeys.includes('F')) drops.push({itemId:'flame_organ',dropRate:'50%',quantity:[1,2]});
  if (elemKeys.includes('W')) drops.push({itemId:'pal_fluids',dropRate:'50%',quantity:[1,2]});
  if (elemKeys.includes('G')) drops.push({itemId:'berry_seeds',dropRate:'50%',quantity:[2,5]});
  if (elemKeys.includes('L')) drops.push({itemId:'electric_organ',dropRate:'50%',quantity:[1,2]});
  if (elemKeys.includes('I')) drops.push({itemId:'ice_organ',dropRate:'50%',quantity:[1,2]});
  if (elemKeys.includes('D')) drops.push({itemId:'dark_fragment',dropRate:'50%',quantity:[1,2]});
  if (elemKeys.includes('Gr')) drops.push({itemId:'stone',dropRate:'100%',quantity:[3,8]});
  if (elemKeys.includes('Dr')) drops.push({itemId:'dragon_fragment',dropRate:'30%',quantity:[1,1]});
  if (drops.length === 0) drops.push({itemId:'leather',dropRate:'100%',quantity:[1,2]});
  return drops;
}

let count = 0;
PALS.forEach(p => {
  const [
    number, id, enName, zhName, elemKeys, rarityIdx, sizeIdx, rideable, flyable,
    hp, atk, def, spd, sta,
    kindling, watering, planting, generating, handiwork, gathering, lumbering, mining, medicine, cooling, transporting, farming,
    breedingPower, partnerName, partnerDesc,
    habitats, bestForRaw, gameStageRaw
  ] = p;

  const elements = elemKeys.map(k => ELEMENT_MAP[k] || k);
  const primaryElement = ELEMENT_MAP[elemKeys[0]] || 'Neutral';
  const rarity = RARITY_MAP[rarityIdx] || 'Common';
  const size = SIZE_MAP[sizeIdx] || 'Medium';
  const roles = (rideable || flyable) ? (flyable ? ['Combat','Mount'] : ['Combat','Mount']) :
    (atk >= 120 ? ['Combat'] : ['Worker']);

  // Parse game stages
  const stages = gameStageRaw.split(',');
  const gameStage = {
    early: stages.includes('E'),
    mid: stages.includes('M'),
    late: stages.includes('L')
  };

  // Build bestFor and scores
  const bestFor = bestForRaw || [];
  const workEntries = { kindling, watering, planting, generating, handiwork, gathering, lumbering, mining, medicine, cooling, transporting, farming };

  // Calculate scores based on work suitability and stats
  const scores = {};
  WORK_KEYS.forEach(k => {
    const lv = workEntries[k] || 0;
    scores[k] = lv >= 4 ? 95 : lv >= 3 ? 80 : lv >= 2 ? 55 : lv >= 1 ? 30 : 0;
  });
  // Combat score based on attack
  scores.combat = atk >= 180 ? 95 : atk >= 130 ? 80 : atk >= 100 ? 65 : atk >= 80 ? 40 : 20;
  scores['mount-flying'] = flyable ? (spd >= 150 ? 90 : spd >= 120 ? 75 : 50) : 0;
  scores['mount-ground'] = (rideable && !flyable) ? (spd >= 140 ? 85 : spd >= 100 ? 70 : 45) : 0;

  // Auto-generate reasons based on stats
  const reasons = {};
  bestFor.forEach(bf => {
    const reasonList = [];
    const lv = workEntries[bf] || 0;
    if (lv >= 3) reasonList.push(`${bf.charAt(0).toUpperCase()+bf.slice(1)} Lv ${lv} — top-tier efficiency`);
    if (lv >= 2) reasonList.push(`Reliable ${bf} output for mid-game progression`);
    if (atk >= 130) reasonList.push(`${atk} Attack — strong combat presence`);
    if (spd >= 120) reasonList.push(`${spd} Speed — fast and efficient`);
    if (gameStage.early) reasonList.push('Available from early game');
    if (gameStage.mid) reasonList.push('Obtainable mid-game');
    reasons[bf] = reasonList.length > 0 ? reasonList : ['Versatile Pal with balanced stats'];
  });

  // Skills from default tables
  const skills = DEFAULT_SKILLS[primaryElement] || DEFAULT_SKILLS['Neutral'];

  const palObj = {
    id,
    gameId: 'palworld',
    number,
    name: { zh: zhName, en: enName },
    slug: id,
    image: `/images/pals/${id}.png`,
    classification: {
      elements,
      rarity,
      role: roles,
      size,
      isRideable: !!rideable,
      isFlyable: !!flyable
    },
    stats: { hp, attack: atk, defense: def, rangedAttack: 0, speed: spd, stamina: sta },
    workSuitability: { kindling, watering, planting, generating, handiwork, gathering, lumbering, mining, medicine, cooling, transporting, farming },
    skills,
    partnerSkill: { name: partnerName, descriptionEn: partnerDesc },
    acquisition: {
      habitats,
      isBreedable: true,
      isCatchable: true,
      isBossEncounter: rarityIdx >= 4,
      bossLocation: rarityIdx >= 4 ? `${enName}'s Domain` : undefined
    },
    breeding: { breedingPower },
    drops: defaultDrops(elemKeys),
    decision: { bestFor, gameStage, scores, reasons }
  };

  // Write individual JSON
  const fp = path.join(OUT, `${id}.json`);
  fs.writeFileSync(fp, JSON.stringify(palObj, null, 2));
  count++;
});

console.log(`✅ Generated ${count} Pal JSON files → data/pals/`);
console.log(`\nNext: Run node scripts/build.js to generate 180 HTML pages.`);
