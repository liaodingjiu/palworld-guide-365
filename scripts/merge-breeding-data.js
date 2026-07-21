#!/usr/bin/env node
/**
 * Merge wiki breeding data with user's Pal list → generate updated pal-data.js.
 *
 * Usage: node scripts/merge-breeding-data.js
 *
 * Reads:
 *   data/wiki-breeding-ranks.json  (from fetch-breeding-data.js)
 *   breeding-calculator/pal-data.js (current data with elements, etc.)
 *
 * Writes:
 *   breeding-calculator/pal-data.js (updated)
 *   breeding-calculator/special-combos.js (updated)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Load wiki breeding ranks
const wikiData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'wiki-breeding-ranks.json'), 'utf-8'));

// Load current pal-data.js
const currentJs = fs.readFileSync(path.join(ROOT, 'breeding-calculator', 'pal-data.js'), 'utf-8');
const match = currentJs.match(/window\.__PAL_DATA__\s*=\s*(\[[\s\S]*?\]);/);
const currentPals = JSON.parse(match[1]);

// Create lookup maps
const currentByName = new Map();
currentPals.forEach(p => currentByName.set(p.n.toLowerCase(), p));

const wikiByRank = new Map();
wikiData.forEach(w => {
  if (w.bp !== null) {
    const name = w.name.toLowerCase();
    if (!wikiByRank.has(name)) {
      wikiByRank.set(name, w.bp);
    }
  }
});

// User's rarity data from their list
const userRarityMap = new Map([
  // Legendary
  ['bellanoir', 'Legendary'], ['bellanoir libero', 'Legendary'], ['blazamut', 'Legendary'],
  ['blazamut ryu', 'Legendary'], ['frostallion', 'Legendary'], ['frostallion noct', 'Legendary'],
  ['jetragon', 'Legendary'], ['necromus', 'Legendary'], ['paladius', 'Legendary'],
  ['neptilius', 'Legendary'],
  // Epic
  ['aegidron', 'Epic'], ['anubis', 'Epic'], ['astegon', 'Epic'], ['azurobe cryst', 'Epic'],
  ['bastigor', 'Epic'], ['beakon', 'Epic'], ['blazehowl noct', 'Epic'],
  ['braloha', 'Epic'], ['broncherry', 'Epic'], ['broncherry aqua', 'Epic'],
  ['dandilord', 'Epic'], ['dualith', 'Epic'], ['dualith noct', 'Epic'],
  ['eidrolon ignis', 'Epic'], ['elizabee', 'Epic'], ['elphidran aqua', 'Epic'],
  ['faleris', 'Epic'], ['faleris aqua', 'Epic'], ['gildane', 'Epic'],
  ['grizzbolt', 'Epic'], ['hartalis', 'Epic'], ['helzephyr lux', 'Epic'],
  ['jormuntide', 'Epic'], ['jormuntide ignis', 'Epic'], ['kingpaca', 'Epic'],
  ['kingpaca cryst', 'Epic'], ['knocklem', 'Epic'], ['knocklem ignis', 'Epic'],
  ['lyleen', 'Epic'], ['lyleen noct', 'Epic'], ['mammorest', 'Epic'],
  ['mammorest cryst', 'Epic'], ['menasting', 'Epic'], ['menasting terra', 'Epic'],
  ['moldron cryst', 'Epic'], ['mossanda lux', 'Epic'], ['ophydia', 'Epic'],
  ['orserk', 'Epic'], ['petallia', 'Epic'], ['petallia ignis', 'Epic'],
  ['pyrin', 'Epic'], ['pyrin noct', 'Epic'], ['quivern botan', 'Epic'],
  ['relaxaurus', 'Epic'], ['relaxaurus lux', 'Epic'], ['reptyro', 'Epic'],
  ['reptyro cryst', 'Epic'], ['selyne', 'Epic'], ['shadowbeak', 'Epic'],
  ['shaolong', 'Epic'], ['sibelyx primo', 'Epic'], ['silvance', 'Epic'],
  ['silvegis', 'Epic'], ['starryon', 'Epic'], ['starryon primo', 'Epic'],
  ['suzaku', 'Epic'], ['suzaku aqua', 'Epic'], ['tetroise', 'Epic'],
  ['tetroise primo', 'Epic'], ['vaelet', 'Epic'], ['verdash', 'Epic'],
  ['warsect', 'Epic'], ['warsect terra', 'Epic'], ['whalaska', 'Epic'],
  ['whalaska ignis', 'Epic'], ['wumpo botan', 'Epic'], ['xenogard', 'Epic'],
  // Rare
  ['azurmane', 'Rare'], ['azurobe', 'Rare'], ['beakon cryst', 'Rare'],
  ['blazehowl', 'Rare'], ['bushi', 'Rare'], ['bushi noct', 'Rare'],
  ['carnibora', 'Rare'], ['celesdir', 'Rare'], ['celesdir noct', 'Rare'],
  ['chillet ignis', 'Rare'], ['croajiro noct', 'Rare'], ['cryolinx', 'Rare'],
  ['cryolinx terra', 'Rare'], ['dazemu', 'Rare'], ['dinossom', 'Rare'],
  ['dinossom lux', 'Rare'], ['dogen', 'Rare'], ['dumud gild', 'Rare'],
  ['dupin', 'Rare'], ['dynamoff', 'Rare'], ['eidrolon', 'Rare'],
  ['eikthyrdeer', 'Rare'], ['eikthyrdeer terra', 'Rare'], ['elgrove', 'Rare'],
  ['elgrove cryst', 'Rare'], ['elphidran', 'Rare'], ['eye of cthulhu', 'Rare'],
  ['felbat', 'Rare'], ['flaracle', 'Rare'], ['foxcicle', 'Rare'],
  ['ghangler', 'Rare'], ['ghangler ignis', 'Rare'], ['gildra', 'Rare'],
  ['gloopie', 'Rare'], ['gloopie primo', 'Rare'], ['gorirat', 'Rare'],
  ['gorirat terra', 'Rare'], ['grintale', 'Rare'], ['helzephyr', 'Rare'],
  ['katress', 'Rare'], ['katress ignis', 'Rare'], ['kitsun', 'Rare'],
  ['kitsun noct', 'Rare'], ['leafan', 'Rare'], ['loomen', 'Rare'],
  ['lovander', 'Rare'], ['lunaris', 'Rare'], ['majex', 'Rare'],
  ['maraith', 'Rare'], ['mimog', 'Rare'], ['moldron', 'Rare'],
  ['mossanda', 'Rare'], ['mossanda lux', 'Rare'], ['mycora', 'Rare'],
  ['nitemary', 'Rare'], ['nitemary botan', 'Rare'], ['nox', 'Rare'],
  ['palumba', 'Rare'], ['penking', 'Rare'], ['penking lux', 'Rare'],
  ['pierdon', 'Rare'], ['pierdon cryst', 'Rare'], ['polapup', 'Rare'],
  ['polapup terra', 'Rare'], ['prixter', 'Rare'], ['prixter lux', 'Rare'],
  ['prunelia', 'Rare'], ['quivern', 'Rare'], ['ragnahawk', 'Rare'],
  ['rayhound', 'Rare'], ['rayhound cryst', 'Rare'], ['renjishi', 'Rare'],
  ['robinquill', 'Rare'], ['robinquill terra', 'Rare'], ['roujay', 'Rare'],
  ['sekhmet', 'Rare'], ['shroomer noct', 'Rare'], ['sibelyx', 'Rare'],
  ['skutlass', 'Rare'], ['skutlass ignis', 'Rare'], ['solenne', 'Rare'],
  ['solmora lux', 'Rare'], ['sootseer', 'Rare'], ['surfent', 'Rare'],
  ['surfent terra', 'Rare'], ['sweepa', 'Rare'], ['tombat', 'Rare'],
  ['tropicaw', 'Rare'], ['univolt', 'Rare'], ['univolt cryst', 'Rare'],
  ['vanwyrm', 'Rare'], ['vanwyrm cryst', 'Rare'], ['venusa', 'Rare'],
  ['wispaw', 'Rare'], ['wixen', 'Rare'], ['wixen noct', 'Rare'],
  ['wumpo', 'Rare'],
  // Common (everything else not listed above)
]);

// Element data for new Pals (best estimates based on wiki/game data)
const newPalElements = {
  'aegidron': 'Neutral',
  'amione': 'Neutral',
  'bakemi': 'Dark',
  'beakon cryst': 'Ice',
  'blue slime': 'Water',
  'bulldosu': 'Ground',
  'carnibora': 'Ground',
  'cave bat': 'Dark',
  'celesdir noct': 'Dark',
  'clovee': 'Grass',
  'dandilord': 'Neutral',
  'demon eye': 'Dark',
  'dualith': 'Ground',
  'dualith noct': 'Dark',
  'dupin': 'Water',
  'dynamoff': 'Fire',
  'eidrolon': 'Water',
  'eidrolon ignis': 'Fire',
  'elgrove': 'Grass',
  'elgrove cryst': 'Ice',
  'enchanted sword': 'Neutral',
  'eye of cthulhu': 'Dark',
  'flaracle': 'Fire',
  'gildra': 'Dragon',
  'gloopie primo': 'Neutral',
  'green slime': 'Grass',
  'hoodle': 'Dark',
  'illuminant bat': 'Electric',
  'illuminant slime': 'Electric',
  'knocklem ignis': 'Fire',
  'lapiron': 'Ice',
  'lapure': 'Water',
  'leafan': 'Grass',
  'loomen': 'Electric',
  'majex': 'Dark',
  'moldron': 'Ground',
  'moldron cryst': 'Ice',
  'muffly': 'Ice',
  'mycora': 'Grass',
  'needoll': 'Dark',
  'needoll noct': 'Dark',
  'nitemary botan': 'Grass',
  'ophydia': 'Dragon',
  'petallia ignis': 'Fire',
  'pierdon': 'Dragon',
  'pierdon cryst': 'Ice',
  'polapup terra': 'Ground',
  'prixter lux': 'Electric',
  'puffolt': 'Fire',
  'pupperai': 'Neutral',
  'purple slime': 'Dark',
  'rainbow slime': 'Neutral',
  'rayhound cryst': 'Ice',
  'red slime': 'Fire',
  'renjishi': 'Neutral',
  'roujay': 'Water',
  'sekhmet': 'Dark',
  'shaolong': 'Dragon',
  'sibelyx primo': 'Dragon',
  'silvance': 'Grass',
  'skutlass': 'Water',
  'skutlass ignis': 'Fire',
  'slowatt': 'Electric',
  'smokie cryst': 'Ice',
  'snock': 'Ice',
  'snock lux': 'Electric',
  'snugloo': 'Ice',
  'solenne': 'Grass',
  'solmora': 'Ground',
  'solmora lux': 'Electric',
  'souffline': 'Fire',
  'starryon primo': 'Dark',
  'tanzee ignis': 'Fire',
  'tetroise': 'Water',
  'tetroise primo': 'Ice',
  'tropicaw': 'Grass',
  'univolt cryst': 'Ice',
  'valentail': 'Neutral',
  'venusa': 'Grass',
  'wispaw': 'Dark',
  'wistella': 'Grass',
  'woolipop terra': 'Ground',
};

// Number assignments for new Pals
const newPalNumbers = {
  'aegidron': '157', 'amione': '158', 'bakemi': '159', 'beakon cryst': '073B',
  'blue slime': '160', 'bulldosu': '161', 'carnibora': '162', 'cave bat': '163',
  'celesdir noct': '132B', 'clovee': '164', 'dandilord': '165', 'demon eye': '166',
  'dualith': '167', 'dualith noct': '167B', 'dupin': '168', 'dynamoff': '169',
  'eidrolon': '170', 'eidrolon ignis': '170B', 'elgrove': '171', 'elgrove cryst': '171B',
  'enchanted sword': '172', 'eye of cthulhu': '173', 'flaracle': '174',
  'gildra': '175', 'gloopie primo': '151B', 'green slime': '176', 'hoodle': '177',
  'illuminant bat': '178', 'illuminant slime': '179', 'knocklem ignis': '120B',
  'lapiron': '180', 'lapure': '181', 'leafan': '182', 'loomen': '183', 'majex': '184',
  'moldron': '185', 'moldron cryst': '185B', 'muffly': '186', 'mycora': '187',
  'needoll': '188', 'needoll noct': '188B', 'nitemary botan': '128B', 'ophydia': '189',
  'petallia ignis': '087B', 'pierdon': '190', 'pierdon cryst': '190B',
  'polapup terra': '147B', 'prixter lux': '119B', 'puffolt': '191', 'pupperai': '192',
  'purple slime': '193', 'rainbow slime': '194', 'rayhound cryst': '060B',
  'red slime': '195', 'renjishi': '196', 'roujay': '197', 'sekhmet': '198',
  'shaolong': '199', 'sibelyx primo': '079B', 'silvance': '200', 'skutlass': '201',
  'skutlass ignis': '201B', 'slowatt': '202', 'smokie cryst': '131B', 'snock': '203',
  'snock lux': '203B', 'snugloo': '204', 'solenne': '205', 'solmora': '206',
  'solmora lux': '206B', 'souffline': '207', 'starryon primo': '129B',
  'tanzee ignis': '008B', 'tetroise': '208', 'tetroise primo': '208B', 'tropicaw': '209',
  'univolt cryst': '056B', 'valentail': '210', 'venusa': '211', 'wispaw': '212',
  'wistella': '213', 'woolipop terra': '034B',
};

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

function getRarity(name) {
  const key = name.toLowerCase().trim();
  if (userRarityMap.has(key)) return userRarityMap.get(key);
  // Check current data
  const existing = currentByName.get(key);
  if (existing) return existing.r;
  return 'Common'; // default
}

// Build merged dataset
const mergedPals = [];
const seen = new Set();

// Process current Pals - update bp from wiki, keep other data
currentPals.forEach(p => {
  const nameKey = p.n.toLowerCase();
  const wikiBp = wikiByRank.get(nameKey);
  const updatedBp = wikiBp !== undefined ? wikiBp : p.bp;

  mergedPals.push({
    s: p.s,
    n: p.n,
    z: p.z || p.n,
    e: p.e,
    r: p.r,
    bp: updatedBp,
    num: p.num
  });
  seen.add(nameKey);
});

// Add missing Pals from wiki data that aren't in current data
wikiData.forEach(w => {
  if (w.bp === null) return;
  const nameKey = w.name.toLowerCase();
  if (seen.has(nameKey)) return;

  const slug = slugify(w.name);
  const rarity = getRarity(w.name);
  const element = newPalElements[nameKey] || 'Neutral';
  const num = newPalNumbers[nameKey] || '';

  mergedPals.push({
    s: slug,
    n: w.name,
    z: w.name, // Use English name as Chinese fallback
    e: element,
    r: rarity,
    bp: w.bp,
    num: num
  });
  seen.add(nameKey);
  console.log(`  ➕ Added: ${w.name} (bp=${w.bp}, rarity=${rarity}, elem=${element})`);
});

// Sort by bp descending (common first, legendary last - matching original format)
mergedPals.sort((a, b) => b.bp - a.bp);

console.log(`\n📊 Merged data: ${mergedPals.length} Pals`);

// Generate pal-data.js
const header = `// Auto-generated from wiki.gg — ${new Date().toISOString().split('T')[0]}
// ${mergedPals.length} Pals
window.__PAL_DATA__ = `;

const jsonStr = JSON.stringify(mergedPals);
const output = header + jsonStr + ';\n';

fs.writeFileSync(path.join(ROOT, 'breeding-calculator', 'pal-data.js'), output);
console.log(`💾 Written breeding-calculator/pal-data.js`);

// Print stats
const rarityCounts = {};
const bpPlaceholders = mergedPals.filter(p => p.bp === 1000).length;
mergedPals.forEach(p => {
  rarityCounts[p.r] = (rarityCounts[p.r] || 0) + 1;
});
console.log(`\n📈 Stats:`);
console.log(`   Total Pals: ${mergedPals.length}`);
console.log(`   bp=1000 placeholders: ${bpPlaceholders}`);
Object.entries(rarityCounts).sort().forEach(([r, c]) => {
  console.log(`   ${r}: ${c}`);
});
