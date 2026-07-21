#!/usr/bin/env node
/**
 * Merge wiki breeding data → updated pal-data.js (v2 - more robust).
 */

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// Load wiki breeding ranks
const wikiData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'wiki-breeding-ranks.json'), 'utf-8'));

// Load current pal-data.js
const currentJs = fs.readFileSync(path.join(ROOT, 'breeding-calculator', 'pal-data.js'), 'utf-8');
const match = currentJs.match(/window\.__PAL_DATA__\s*=\s*(\[[\s\S]*?\]);/);
const currentPals = JSON.parse(match[1].replace(/,\s*\]/g, ']'));

// Wiki bp lookup by normalized name
function normalize(s) { return s.toLowerCase().replace(/[^a-z0-9]/g, ''); }
const wikiBpMap = new Map();
wikiData.forEach(w => {
  if (w.bp !== null) {
    wikiBpMap.set(normalize(w.name), w.bp);
  }
});

// User rarity data
function getRarity(name) {
  const rarities = {
    'bellanoir':'Legendary','bellanoirlibero':'Legendary','blazamut':'Legendary',
    'blazamutryu':'Legendary','frostallion':'Legendary','frostallionnoct':'Legendary',
    'jetragon':'Legendary','necromus':'Legendary','paladius':'Legendary',
    'neptilius':'Legendary','cryolinx':'Legendary','cryolinxterra':'Legendary',
    'helzephyr':'Legendary','helzephyrlux':'Legendary','astegon':'Legendary',
    'suzaku':'Legendary','suzakuaqua':'Legendary','orserk':'Legendary',
    'shadowbeak':'Legendary','bastigor':'Legendary',
    // Epic
    'aegidron':'Epic','anubis':'Epic','beakon':'Epic','blazehowlnoct':'Epic',
    'braloha':'Epic','broncherry':'Epic','broncherryaqua':'Epic',
    'dandilord':'Epic','dualith':'Epic','dualithnoct':'Epic',
    'eidrolonignis':'Epic','elizabee':'Epic','elphidranaqua':'Epic',
    'faleris':'Epic','falerisaqua':'Epic','gildane':'Epic',
    'grizzbolt':'Epic','hartalis':'Epic',
    'jormuntide':'Epic','jormuntideignis':'Epic','kingpaca':'Epic',
    'kingpacacryst':'Epic','knocklem':'Epic','knocklemignis':'Epic',
    'lyleen':'Epic','lyleennoct':'Epic','mammorest':'Epic',
    'mammorestcryst':'Epic','menasting':'Epic','menastingterra':'Epic',
    'moldroncryst':'Epic','mossandalux':'Epic','ophydia':'Epic',
    'petallia':'Epic','petalliaignis':'Epic','pyrin':'Epic','pyrinnoct':'Epic',
    'quivernbotan':'Epic','relaxaurus':'Epic','relaxauruslux':'Epic',
    'reptyro':'Epic','reptyrocryst':'Epic','selyne':'Epic',
    'shaolong':'Epic','sibelyxprimo':'Epic','silvance':'Epic',
    'silvegis':'Epic','starryon':'Epic','starryonprimo':'Epic',
    'tetroise':'Epic','tetroiseprimo':'Epic','vaelet':'Epic','verdash':'Epic',
    'warsect':'Epic','warsectterra':'Epic','whalaska':'Epic',
    'whalaskaignis':'Epic','wumpobotan':'Epic','xenogard':'Epic',
    'azurobecryst':'Epic',
    // Rare
    'azurmane':'Rare','azurobe':'Rare','beakoncryst':'Rare',
    'blazehowl':'Rare','bushi':'Rare','bushinoct':'Rare',
    'carnibora':'Rare','celesdir':'Rare','celesdirnoct':'Rare',
    'chilletignis':'Rare','croajironoct':'Rare','dazemu':'Rare',
    'dinossom':'Rare','dinossomlux':'Rare','dogen':'Rare','dumudgild':'Rare',
    'dupin':'Rare','dynamoff':'Rare','eidrolon':'Rare',
    'eikthyrdeer':'Rare','eikthyrdeerterra':'Rare','elgrove':'Rare',
    'elgrovecryst':'Rare','elphidran':'Rare','eyeofcthulhu':'Rare',
    'felbat':'Rare','flaracle':'Rare','foxcicle':'Rare',
    'ghangler':'Rare','ghanglerignis':'Rare','gildra':'Rare',
    'gloopie':'Rare','gloopprimo':'Rare','gorirat':'Rare',
    'goriratterra':'Rare','grintale':'Rare','katress':'Rare',
    'katressignis':'Rare','kitsun':'Rare','kitsunnoct':'Rare',
    'leafan':'Rare','loomen':'Rare','lovander':'Rare','lunaris':'Rare',
    'majex':'Rare','maraith':'Rare','mimog':'Rare','moldron':'Rare',
    'mossanda':'Rare','mycora':'Rare','nitemary':'Rare',
    'nitemarybotan':'Rare','nox':'Rare','palumba':'Rare','penking':'Rare',
    'penkinglux':'Rare','pierdon':'Rare','pierdoncryst':'Rare',
    'polapup':'Rare','polapuplux':'Rare','prixter':'Rare',
    'prixterlux':'Rare','prunelia':'Rare','quivern':'Rare',
    'ragnahawk':'Rare','rayhound':'Rare','rayhoundcryst':'Rare',
    'renjishi':'Rare','robinquill':'Rare','robinquillterra':'Rare',
    'roujay':'Rare','sekhmet':'Rare','shroomernoct':'Rare','sibelyx':'Rare',
    'skutlass':'Rare','skutlassignis':'Rare','solenne':'Rare',
    'solmoralux':'Rare','sootseer':'Rare','surfent':'Rare',
    'surfentterra':'Rare','sweepa':'Rare','tombat':'Rare','tropicaw':'Rare',
    'univolt':'Rare','univoltcryst':'Rare','vanwyrm':'Rare',
    'vanwyrmcryst':'Rare','venusa':'Rare','wispaw':'Rare',
    'wixen':'Rare','wixennoct':'Rare','wumpo':'Rare',
  };
  return rarities[normalize(name)] || 'Common';
}

