// Palworld site configuration — extracted from build.js hardcoded values.
// All site-specific strings live here. build.js reads from this config.
// To reuse build.js for another game: copy this file, edit values, done.

module.exports = {
  // ── Site identity ──────────────────────────────────────────
  domain: 'https://palworldguides.com',
  clarityId: 'xk4e29fx10',
  siteName: 'PalDatabase',

  // ── Data directories (relative to /data/) ──────────────────
  entityDirs: ['pals'],                    // data/pals/
  decisionDir: 'decisions',                // data/decisions/
  manualPagesFile: 'manual-pages.json',    // data/manual-pages.json

  // ── URL structure ──────────────────────────────────────────
  entityUrlPrefix: 'pal',                  // /pal/{slug}/
  decisionUrlPrefix: 'best-pals',          // /best-pals/{scenario}/

  // ── Navigation ─────────────────────────────────────────────
  nav: {
    logoHTML: 'Pal<span>Database</span>',
    logoHref: '/',
    links: [
      { href: '/pals/', label: 'Pals' },
      { href: '/breeding-calculator/', label: 'Breeding Calculator', cls: 'nav-highlight' },
      { href: '/tier-list/', label: 'Tier List' },
      { href: '/items/', label: 'Database ▾', dropdown: [
        { href: '/items/', label: 'Items' },
        { href: '/items/weapons/', label: 'Weapons' },
        { href: '/items/armor/', label: 'Armor' },
        { href: '/structures/', label: 'Structures' }
      ]},
      { href: '/skills/', label: 'Skills ▾', dropdown: [
        { href: '/skills/', label: 'Active Skills' },
        { href: '/skills/#passive', label: 'Passive Skills' },
        { href: '/skills/#partner', label: 'Partner Skills' }
      ]},
      { href: '/map/', label: 'Map' }
    ],
    breadcrumbEntityLabel: 'Pal Database',
    breadcrumbEntityHref: '/pals/'
  },

  // ── Tool cards (shown on entity + decision pages) ──────────
  toolCards: [
    {
      icon: '📚',
      title: 'Pal Database',
      desc: 'Search, filter, and compare all 215 Pals',
      href: '/pals/'
    },
    {
      icon: '🧬',
      title: 'Breeding Calculator',
      desc: 'Calculate breeding results for any Pal combination',
      href: '/breeding-calculator/'
    }
  ],

  // ── UI text ────────────────────────────────────────────────
  ui: {
    topBar: game => `📊 Palworld Database — ${game.version}. Data-driven, always up to date.`,
    decisionTopBar: game => `📊 Updated for Palworld ${game.version}. Data-driven rankings`,
    footer: `Palworld Database. Data-driven Palworld companion.`,
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
