#!/usr/bin/env node
/**
 * Update all "287 Pals" references across the site to reflect the actual Pal count.
 *
 * Reads pal-data.js to get the real count, then updates all HTML/JS files.
 *
 * Usage: node scripts/update-pal-count.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Get actual Pal count from pal-data.js
const palDataJs = fs.readFileSync(path.join(ROOT, 'breeding-calculator', 'pal-data.js'), 'utf-8');
const match = palDataJs.match(/window\.__PAL_DATA__\s*=\s*(\[[\s\S]*?\]);/);
const palData = JSON.parse(match[1].replace(/,\s*\]/g, ']'));
const actualCount = palData.length;

// Calculate approximate number of combinations
const combos = Math.floor(actualCount * actualCount / 2);

console.log(`📊 Actual Pal count: ${actualCount}`);
console.log(`🔢 Estimated combinations: ~${combos.toLocaleString()}`);
console.log(`\n📝 Updating files...\n`);

// Files to update and their specific replacements
const filesToUpdate = [
  'index.html',
  'breeding-calculator-guide.html',
  'breeding-calculator/index.html',
  'breeding-guide.html',
  'beginner-guide.html',
  'fast-leveling.html',
  'palworld-1.0-update.html',
  'map/index.html'
];

// Old values → new values mapping
const replacements = [
  // "287 Pals" → actual count
  { old: /287 Pals/g, new: `${actualCount} Pals` },
  { old: /287-Pals/g, new: `${actualCount}-Pals` },
  { old: /287 species/g, new: `${actualCount} species` },
  { old: /287 Pal species/g, new: `${actualCount} Pal species` },
  // Hero counter values
  { old: />287</g, new: `>${actualCount}<` },
  // Combination counts
  { old: /19,000\+/g, new: `${combos.toLocaleString()}+` },
  { old: /19K\+/g, new: `${Math.floor(combos/1000)}K+` },
  { old: /41,000\+/g, new: `${(combos*2).toLocaleString()}+` },
  { old: /41K\+/g, new: `${Math.floor(combos*2/1000)}K+` },
  // In text references
  { old: /"287"/g, new: `"${actualCount}"` },
  // 72 new Pals (in 1.0 update page)
  { old: /72 new Pals/g, new: `${actualCount - 138} new Pals` }, // rough estimate
  { old: /47 new \+ 25 variants/g, new: `${actualCount - 138} total new` },
];

filesToUpdate.forEach(filename => {
  const filePath = path.join(ROOT, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  Not found: ${filename}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  replacements.forEach(({ old, new: newStr }) => {
    if (old.test(content)) {
      content = content.replace(old, newStr);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Updated: ${filename}`);
  } else {
    console.log(`  ⏭️  No changes: ${filename}`);
  }
});

console.log(`\n✅ Done! Updated all references from 287 → ${actualCount} Pals.`);
console.log(`   Combinations: 19,000+ → ${combos.toLocaleString()}+`);