// Element data for brand new Pals
function getElement(name) {
  const elements = {
    'aegidron':'Neutral','amione':'Neutral','bakemi':'Dark',
    'beakoncryst':'Ice','blueslime':'Water','bulldosu':'Ground',
    'carnibora':'Ground','cavebat':'Dark','celesdirnoct':'Dark',
    'clovee':'Grass','dandilord':'Neutral','demoneye':'Dark',
    'dualith':'Ground','dualithnoct':'Dark','dupin':'Water',
    'dynamoff':'Fire','eidrolon':'Water','eidrolonignis':'Fire',
    'elgrove':'Grass','elgrovecryst':'Ice','enchantedsword':'Neutral',
    'eyeofcthulhu':'Dark','flaracle':'Fire','gildra':'Dragon',
    'gloopieprimo':'Neutral','greenslime':'Grass','hoodle':'Dark',
    'illuminantbat':'Electric','illuminantslime':'Electric',
    'knocklemignis':'Fire','lapiron':'Ice','lapure':'Water',
    'leafan':'Grass','loomen':'Electric','majex':'Dark',
    'moldron':'Ground','moldroncryst':'Ice','muffly':'Ice',
    'mycora':'Grass','needoll':'Dark','needollnoct':'Dark',
    'nitemarybotan':'Grass','ophydia':'Dragon','petalliaignis':'Fire',
    'pierdon':'Dragon','pierdoncryst':'Ice','polapupterra':'Ground',
    'prixterlux':'Electric','puffolt':'Fire','pupperai':'Neutral',
    'purpleslime':'Dark','rainbowslime':'Neutral','rayhoundcryst':'Ice',
    'redslime':'Fire','renjishi':'Neutral','roujay':'Water',
    'sekhmet':'Dark','shaolong':'Dragon','sibelyxprimo':'Dragon',
    'silvance':'Grass','skutlass':'Water','skutlassignis':'Fire',
    'slowatt':'Electric','smokiecryst':'Ice','snock':'Ice',
    'snocklux':'Electric','snugloo':'Ice','solenne':'Grass',
    'solmora':'Ground','solmoralux':'Electric','souffline':'Fire',
    'starryonprimo':'Dark','tanzeeignis':'Fire','tetroise':'Water',
    'tetroiseprimo':'Ice','tropicaw':'Grass','univoltcryst':'Ice',
    'valentail':'Neutral','venusa':'Grass','wispaw':'Dark',
    'wistella':'Grass','woolipopterra':'Ground',
    'bigfoxwolf':'Neutral','boltmane':'Electric',
    'darkmutant':'Dark','dragostrophe':'Dragon','falerisnoct':'Dark',
    'panthalus':'Ice',
  };
  return elements[normalize(name)] || 'Neutral';
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

// === Build merged dataset ===
const mergedMap = new Map();
const seenSlugs = new Set();

// Process current Pals - update bp from wiki, keep everything else
currentPals.forEach(p => {
  const wikiBp = wikiBpMap.get(normalize(p.n));
  const updatedBp = wikiBp !== undefined ? wikiBp : p.bp;

  const entry = {
    s: p.s,
    n: p.n,
    z: p.z || p.n,
    e: p.e,
    r: p.r,
    bp: updatedBp,
    num: p.num
  };

  mergedMap.set(p.s, entry);
  seenSlugs.add(p.s);
  seenSlugs.add(normalize(p.n));

  if (wikiBp !== undefined && wikiBp !== p.bp) {
    console.log(`  🔄 Updated bp: ${p.n} ${p.bp} → ${wikiBp}`);
  }
});

// Add missing Pals from wiki data
wikiData.forEach(w => {
  if (w.bp === null) return;
  const slug = slugify(w.name);
  const normName = normalize(w.name);

  // Skip if already in merged set (matched by slug or normalized name)
  if (mergedMap.has(slug) || seenSlugs.has(normName)) return;

  // Skip meta pages
  if (['Pals', 'Palpedia', 'Pals/Internalnames', 'LegendaryPals', 'LuckyPals', 'PredatorPals'].includes(normName)) return;

  const entry = {
    s: slug,
    n: w.name,
    z: w.name,
    e: getElement(w.name),
    r: getRarity(w.name),
    bp: w.bp,
    num: ''
  };

  mergedMap.set(slug, entry);
  seenSlugs.add(normName);
  console.log(`  ➕ Added: ${w.name} (bp=${w.bp}, r=${entry.r})`);
});

// Convert to array and sort by bp descending
const mergedList = Array.from(mergedMap.values());
mergedList.sort((a, b) => b.bp - a.bp);

console.log(`\n📊 Final count: ${mergedList.length} Pals`);

// Generate output
const header = `// Auto-generated from wiki.gg — ${new Date().toISOString().split('T')[0]}
// ${mergedList.length} Pals
window.__PAL_DATA__ = `;

const jsonStr = JSON.stringify(mergedList);
const output = header + jsonStr + ';\n';

const outPath = path.join(ROOT, 'breeding-calculator', 'pal-data.js');
fs.writeFileSync(outPath, output);
console.log(`💾 Written ${outPath}`);

// Stats
const rarityCounts = {};
mergedList.forEach(p => {
  rarityCounts[p.r] = (rarityCounts[p.r] || 0) + 1;
});
console.log(`\n📈 Rarity distribution:`);
Object.entries(rarityCounts).sort((a,b) => {
  const order = {'Common':1,'Uncommon':2,'Rare':3,'Epic':4,'Legendary':5};
  return (order[a[0]]||9) - (order[b[0]]||9);
}).forEach(([r, c]) => {
  console.log(`   ${r}: ${c}`);
});
