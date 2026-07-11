#!/usr/bin/env node
/**
 * Pal Image Downloader — from palworld.wiki.gg
 *
 * Downloads Pal icon images using the wiki's naming convention.
 * Rate-limited to be polite. Skips already-downloaded images.
 *
 * Usage: node scripts/download-pal-images.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const DATA_DIR = path.join(__dirname, '..', 'data', 'pals');
const IMG_DIR = path.join(__dirname, '..', 'images', 'pals');
const BASE_URL = 'https://palworld.wiki.gg/images';

if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

// Load all Pals
const pals = fs.readdirSync(DATA_DIR)
  .filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf-8')));

console.log(`📦 ${pals.length} Pals loaded. Starting downloads...\n`);

// Known naming overrides (wiki uses different names than our ID)
const NAME_OVERRIDES = {
  'gobfin_ignis': 'Gobfin_Ignis',
  'leezpunk_ignis': 'Leezpunk_Ignis',
  'incineram_noct': 'Incineram_Noct',
  'robinquill_terra': 'Robinquill_Terra',
  'surfent_terra': 'Surfent_Terra',
  'cryolinx_terra': 'Cryolinx_Terra',
  'dinossom_lux': 'Dinossom_Lux',
  'broncherry_aqua': 'Broncherry_Aqua',
  'wumpo_botan': 'Wumpo_Botan',
  'hangyu_cryst': 'Hangyu_Cryst',
  'mau_cryst': 'Mau_Cryst',
  'mammorest_cryst': 'Mammorest_Cryst',
  'reptyro_cryst': 'Reptyro_Cryst',
  'vanwyrm_cryst': 'Vanwyrm_Cryst',
  'elphidran_aqua': 'Elphidran_Aqua',
  'suzaku_aqua': 'Suzaku_Aqua',
  'relaxaurus_lux': 'Relaxaurus_Lux',
  'lyleen_noct': 'Lyleen_Noct',
  'sibelyx_noct': 'Sibelyx_Noct',
  'broncherry_noct': 'Broncherry_Noct',
  'bristla_noct': 'Bristla_Noct',
  'cinnamoth_noct': 'Cinnamoth_Noct',
  'beegarde_noct': 'Beegarde_Noct',
  'rooby_noct': 'Rooby_Noct',
  'mossanda_ignis': 'Mossanda_Lux', // might need special handling
  'xenovader': 'Xenovader',
  'xenolord': 'Xenolord',
  'dragostrophe': 'Dragostrophe',
  'dragostrophe_noct': 'Dragostrophe_Noct',
  'bellanoir': 'Bellanoir',
  'bellanoir_libero': 'Bellanoir_Libero',
  'blazamut_ryu': 'Blazamut_Ryu',
  'selyne': 'Selyne',
  'nyafia': 'Nyafia',
  'dogen': 'Dogen',
  'dazemu': 'Dazemu',
  'tarantriss': 'Tarantriss',
  'knocklem': 'Knocklem',
  'prunellia': 'Prunellia',
  'croajiro': 'Croajiro',
  'shroomer': 'Shroomer',
  'shroomer_noct': 'Shroomer_Noct',
  'kikit': 'Kikit',
  'silkina': 'Silkina',
  'silkina_noct': 'Silkina_Noct',
  'garillat': 'Gorirat', // grizzbolt-like naming
  'quvern_botan': 'Quivern_Botan',
  'bastigor': 'Bastigor',
  'splatterina': 'Splatterina',
};

function wikiName(pal) {
  // Check override first
  if (NAME_OVERRIDES[pal.id]) return NAME_OVERRIDES[pal.id];

  // Convert "Jolthog Cryst" → "Jolthog_Cryst"
  return pal.name.en.replace(/ /g, '_');
}

function download(url, filePath) {
  return new Promise((resolve) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, (res) => {
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
      file.on('finish', () => {
        file.close();
        resolve({ ok: true, code: 200 });
      });
    }).on('error', (e) => {
      resolve({ ok: false, code: e.message });
    });
  });
}

async function run() {
  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < pals.length; i++) {
    const pal = pals[i];
    const filePath = path.join(IMG_DIR, `${pal.id}.png`);

    // Skip already downloaded
    if (fs.existsSync(filePath)) {
      skipped++;
      if (skipped % 30 === 0) console.log(`  ⏭  Skipped ${skipped} (already have)`);
      continue;
    }

    const wName = wikiName(pal);
    const url = `${BASE_URL}/${wName}_icon.png`;

    // Rate limit: 3 requests per second to be polite
    if (i > 0 && i % 3 === 0) {
      await new Promise(r => setTimeout(r, 350));
    }

    process.stdout.write(`  [${i + 1}/${pals.length}] ${pal.name.en} → `);

    try {
      const result = await download(url, filePath);
      if (result.ok) {
        console.log('✅');
        success++;
      } else {
        console.log(`❌ ${result.code}`);
        failed++;
      }
    } catch (e) {
      console.log(`❌ ${e.message}`);
      failed++;
    }
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`  ✅ Success: ${success}`);
  console.log(`  ❌ Failed:  ${failed}`);
  console.log(`  ⏭  Skipped: ${skipped}`);
  console.log(`  📁 Total:   ${pals.length}`);
  console.log(`═══════════════════════════════════════`);
}

run();
