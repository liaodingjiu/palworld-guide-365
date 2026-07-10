#!/usr/bin/env node
/**
 * PalGuide Build Script — Data-Driven Page Generator
 *
 * Reads structured game data → renders templates → writes static HTML pages.
 * Zero dependencies. Pure Node.js.
 * Site-specific values live in config.{game}.js — this file is game-agnostic.
 *
 * Usage: node scripts/build.js
 */

const fs = require('fs');
const path = require('path');
const C = require('./config.palworld.js');

// ─── Configuration ───────────────────────────────────────────
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_DIR = path.join(__dirname, '..');
const BUILD_DATE = new Date().toISOString().split('T')[0];

// ─── Data Loaders ────────────────────────────────────────────
function loadJSON(dir, filename) {
  const filePath = path.join(DATA_DIR, dir, filename);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    console.error(`  ✗ Failed to load ${filePath}: ${e.message}`);
    return null;
  }
}

function loadAllJSON(dir) {
  const dirPath = path.join(DATA_DIR, dir);
  if (!fs.existsSync(dirPath)) return [];

  return fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const data = loadJSON(dir, f);
      if (data) console.log(`  ✓ Loaded ${dir}/${f}`);
      return data;
    })
    .filter(Boolean);
}

// ─── Ensure output directories exist ─────────────────────────
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ─── CSS (extracted to generated-components.css) ─────────────
const COMPONENT_CSS_LINK = '<link rel="stylesheet" href="/generated-components.css">';

