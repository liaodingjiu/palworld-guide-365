// Palworld site configuration — extracted from build.js hardcoded values.
// All site-specific strings live here. build.js reads from this config.
// To reuse build.js for another game: copy this file, edit values, done.

module.exports = {
  // ── Site identity ──────────────────────────────────────────
  domain: 'https://palworldguides.com',
  clarityId: 'xk4e29fx10',
  siteName: 'PalGuide',

  // ── Data directories (relative to /data/) ──────────────────
  entityDirs: ['pals'],                    // data/pals/
  decisionDir: 'decisions',                // data/decisions/
  manualPagesFile: 'manual-pages.json',    // data/manual-pages.json

  // ── URL structure ──────────────────────────────────────────
  entityUrlPrefix: 'pal',                  // /pal/{slug}/
  decisionUrlPrefix: 'best-pals',          // /best-pals/{scenario}/

  // ── Navigation ─────────────────────────────────────────────
  nav: {
    logoHTML: 'Pal<span>Guide</span>',
    logoHref: '/',
    links: [
      { href: '/best-pals.html', label: 'Pal Finder' },
      { href: '/best-pals/mining/', label: 'Best Pals' },
      { href: '/breeding-guide.html', label: 'Breeding' },
      { href: '/about.html', label: 'About' }
    ],
    breadcrumbEntityLabel: 'Pal Finder',
    breadcrumbEntityHref: '/best-pals.html'
  },

  // ── Tool cards (shown on entity + decision pages) ──────────
  toolCards: [
    {
      icon: '🔍',
      title: 'Pal Finder',
      desc: 'Filter Pals by stats, work ability, and element',
      href: '/best-pals.html'
    },
    {
      icon: '🧬',
      title: 'Breeding Calculator',
      desc: 'Calculate breeding results for any Pal combination',
      href: '/breeding-guide.html'
    }
  ],

  // ── UI text ────────────────────────────────────────────────
  ui: {
    topBar: game => `📊 Data-driven Pal guide. Updated for Palworld ${game.version}`,
    decisionTopBar: game => `📊 Updated for Palworld ${game.version}. Data-driven rankings`,
    footer: `PalGuide. Data-driven Palworld companion.`,
    decisionCTA: '🧬 Breed this Pal →',
    entityLabel: 'Pal',
    entityLabels: 'Pals',

    // How We Rank section (decision pages)
    rankMethodology: 'Our rankings combine in-game data with hands-on gameplay experience. Each Pal is evaluated on:',
    rankDisclaimer: 'Scores are expert-assessed based on actual gameplay testing.',
  },

  // ─── Template helpers ──────────────────────────────────────
  buildTitle: (pal, game) =>
    `${pal.name.en} — ${pal.name.zh} | Palworld Guide ${game.version} | PalGuide`,

  buildDescription: (pal, game) =>
    `${pal.name.en} (${pal.name.zh}) — ${pal.classification.elements.join('/')} Pal. ` +
    `Mining Lv ${pal.workSuitability.mining}, Handiwork Lv ${pal.workSuitability.handiwork}. ` +
    `Stats, skills, how to get, breeding combos, and best uses in Palworld ${game.version}.`,

  buildKeywords: (pal) =>
    `${pal.name.en.toLowerCase()}, ${pal.name.zh}, ${pal.classification.elements.join(' ')}, palworld pal, palworld guide`,

  // Schema.org
  schemaOrgEntity: (pal, game) => ({
    "@context": "https://schema.org",
    "@type": "WebContent",
    "name": `${pal.name.en} — Palworld ${game.version} Guide`,
    "description": `${pal.classification.elements.join('/')} element Pal in Palworld ${game.version}. Stats, skills, breeding, and best uses.`,
    "about": { "@type": "VideoGame", "name": game.name, "version": game.version }
  }),

  // Icon map per decision scenario
  decisionIconMap: {
    'mining': '⛏️', 'base-worker': '🏭', 'combat': '⚔️',
    'handiwork': '🔧', 'transport': '📦', 'farming': '🌾',
    'gathering': '🌿', 'mount-flying': '🪽', 'mount-ground': '🏇'
  },

  // Scenario labels
  scenarioLabels: {
    'mining': 'Mining', 'base-worker': 'Base Worker', 'combat': 'Combat',
    'handiwork': 'Handiwork', 'transport': 'Transport', 'farming': 'Farming',
    'gathering': 'Gathering', 'mount-flying': 'Flying Mount', 'mount-ground': 'Ground Mount'
  },

  // Related decisions per scenario
  relatedDecisions: {
    'mining': [{ slug: 'base-worker', label: 'Best Base Workers' }, { slug: 'transport', label: 'Best Transport Pals' }],
    'base-worker': [{ slug: 'mining', label: 'Best Mining Pals' }, { slug: 'transport', label: 'Best Transport Pals' }],
  },

  // ─── Decision page icon map ────────────────────────────────
  getDecisionIcon: function(decisionId) {
    return this.decisionIconMap[decisionId] || '⭐';
  },

  // ─── Decision page scenario label ──────────────────────────
  getScenarioLabel: function(decisionId) {
    return this.scenarioLabels[decisionId] || decisionId;
  },

  // ─── Related decisions for a given decision ────────────────
  getRelatedDecisions: function(decisionId) {
    return this.relatedDecisions[decisionId] || [];
  }
};
