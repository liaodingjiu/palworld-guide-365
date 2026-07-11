#!/usr/bin/env node
/**
 * Pal Database Index Page Generator
 * Reads all Pal JSON data → generates /pals/index.html with search + filter.
 *
 * Usage: node scripts/build-pals-index.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'pals');
const OUT_DIR = path.join(__dirname, '..', 'pals');
const DOMAIN = 'https://palworldguides.com';
const CLARITY_ID = 'xk4e29fx10';

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Load all Pal data
const pals = fs.readdirSync(DATA_DIR)
  .filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf-8')))
  .sort((a, b) => a.number - b.number);

console.log(`📦 Loaded ${pals.length} Pals for index page`);

// ─── Element definitions ──────────────────────────────────────
const ELEMENTS = [
  { key: 'Neutral', icon: '⚪', label: 'Neutral' },
  { key: 'Fire', icon: '🔥', label: 'Fire' },
  { key: 'Water', icon: '💧', label: 'Water' },
  { key: 'Grass', icon: '🌿', label: 'Grass' },
  { key: 'Electric', icon: '⚡', label: 'Electric' },
  { key: 'Ice', icon: '❄️', label: 'Ice' },
  { key: 'Dark', icon: '🌑', label: 'Dark' },
  { key: 'Ground', icon: '🪨', label: 'Ground' },
  { key: 'Dragon', icon: '🐉', label: 'Dragon' },
];

const WORK_TYPES = [
  { key: 'kindling', icon: '🔥', label: 'Kindling' },
  { key: 'watering', icon: '💧', label: 'Watering' },
  { key: 'planting', icon: '🌱', label: 'Planting' },
  { key: 'generating', icon: '⚡', label: 'Generating' },
  { key: 'handiwork', icon: '🔧', label: 'Handiwork' },
  { key: 'gathering', icon: '🌿', label: 'Gathering' },
  { key: 'lumbering', icon: '🪓', label: 'Lumbering' },
  { key: 'mining', icon: '⛏️', label: 'Mining' },
  { key: 'medicine', icon: '💊', label: 'Medicine' },
  { key: 'cooling', icon: '❄️', label: 'Cooling' },
  { key: 'transporting', icon: '📦', label: 'Transporting' },
  { key: 'farming', icon: '🐄', label: 'Farming' },
];

// ─── Generate Pal cards ───────────────────────────────────────
function palCard(pal) {
  const name = pal.name.en;
  const num = String(pal.number).padStart(3, '0');
  const primaryElem = pal.classification.elements[0] || 'Neutral';
  const elData = ELEMENTS.find(x => x.key === primaryElem) || {icon:'⭐',color:'#6b7280'};

  // Top 3 work abilities as compact icon+level
  const topWork = Object.entries(pal.workSuitability)
    .filter(([, lv]) => lv > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key, lv]) => {
      const wt = WORK_TYPES.find(w => w.key === key);
      return wt ? `<span class="pc-work-badge" title="${wt.label} Lv ${lv}">${wt.icon}<small>${lv}</small></span>` : '';
    }).join('');

  // Power score: total work levels + combat bonus
  const totalWork = Object.values(pal.workSuitability).reduce((a,b)=>a+b,0);
  const atk = pal.stats?.attack || 70;
  const powerScore = Math.min(99, Math.round(totalWork * 2 + atk / 3));

  const rarity = pal.classification.rarity;
  const rarityClass = rarity === 'Legendary' ? 'legendary' : rarity === 'Epic' ? 'epic' : rarity === 'Rare' ? 'rare' : '';

  return `<a href="/pal/${pal.slug}/" class="pal-card ${rarityClass}" data-name="${name.toLowerCase()}" data-elements="${pal.classification.elements.join(',').toLowerCase()}" data-works="${Object.entries(pal.workSuitability).filter(([,lv])=>lv>0).map(([k])=>k).join(',')}" data-rarity="${rarity.toLowerCase()}">
    <div class="pc-top">
      <span class="pc-rarity ${rarityClass}">${rarity}</span>
      <span class="pc-power">⚡${powerScore}</span>
    </div>
    <div class="pc-avatar"><img src="/images/pals/${pal.slug}.webp" alt="${name}" loading="lazy" width="60" height="60" onerror="this.style.display='none';this.nextElementSibling.style.display='block'" style="width:60px;height:60px;object-fit:contain"><span class="pal-card-placeholder" style="display:none">${elData.icon}</span></div>
    <div class="pc-info">
      <div class="pc-name">${name}</div>
      <div class="pc-num">#${num}</div>
      <div class="pc-elem" style="color:${elData.color || 'var(--text2)'}">${elData.icon} ${primaryElem}</div>
    </div>
    <div class="pc-works">${topWork || '<span class="work-none">Combat</span>'}</div>
  </a>`;
}

const cardsHTML = pals.map(palCard).join('\n');

// ─── Full page ────────────────────────────────────────────────
const page = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<title>Palworld Pal Database — All 180 Pals, Searchable & Filterable | PalGuide</title>
<meta name="description" content="Browse all 180 Palworld Pals. Filter by element, work suitability, and rarity. Search by name. Each Pal has a full detail page with stats, skills, breeding combos, and best uses.">
<meta name="keywords" content="Palworld Pals, Palworld Pal list, Palworld database, all Palworld Pals, Palworld Paldex, Palworld Pal stats">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${DOMAIN}/pals/">
<meta property="og:title" content="Palworld Pal Database — All 180 Pals | PalGuide">
<meta property="og:description" content="Browse all 180 Palworld Pals with search, element filters, and work suitability filters. Your complete Palworld Paldex.">
<meta property="og:type" content="website">
<meta property="og:url" content="${DOMAIN}/pals/">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Palworld Pal Database — All 180 Pals">
<meta name="twitter:description" content="Search and filter all 180 Palworld Pals. Element, work suitability, rarity — find the perfect Pal for your base.">
<link rel="stylesheet" href="/shared.css">
<link rel="stylesheet" href="/pals.css">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Palworld Pal Database",
  "description": "Browse all 180 Palworld Pals — search by name, filter by element, work suitability, and rarity.",
  "url": "${DOMAIN}/pals/",
  "mainEntity": {
    "@type": "ItemList",
    "numberOfItems": ${pals.length},
    "itemListElement": [
      ${pals.slice(0, 20).map((pal, i) => `{
        "@type": "ListItem",
        "position": ${i + 1},
        "url": "${DOMAIN}/pal/${pal.slug}/",
        "name": "${pal.name.en}"
      }`).join(',\n      ')}
    ]
  }
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "${DOMAIN}/" },
    { "@type": "ListItem", "position": 2, "name": "Pal Database", "item": "${DOMAIN}/pals/" }
  ]
}
</script>
<script type="text/javascript">(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${CLARITY_ID}");</script>
</head>
<body>

<div class="top-bar">
  📊 Palworld Pal Database — ${pals.length} Pals. Search, filter, find your perfect Pal.
</div>

<nav aria-label="Main navigation">
  <div class="nav-inner">
    <a href="/" class="logo">Pal<span>Guide</span></a>
    <div class="nav-right">
      <ul class="nav-links">
        <li><a href="/pals/" class="active">Pals</a></li>
        <li><a href="/best-pals.html">Best Pals</a></li>
        <li><a href="/breeding-guide.html">Breeding</a></li>
        <li><a href="/about.html">About</a></li>
      </ul>
      <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">☀️</button>
    </div>
  </div>
</nav>

<main class="container">

<nav class="breadcrumb" aria-label="Breadcrumb">
  <a href="/">Home</a> / Pal Database
</nav>

<section class="pals-hero">
  <h1>Palworld Pal Database</h1>
  <p>Browse all ${pals.length} Pals. Use the filters below to find the perfect Pal for combat, base work, or exploration. Click any card for full stats, skills, breeding combos, and more.</p>
  <div class="pals-stats">
    <div class="pals-stat"><strong>${pals.length}</strong> Pals</div>
    <div class="pals-stat"><strong>9</strong> Elements</div>
    <div class="pals-stat"><strong>12</strong> Work Types</div>
  </div>
</section>

<!-- Filters -->
<div class="filters-bar" id="filters">
  <div class="filter-search">
    <input type="text" id="searchInput" placeholder="Search by name..." aria-label="Search Pals by name" autocomplete="off">
  </div>

  <div class="filter-group">
    <span class="filter-label">Element:</span>
    <button class="filter-chip active" data-filter="element" data-value="all">All</button>
    ${ELEMENTS.map(e => `<button class="filter-chip" data-filter="element" data-value="${e.key.toLowerCase()}">${e.icon} ${e.label}</button>`).join('\n    ')}
  </div>

  <div class="filter-group">
    <span class="filter-label">Work:</span>
    <button class="filter-chip active" data-filter="work" data-value="all">All</button>
    ${WORK_TYPES.map(w => `<button class="filter-chip" data-filter="work" data-value="${w.key}">${w.icon} ${w.label}</button>`).join('\n    ')}
  </div>

  <div class="filter-group">
    <span class="filter-label">Rarity:</span>
    <button class="filter-chip active" data-filter="rarity" data-value="all">All</button>
    <button class="filter-chip" data-filter="rarity" data-value="common">Common</button>
    <button class="filter-chip" data-filter="rarity" data-value="uncommon">Uncommon</button>
    <button class="filter-chip" data-filter="rarity" data-value="rare">Rare</button>
    <button class="filter-chip" data-filter="rarity" data-value="epic">Epic</button>
    <button class="filter-chip" data-filter="rarity" data-value="legendary">⚡ Legendary</button>
  </div>

  <div class="filter-results">
    Showing <strong id="resultCount">${pals.length}</strong> Pals
  </div>
</div>

<!-- Pal Card Grid -->
<div class="pals-grid-scroll"><div class="pals-grid" id="palsGrid">
${cardsHTML}
</div></div><!-- /pals-grid-scroll -->

<div class="no-results" id="noResults" style="display:none;">
  <p>😕 No Pals match your filters. Try adjusting the search or filter criteria.</p>
</div>

</main>

<footer>
  <p>PalGuide — The independent Palworld resource. Not affiliated with Pocketpair.</p>
  <p style="margin-top:8px">
    <a href="/about.html">About</a> &nbsp;|&nbsp;
    <a href="/privacy.html">Privacy Policy</a> &nbsp;|&nbsp;
    <a href="/terms.html">Terms of Use</a> &nbsp;|&nbsp;
    <a href="/contact.html">Contact</a> &nbsp;|&nbsp;
    <a href="/sitemap.xml">Sitemap</a>
  </p>
</footer>

<script src="/cookie-consent.js"></script>
<script>
// ─── Filter logic ──────────────────────────────────────────
(function(){
  var activeFilters = { element: 'all', work: 'all', rarity: 'all' };
  var searchTerm = '';
  var cards = document.querySelectorAll('.pal-card');
  var chips = document.querySelectorAll('.filter-chip');
  var searchInput = document.getElementById('searchInput');
  var resultCount = document.getElementById('resultCount');
  var noResults = document.getElementById('noResults');
  var grid = document.getElementById('palsGrid');

  function applyFilters() {
    var count = 0;
    cards.forEach(function(card) {
      var match = true;
      var name = card.getAttribute('data-name');
      var elements = card.getAttribute('data-elements');
      var works = card.getAttribute('data-works');
      var rarity = card.getAttribute('data-rarity');

      if (searchTerm && name.indexOf(searchTerm) === -1) match = false;
      if (activeFilters.element !== 'all' && elements.indexOf(activeFilters.element) === -1) match = false;
      if (activeFilters.work !== 'all' && works.indexOf(activeFilters.work) === -1) match = false;
      if (activeFilters.rarity !== 'all' && rarity !== activeFilters.rarity) match = false;

      card.style.display = match ? '' : 'none';
      if (match) count++;
    });
    resultCount.textContent = count;
    noResults.style.display = count === 0 ? '' : 'none';
  }

  chips.forEach(function(chip) {
    chip.addEventListener('click', function() {
      var filter = this.getAttribute('data-filter');
      var value = this.getAttribute('data-value');

      // Toggle active state
      chips.forEach(function(c) {
        if (c.getAttribute('data-filter') === filter) c.classList.remove('active');
      });
      this.classList.add('active');

      activeFilters[filter] = value;
      applyFilters();

      if (window.clarity) clarity('event', 'pal_filter', { filter: filter, value: value });
    });
  });

  searchInput.addEventListener('input', function() {
    searchTerm = this.value.toLowerCase().trim();
    applyFilters();
  });
})();

// ─── Theme toggle ──────────────────────────────────────────
(function() {
  var toggle = document.getElementById('themeToggle');
  var stored = localStorage.getItem('palguide-theme');
  if (stored) document.documentElement.setAttribute('data-theme', stored);
  if (toggle) {
    toggle.addEventListener('click', function() {
      var current = document.documentElement.getAttribute('data-theme');
      var next = (current === 'dark') ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('palguide-theme', next);
    });
  }
})();
</script>

</body>
</html>`;

fs.writeFileSync(path.join(OUT_DIR, 'index.html'), page);
console.log(`✅ Generated /pals/index.html with ${pals.length} Pal cards`);
