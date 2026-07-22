#!/usr/bin/env node
/**
 * Download missing Pal images from palworld.wiki.gg
 * Reads pal-data.js, checks images/pals/, downloads missing ones.
 *
 * Usage: node scripts/download-missing-pal-images.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'images', 'pals');
const BASE_URL = 'https://palworld.wiki.gg/images';

// Wiki name overrides (wiki page name → image name)
const WIKI_NAMES = {
  'tanzee_ignis': 'Tanzee_Ignis',
  'woolipop_terra': 'Woolipop_Terra',
  'eye_of_cthulhu': 'Eye_of_Cthulhu',
  'blue_slime': 'Blue_Slime',
  'green_slime': 'Green_Slime',
  'red_slime': 'Red_Slime',
  'purple_slime': 'Purple_Slime',
  'rainbow_slime': 'Rainbow_Slime',
  'illuminant_slime': 'Illuminant_Slime',
  'illuminant_bat': 'Illuminant_Bat',
  'demon_eye': 'Demon_Eye',
};

function wikiImageName(slug) {
  if (WIKI_NAMES[slug]) return WIKI_NAMES[slug];
  // Convert slug_name → Slug_Name
  return slug.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('_');
}

function download(url, filePath) {
  return new Promise((resolve) => {
    const proto = url.startsWith('https') ? https : require('http');
    const lib = url.startsWith('https') ? https : require('http');
    lib.get(url, { headers: { 'User-Agent': 'PalGuide/1.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        download(res.headers.location, filePath).then(resolve);
        return;
      }
      if (res.statusCode !== 200) {
        resolve({ ok: false, code: res.statusCode });
        return;
      }
      const file = fs.createWriteStream(filePath);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve({ ok: true }); });
      file.on('error', (e) => resolve({ ok: false, code: e.message }));
    }).on('error', (e) => resolve({ ok: false, code: e.message }));
  });
}

async function main() {
  // Load Pals from pal-data.js
  const js = fs.readFileSync(path.join(ROOT, 'breeding-calculator', 'pal-data.js'), 'utf8');
  const match = js.match(/window\.__PAL_DATA__\s*=\s*(\[[\s\S]*?\]);/);
  const pals = JSON.parse(match[1].replace(/,\s*\]/g, ']'));

  if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

  // Find missing images
  const missing = pals.filter(p => {
    const pngPath = path.join(IMG_DIR, `${p.s}.png`);
    return !fs.existsSync(pngPath);
  });

  console.log(`📦 ${pals.length} Pals total, ${missing.length} missing images\n`);

  if (missing.length === 0) {
    console.log('✅ All images already exist!');
    return;
  }

  let success = 0, failed = 0;
  const failedList = [];

  for (let i = 0; i < missing.length; i++) {
    const pal = missing[i];
    const wName = wikiImageName(pal.s);
    const url = `${BASE_URL}/${wName}_icon.png`;
    const pngPath = path.join(IMG_DIR, `${pal.s}.png`);

    process.stdout.write(`  [${i+1}/${missing.length}] ${pal.n} → `);

    // Rate limit
    if (i > 0 && i % 2 === 0) {
      await new Promise(r => setTimeout(r, 400));
    }

    const result = await download(url, pngPath);
    if (result.ok) {
      console.log('✅');
      success++;

      // Try to convert to webp (non-critical)
      try {
        execSync(`sips -s format webp "${pngPath}" --out "${path.join(IMG_DIR, `${pal.s}.webp`)}" 2>/dev/null || true`, { stdio: 'ignore' });
      } catch {}
    } else {
      console.log(`❌ HTTP ${result.code}`);
      failed++;
      failedList.push(pal.n);
    }
  }

  console.log(`\n══════════════════════════════`);
  console.log(`  ✅ Downloaded: ${success}`);
  console.log(`  ❌ Failed:     ${failed}`);
  console.log(`══════════════════════════════`);

  if (failedList.length > 0) {
    console.log(`\n⚠️  Failed images (${failedList.length}):`);
    failedList.forEach(n => console.log(`   - ${n}`));
    console.log(`\n   These may not have wiki images yet.`);
  }
}

main().catch(console.error);