// ─── Page Rendering ──────────────────────────────────────────
function renderPalEntityPage(pal, game) {
  const rarityLabels = { 'Legendary': '⚡ Legendary', 'Rare': '⭐ Rare', 'Epic': '💎 Epic', 'Uncommon': 'Uncommon', 'Common': 'Common' };
  const rarityLabel = rarityLabels[pal.classification.rarity] || pal.classification.rarity;

  const elementTags = pal.classification.elements.map(e => `<span class="tag tag-element">${e}</span>`).join('\n    ');
  const roleTags = pal.classification.role.map(r => `<span class="tag tag-role">${r}</span>`).join('\n    ');
  const bestForTags = pal.decision.bestFor.map(bf => `<a href="/${C.decisionUrlPrefix}/${bf}/" class="tag tag-bestfor">${bf.replace(/-/g, ' ')}</a>`).join('\n      ');

  // Game stage
  const stages = [];
  if (pal.decision.gameStage.early) stages.push('Early Game');
  if (pal.decision.gameStage.mid) stages.push('Mid Game');
  if (pal.decision.gameStage.late) stages.push('Late Game');

  // Work suitability
  const workLabels = {
    kindling: '🔥 Kindling', watering: '💧 Watering', planting: '🌱 Planting',
    generating: '⚡ Generating', handiwork: '🔧 Handiwork', gathering: '🌿 Gathering',
    lumbering: '🪓 Lumbering', mining: '⛏️ Mining', medicine: '💊 Medicine',
    cooling: '❄️ Cooling', transporting: '📦 Transporting', farming: '🐄 Farming'
  };
  const workEntries = Object.entries(pal.workSuitability)
    .filter(([, lv]) => lv > 0)
    .sort(([, a], [, b]) => b - a);

  const workHTML = workEntries.length > 0 ? workEntries.map(([key, level]) => {
    const bars = Array.from({length: 4}, (_, i) => `<span class="work-bar${i < level ? ' filled' : ''}"></span>`).join('');
    return `<div class="work-item">
        <span class="work-label">${workLabels[key] || key}</span>
        <div class="work-bars">${bars}</div>
        <span class="work-level">Lv ${level}</span>
      </div>`;
  }).join('\n    ') : '<p>No work suitability — this Pal is purely for combat or riding.</p>';

  // Stats
  const maxStat = Math.max(pal.stats.hp, pal.stats.attack, pal.stats.defense, pal.stats.speed, pal.stats.stamina, pal.stats.rangedAttack || 0);
  const statBars = [
    { label: 'HP', value: pal.stats.hp },
    { label: 'Attack', value: pal.stats.attack },
    { label: 'Defense', value: pal.stats.defense },
    { label: 'Speed', value: pal.stats.speed },
    { label: 'Stamina', value: pal.stats.stamina },
  ];
  if (pal.stats.rangedAttack) statBars.push({ label: 'Ranged ATK', value: pal.stats.rangedAttack });

  const statsHTML = statBars.map(s => {
    const pct = Math.round((s.value / maxStat) * 100);
    return `<div class="stat-row">
        <span class="stat-label">${s.label}</span>
        <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${pct}%" aria-valuenow="${s.value}" aria-valuemin="0" aria-valuemax="${maxStat}"></div></div>
        <span class="stat-value">${s.value}</span>
      </div>`;
  }).join('\n    ');

  // Skills
  const skillsHTML = pal.skills.map(s => `<tr>
        <td><strong>${s.name}</strong></td>
        <td><span class="tag tag-element">${s.element}</span></td>
        <td>${s.power}</td>
        <td>${s.cooldown}s</td>
        <td>Lv ${s.level}</td>
      </tr>`).join('\n    ');

  // Acquisition
  const methods = [];
  if (pal.acquisition.isCatchable && pal.acquisition.habitats && pal.acquisition.habitats.length > 0) {
    methods.push(`<li><strong>Catch:</strong> Found in ${pal.acquisition.habitats.map(h => h.replace(/_/g, ' ')).join(', ')}.${pal.acquisition.isBossEncounter ? ` A Lv ${pal.acquisition.bossLevel} field boss spawns at <b>${pal.acquisition.bossLocation}</b>.` : ''}</li>`);
  }
  if (pal.acquisition.isBreedable) {
    const specialCount = pal.breeding.specialCombinations?.length || 0;
    methods.push(`<li><strong>Breeding:</strong> ${pal.name.en} can be obtained via breeding.${specialCount > 0 ? ` Has ${specialCount} guaranteed special combo(s) (see Breeding section below).` : ' Use the standard breeding power formula with any two Pals.'}</li>`);
  }

  // Breeding
  let breedingHTML = '';
  if (pal.acquisition.isBreedable) {
    const specialCount = pal.breeding.specialCombinations?.length || 0;
    const comboRows = specialCount > 0 ? pal.breeding.specialCombinations.map(c => `<tr>
          <td><a href="/pal/${c.parentA}/">${c.parentA.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</a></td>
          <td><a href="/pal/${c.parentB}/">${c.parentB.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</a></td>
          <td><strong>${pal.name.en}</strong></td>
          <td>✅ Guaranteed</td>
        </tr>`).join('\n    ') : '';

    breedingHTML = `<section class="breeding-section">
  <h2>How to Breed ${pal.name.en}</h2>
  <p class="section-intro">${pal.name.en} has a breeding power of <b>${pal.breeding.breedingPower}</b>.${specialCount > 0 ? ` There ${specialCount > 1 ? 'are' : 'is'} <b>${specialCount}</b> special combination${specialCount > 1 ? 's' : ''} that guarantee${specialCount === 1 ? 's' : ''} ${pal.name.en}:` : ' No special combinations exist — use the standard breeding power formula.'}</p>
  ${comboRows ? `<table class="breeding-table"><thead><tr><th>Parent A</th><th>Parent B</th><th>Result</th><th>Chance</th></tr></thead><tbody>${comboRows}</tbody></table>` : ''}
  <p style="margin-top:1rem;">🧬 Find all breeding paths to ${pal.name.en} with the <a href="${C.toolCards[1].href}">${C.toolCards[1].title}</a>.</p>
</section>`;
  }

  // Drops
  let dropsHTML = '';
  if (pal.drops && pal.drops.length > 0) {
    dropsHTML = `<section class="drops-section">
  <h2>Drops</h2>
  <table class="drops-table"><thead><tr><th>Item</th><th>Drop Rate</th><th>Quantity</th></tr></thead><tbody>
    ${pal.drops.map(d => `<tr><td>${d.itemId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td><td>${d.dropRate}</td><td>${d.quantity[0]}–${d.quantity[1]}</td></tr>`).join('\n    ')}
  </tbody></table>
</section>`;
  }

  // Best uses
  let bestUsesHTML = '';
  if (pal.decision.bestFor && pal.decision.bestFor.length > 0) {
    const usesWithScores = pal.decision.bestFor
      .map(bf => ({ scenario: bf, score: pal.decision.scores[bf] || 0, reasons: pal.decision.reasons[bf] || [] }))
      .filter(u => u.score > 0)
      .sort((a, b) => b.score - a.score);

    if (usesWithScores.length > 0) {
      bestUsesHTML = `<section class="best-uses">
  <h2>Best Uses for ${pal.name.en}</h2>
  <p class="section-intro">Based on our decision scoring system, ${pal.name.en} excels at:</p>
  <div class="use-cards">
    ${usesWithScores.map(u => `<div class="use-card">
        <div class="use-header">
          <h3><a href="/${C.decisionUrlPrefix}/${u.scenario}/">${C.getScenarioLabel(u.scenario)}</a></h3>
          <span class="use-score">${u.score}/100</span>
        </div>
        ${u.reasons.length > 0 ? `<ul class="use-reasons">${u.reasons.map(r => `<li>${r}</li>`).join('')}</ul>` : ''}
      </div>`).join('\n    ')}
  </div>
</section>`;
    }
  }

  const title = C.buildTitle(pal, game);
  const description = C.buildDescription(pal, game);
  const keywords = C.buildKeywords(pal);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="keywords" content="${keywords}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${C.domain}/${C.entityUrlPrefix}/${pal.slug}/">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="article">
<meta property="og:url" content="${C.domain}/${C.entityUrlPrefix}/${pal.slug}/">
<link rel="stylesheet" href="/shared.css">
${COMPONENT_CSS_LINK}
<script type="application/ld+json">
${JSON.stringify(C.schemaOrgEntity(pal, game), null, 2)}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "${C.domain}/" },
    { "@type": "ListItem", "position": 2, "name": "${C.nav.breadcrumbEntityLabel}", "item": "${C.domain}${C.nav.breadcrumbEntityHref}" },
    { "@type": "ListItem", "position": 3, "name": "${pal.name.en}", "item": "${C.domain}/${C.entityUrlPrefix}/${pal.slug}/" }
  ]
}
</script>
<script type="text/javascript">(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${C.clarityId}");</script>
</head>
<body>

<div class="top-bar">
  ${C.ui.topBar(game)} — <time datetime="${game.lastUpdated}">${game.lastUpdated}</time>.
</div>

<nav aria-label="Main navigation">
  <div class="nav-inner">
    <a href="${C.nav.logoHref}" class="logo">${C.nav.logoHTML}</a>
    <div class="nav-links">
      ${C.nav.links.map(l => `<a href="${l.href}">${l.label}</a>`).join('\n      ')}
    </div>
  </div>
</nav>

<nav class="breadcrumb" aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="${C.nav.breadcrumbEntityHref}">${C.nav.breadcrumbEntityLabel}</a></li>
    <li>${pal.name.en}</li>
  </ol>
</nav>

<main class="pal-entity">
  <header class="pal-hero">
    <div class="pal-hero-image">
      <img src="${pal.image}" alt="${pal.name.en} — ${pal.name.zh}" loading="lazy" width="400" height="400">
    </div>
    <div class="pal-hero-info">
      <span class="pal-number">No. ${String(pal.number).padStart(3, '0')}</span>
      <h1>${pal.name.en} <small>(${pal.name.zh})</small></h1>
      <div class="pal-tags">
        <span class="rarity-badge">${rarityLabel}</span>
        ${elementTags}
        ${roleTags}
      </div>
      ${bestForTags ? `<div class="pal-bestfor"><span>Best for:</span> ${bestForTags}</div>` : ''}
      <div class="pal-stage"><span>Available:</span> ${stages.join(' / ') || 'Unknown'}</div>
    </div>
  </header>

  <section class="quick-facts">
    <h2>Quick Facts</h2>
    <dl class="facts-grid">
      <div><dt>Paldeck No.</dt><dd>#${String(pal.number).padStart(3, '0')}</dd></div>
      <div><dt>Element</dt><dd>${pal.classification.elements.join(' / ')}</dd></div>
      <div><dt>Rarity</dt><dd>${pal.classification.rarity}</dd></div>
      <div><dt>Size</dt><dd>${pal.classification.size}</dd></div>
      <div><dt>Rideable</dt><dd>${pal.classification.isRideable ? '✅ Yes' : '❌ No'}</dd></div>
      <div><dt>Flying Mount</dt><dd>${pal.classification.isFlyable ? '✅ Yes' : '❌ No'}</dd></div>
      <div><dt>Partner Skill</dt><dd>${pal.partnerSkill.name}</dd></div>
    </dl>
  </section>

  <section class="stats-section">
    <h2>Stats</h2>
    <div class="stat-bars">${statsHTML}</div>
  </section>

  <section class="work-section">
    <h2>Work Suitability</h2>
    <p class="section-intro">${pal.name.en}'s base work abilities. Higher levels = faster work speed.${workEntries.length > 0 ? ` ${pal.name.en} specializes in <b>${workEntries[0][0]}</b> (Lv ${workEntries[0][1]}).` : ''}</p>
    <div class="work-grid">${workHTML}</div>
  </section>

  <section class="skills-section">
    <h2>Skills & Abilities</h2>
    <div class="partner-skill-card">
      <h3>Partner Skill: ${pal.partnerSkill.name}</h3>
      <p>${pal.partnerSkill.descriptionEn}</p>
    </div>
    <table class="skills-table">
      <thead><tr><th>Skill</th><th>Element</th><th>Power</th><th>Cooldown</th><th>Learn Lv</th></tr></thead>
      <tbody>${skillsHTML}</tbody>
    </table>
  </section>

  <section class="how-to-get">
    <h2>How to Get ${pal.name.en}</h2>
    <ul>${methods.join('\n    ')}</ul>
  </section>

  ${breedingHTML}

  ${dropsHTML}

  ${bestUsesHTML}

  <section class="related-tools">
    <h2>Related Tools</h2>
    <div class="tool-links">
      ${C.toolCards.map(tc => `
      <a href="${tc.href}" class="tool-card">
        <span class="tool-icon">${tc.icon}</span>
        <strong>${tc.title}</strong>
        <span>${tc.desc}</span>
      </a>`).join('')}
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="footer-inner">
    <p>© ${new Date().getFullYear()} ${C.ui.footer}</p>
    <div class="footer-links">
      <a href="/privacy.html">Privacy</a>
      <a href="/terms.html">Terms</a>
      <a href="/contact.html">Contact</a>
    </div>
  </div>
</footer>

</body>
</html>`;
}

function renderDecisionPage(decision, rankedPals, game) {
  const scenarioLabel = C.getScenarioLabel(decision.id);

  const related = C.getRelatedDecisions(decision.id);
  const icon = C.getDecisionIcon(decision.id);

  // Ranking table
  const tableRows = rankedPals.map((p, i) => {
    const elements = p.classification.elements.join(', ');
    const workLv = p.workSuitability[decision.id] || p.workSuitability.mining || 0;
    const score = p.decision.scores[decision.id] || 0;
    const stages = [];
    if (p.decision.gameStage.early) stages.push('Early');
    if (p.decision.gameStage.mid) stages.push('Mid');
    if (p.decision.gameStage.late) stages.push('Late');
    const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
    const tierClass = score >= 90 ? 's-tier' : score >= 80 ? 'a-tier' : '';
    return `<tr>
        <td class="rank-cell">${emoji}</td>
        <td><a href="/pal/${p.slug}/"><strong>${p.name.en}</strong></a> <small>${p.name.zh}</small></td>
        <td>${elements}</td>
        <td>${icon.repeat(Math.min(workLv, 4))} <span class="lv-badge">Lv ${workLv}</span></td>
        <td><span class="score-badge ${tierClass}">${score}</span></td>
        <td>${p.decision.bestFor?.slice(0, 3).map(b => b.replace(/-/g, ' ')).join(', ') || ''}</td>
        <td>${stages.join(' / ')}</td>
      </tr>`;
  }).join('\n    ');

  // Detail cards
  const detailCards = rankedPals.map((p, i) => {
    const reasons = p.decision.reasons?.[decision.id] || p.decision.reasons?.mining || [];
    return `<article class="pal-detail-card" id="${p.slug}">
      <div class="card-header">
        <span class="card-rank">#${i + 1}</span>
        <img src="${p.image}" alt="${p.name.en}" loading="lazy" width="80" height="80">
        <div>
          <h3><a href="/pal/${p.slug}/">${p.name.en}</a> <small>${p.name.zh}</small></h3>
          <span class="card-score">Score: ${p.decision.scores[decision.id] || 0}/100</span>
        </div>
      </div>
      <div class="card-body">
        <div class="card-stats">
          <span>⚔️ ATK ${p.stats.attack}</span>
          <span>🛡️ DEF ${p.stats.defense}</span>
          <span>💨 SPD ${p.stats.speed}</span>
          <span>⛏️ ${scenarioLabel} Lv ${p.workSuitability[decision.id] || p.workSuitability.mining || 0}</span>
        </div>
        ${reasons.length > 0 ? `<div class="card-pros"><h4>Why It's Good:</h4><ul>${reasons.map(r => `<li>${r}</li>`).join('')}</ul></div>` : ''}
        <div class="card-availability">
          <strong>Available:</strong>
          ${p.decision.gameStage.early ? '✅ Early' : '❌ Early'}
          ${p.decision.gameStage.mid ? '✅ Mid' : '❌ Mid'}
          ${p.decision.gameStage.late ? '✅ Late' : '❌ Late'}
        </div>
        <a href="/breeding-guide.html" class="card-cta">${C.ui.decisionCTA}</a>
      </div>
    </article>`;
  }).join('\n  ');

  const title = decision.seo.title;
  const description = decision.seo.description;
  const keywords = decision.seo.keywords.join(', ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="keywords" content="${keywords}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${decision.seo.canonical}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="article">
<meta property="og:url" content="${decision.seo.canonical}">
<link rel="stylesheet" href="/shared.css">
${COMPONENT_CSS_LINK}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${decision.content.heroTitle.en}",
  "description": "${description}",
  "about": { "@type": "VideoGame", "name": "${game.name}", "version": "${game.version}" }
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "${C.domain}/" },
    { "@type": "ListItem", "position": 2, "name": "${decision.content.heroTitle.en}", "item": "${decision.seo.canonical}" }
  ]
}
</script>
<script type="text/javascript">(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${C.clarityId}");</script>
</head>
<body>

<div class="top-bar">
  ${C.ui.decisionTopBar(game)} — <time datetime="${game.lastUpdated}">${game.lastUpdated}</time>.
</div>

<nav aria-label="Main navigation">
  <div class="nav-inner">
    <a href="${C.nav.logoHref}" class="logo">${C.nav.logoHTML}</a>
    <div class="nav-links">
      ${C.nav.links.map(l => `<a href="${l.href}">${l.label}</a>`).join('\n      ')}
    </div>
  </div>
</nav>

<nav class="breadcrumb" aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li>${decision.content.heroTitle.en}</li>
  </ol>
</nav>

<main class="decision-page">
  <header class="decision-hero">
    <h1>${decision.content.heroTitle.en}</h1>
    <p class="hero-desc">${decision.content.heroDescription.en}</p>
  </header>

  <section class="ranking-methodology">
    <h2>How We Rank</h2>
    <p>${C.ui.rankMethodology}</p>
    <ul>
      ${decision.logic.weightings.workEfficiency > 0 ? `<li><strong>Work Efficiency</strong> — work suitability level (higher = faster resource output)</li>` : ''}
      ${decision.logic.weightings.speed > 0 ? `<li><strong>Movement Speed</strong> — affects actual work rate (less time walking = more time working)</li>` : ''}
      ${decision.logic.weightings.accessibility > 0 ? `<li><strong>Accessibility</strong> — how early and easily you can obtain this Pal</li>` : ''}
      ${decision.logic.weightings.foodConsumption > 0 ? `<li><strong>Food Efficiency</strong> — lower food drain means more uptime</li>` : ''}
    </ul>
    <p>${C.ui.rankDisclaimer} Only Pals with${decision.logic.filters[0]?.field?.split('.').pop() || ''} ≥ ${decision.logic.filters[0]?.value || ''} are included.</p>
  </section>

  <section class="ranking-table-section">
    <h2>Top ${rankedPals.length} ${scenarioLabel} Pals — Ranked</h2>
    <table class="ranking-table">
      <thead>
        <tr>
          <th>Rank</th><th>Pal</th><th>Elements</th><th>${scenarioLabel} Lv</th><th>Score</th><th>Best For</th><th>Availability</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  </section>

  <section class="detail-cards">
    <h2>Detailed Breakdown</h2>
    ${detailCards}
  </section>

  <section class="related-tools">
    <h2>Related Tools</h2>
    <div class="tool-links">
      ${C.toolCards.map(tc => `
      <a href="${tc.href}" class="tool-card">
        <span class="tool-icon">${tc.icon}</span>
        <strong>${tc.title}</strong>
        <span>${tc.desc}</span>
      </a>`).join('')}
    </div>
  </section>

  ${related.length > 0 ? `<section class="related-decisions">
    <h2>Related Rankings</h2>
    <div class="decision-links">
      ${related.map(r => `<a href="/${C.decisionUrlPrefix}/${r.slug}/" class="decision-link-card">${r.label}</a>`).join('\n      ')}
    </div>
  </section>` : ''}
</main>

<footer class="site-footer">
  <div class="footer-inner">
    <p>© ${new Date().getFullYear()} ${C.ui.footer}</p>
    <div class="footer-links">
      <a href="/privacy.html">Privacy</a>
      <a href="/terms.html">Terms</a>
      <a href="/contact.html">Contact</a>
    </div>
  </div>
</footer>

</body>
</html>`;
}

