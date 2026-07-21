#!/usr/bin/env node
/**
 * Fetch Pal breeding power (CombiRank) data from palworld.wiki.gg
 * Writes updated pal-data.js for the breeding calculator.
 *
 * Usage: node scripts/fetch-breeding-data.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const WIKI_API = 'palworld.wiki.gg';
const DELAY_MS = 1500; // Delay between API calls to respect rate limits

// Get all Pal page names from the category
function apiRequest(params) {
  return new Promise((resolve, reject) => {
    const query = new URLSearchParams({ format: 'json', ...params }).toString();
    const options = {
      hostname: WIKI_API,
      path: `/api.php?${query}`,
      method: 'GET',
      headers: { 'User-Agent': 'PalGuide/1.0 (data collection; palworldguides.com)' },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchBreedingRank(pageName) {
  try {
    const data = await apiRequest({
      action: 'parse',
      page: pageName,
      prop: 'properties',
      formatversion: '2'
    });

    // The parse API returns page properties
    // We need to get the raw wikitext to find the Breeding template
    const rawData = await apiRequest({
      action: 'parse',
      page: pageName,
      prop: 'wikitext',
      formatversion: '2'
    });

    const wikitext = rawData?.parse?.wikitext || '';

    // Look for breeding_rank in the Breeding template
    const rankMatch = wikitext.match(/\{\{Breeding\s*\n[^}]*\|breeding_rank\s*=\s*(\d+)/s);
    const rankMatch2 = wikitext.match(/breeding_rank\s*=\s*(\d+)/);

    if (rankMatch || rankMatch2) {
      const rank = parseInt(rankMatch?.[1] || rankMatch2?.[1]);
      return rank;
    }

    return null;
  } catch (e) {
    console.error(`  Error fetching ${pageName}: ${e.message}`);
    return null;
  }
}

async function main() {
  console.log('🔍 Fetching Pal category from wiki.gg...');

  // Step 1: Get all Pal pages
  const categoryData = await apiRequest({
    action: 'query',
    list: 'categorymembers',
    cmtitle: 'Category:Pals',
    cmlimit: 500
  });

  const pages = (categoryData?.query?.categorymembers || [])
    .map(p => p.title)
    .filter(t => !t.includes(':') && t !== 'Alpha Pals' && t !== 'Breeding');

  console.log(`📋 Found ${pages.length} Pal pages\n`);

  // Step 2: Fetch breeding rank for each Pal
  const results = [];
  let success = 0;
  let failed = 0;

  for (let i = 0; i < pages.length; i++) {
    const pageName = pages[i];
    process.stdout.write(`  [${i+1}/${pages.length}] ${pageName}... `);

    const rank = await fetchBreedingRank(pageName);

    if (rank !== null) {
      console.log(`✅ bp=${rank}`);
      results.push({ name: pageName, bp: rank });
      success++;
    } else {
      console.log(`❌ no breeding_rank found`);
      results.push({ name: pageName, bp: null });
      failed++;
    }

    // Delay to respect rate limits
    if (i < pages.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n📊 Results: ${success} success, ${failed} failed out of ${pages.length}`);

  // Step 3: Save results
  const outPath = path.join(__dirname, '..', 'data', 'wiki-breeding-ranks.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`💾 Saved to ${outPath}`);

  // Step 4: Show Pals without data
  const missing = results.filter(r => r.bp === null).map(r => r.name);
  if (missing.length > 0) {
    console.log(`\n⚠️  Missing breeding_rank for ${missing.length} Pals:`);
    missing.forEach(n => console.log(`   - ${n}`));
  }
}

main().catch(console.error);
