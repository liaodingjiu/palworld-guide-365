#!/usr/bin/env node
/**
 * Pal Data Generator — Creates individual Pal JSON files from master database.
 *
 * Reads the master pal-database.json → writes individual JSONs to data/pals/
 * Run before build.js to ensure all 180 Pal data files exist.
 *
 * Usage: node scripts/generate-pal-data.js
 */

const fs = require('fs');
const path = require('path');

const MASTER_FILE = path.join(__dirname, '..', 'data', 'pal-database.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'pals');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Load master database
const master = JSON.parse(fs.readFileSync(MASTER_FILE, 'utf-8'));
const pals = master.pals;

console.log(`📦 Generating ${pals.length} Pal JSON files...\n`);

let count = 0;
pals.forEach(pal => {
  const filePath = path.join(OUTPUT_DIR, `${pal.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(pal, null, 2));
  count++;
});

console.log(`✅ Generated ${count} Pal JSON files → data/pals/`);
console.log(`\nNext: Run node scripts/build.js to generate HTML pages.`);