// ─── Sitemap Generation ─────────────────────────────────────
function generateSitemap(pages) {
  const urls = pages.map(p => `  <url><loc>${p.url}</loc><lastmod>${p.lastmod}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// ─── Main Build ─────────────────────────────────────────────
function build() {
  console.log('🏗️  PalGuide Build — Phase 0 Pipeline\n');

  // 1. Load game data
  console.log('📦 Loading game data...');
  const game = loadJSON('', 'game.json');
  if (!game) { console.error('Failed to load game.json'); process.exit(1); }

  // 2. Load all Pals
  console.log('\n📦 Loading Pal data...');
  // Load entities from all configured entity directories
  const pals = [];
  C.entityDirs.forEach(dir => {
    const loaded = loadAllJSON(dir);
    console.log(`  → ${loaded.length} entities from data/${dir}/`);
    pals.push(...loaded);
  });
  console.log(`  → ${pals.length} total entities loaded`);

  // 3. Load all Decisions
  console.log('\n📦 Loading Decision data...');
  const decisions = loadAllJSON('decisions');
  console.log(`  → ${decisions.length} Decisions loaded`);

  // 4. Build Pal index for cross-referencing
  const palIndex = {};
  pals.forEach(p => { palIndex[p.id] = p; });

  // 5. Generate Pal entity pages
  console.log('\n📄 Generating Pal entity pages...');
  const pageList = [];
  let entityCount = 0;

  pals.forEach(pal => {
    const html = renderPalEntityPage(pal, game);
    const outDir = path.join(OUTPUT_DIR, C.entityUrlPrefix, pal.slug);
    ensureDir(outDir);
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    pageList.push({
      url: `${C.domain}/${C.entityUrlPrefix}/${pal.slug}/`,
      lastmod: game.lastUpdated,
      changefreq: 'weekly',
      priority: '0.8'
    });
    entityCount++;
  });
  console.log(`  ✓ Generated ${entityCount} entity pages → /${C.entityUrlPrefix}/{slug}/`);

  // 6. Generate Decision pages
  console.log('\n📄 Generating Decision pages...');
  let decisionCount = 0;

  decisions.forEach(decision => {
    // Find Pals that match this decision's criteria
    const filterField = decision.logic.filters[0]?.field; // e.g. "workSuitability.mining"
    const filterValue = decision.logic.filters[0]?.value || 0;

    // Get matching Pals (those with bestFor including this decision, or meeting the filter)
    let matching = pals.filter(p => {
      // Check if this Pal is marked as "bestFor" this scenario
      if (p.decision.bestFor && p.decision.bestFor.includes(decision.id)) return true;

      // Or check filter criteria
      if (filterField) {
        const parts = filterField.split('.');
        let val = p;
        for (const part of parts) { val = val?.[part]; }
        if (typeof val === 'number' && val >= filterValue) return true;
      }
      return false;
    });

    // Sort by decision score (primary) then work level (secondary)
    matching.sort((a, b) => {
      const scoreA = a.decision.scores[decision.id] || 0;
      const scoreB = b.decision.scores[decision.id] || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;

      const workA = a.workSuitability[decision.id] || a.workSuitability.mining || 0;
      const workB = b.workSuitability[decision.id] || b.workSuitability.mining || 0;
      return workB - workA;
    });

    // Limit to top 20
    matching = matching.slice(0, 20);

    if (matching.length === 0) {
      console.log(`  ⚠ No Pals matched decision "${decision.id}" — skipping`);
      return;
    }

    const html = renderDecisionPage(decision, matching, game);
    const outDir = path.join(OUTPUT_DIR, C.decisionUrlPrefix, decision.id);
    ensureDir(outDir);
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    pageList.push({
      url: `${C.domain}/${C.decisionUrlPrefix}/${decision.id}/`,
      lastmod: game.lastUpdated,
      changefreq: 'weekly',
      priority: '0.9'
    });
    decisionCount++;
  });
  console.log(`  ✓ Generated ${decisionCount} decision pages → /${C.decisionUrlPrefix}/{scenario}/`);

  // 7. Load manual pages (hand-written pages outside build pipeline)
  console.log('\n📄 Loading manual page list...');
  const manualData = loadJSON('', 'manual-pages.json');
  const manualPages = manualData?.pages || [];
  console.log(`  → ${manualPages.length} manual pages loaded`);

  // 8. Merge & generate sitemap (manual pages + generated pages, deduped by URL)
  console.log('\n📄 Generating sitemap.xml...');
  const seenUrls = new Set();
  const allPages = [];

  // Add generated pages first (they get priority on conflict)
  pageList.forEach(p => { seenUrls.add(p.url); allPages.push(p); });

  // Add manual pages (skip if already in generated list, dedup by canonical URL)
  let manualAdded = 0;
  manualPages.forEach(p => {
    if (!seenUrls.has(p.url)) {
      seenUrls.add(p.url);
      allPages.push(p);
      manualAdded++;
    }
  });

  const sitemap = generateSitemap(allPages);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), sitemap);
  console.log(`  ✓ Generated: ${pageList.length} | Manual: ${manualAdded} | Total: ${allPages.length} URLs`);

  // 8. Summary
  console.log('\n═══════════════════════════════════════');
  console.log('  ✅ Build Complete');
  console.log(`  📄 Entity pages: ${entityCount}`);
  console.log(`  📊 Decision pages: ${decisionCount}`);
  console.log(`  🗺️  Sitemap URLs: ${allPages.length} (${pageList.length} generated + ${manualAdded} manual)`);
  console.log('═══════════════════════════════════════\n');
}

// Run
build();
