/**
 * config.js
 * ------------------------------------------------------------------
 * Central configuration for the entire game.
 *
 * This file contains GAME RULES and BALANCE SETTINGS only.

 * Keeping all of the numbers here means game balance can be changed
 * in one place instead of being scattered throughout the application.
 *
 * When a real backend is added later, these same settings can also
 * be used by the server so the client and server use the same rules.
 * ------------------------------------------------------------------
 */

// Deep-freezes an object so game balance can't be accidentally changed
// at runtime by other code. Config should only ever be read, never written.
function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

const GameConfig = deepFreeze({
  // ================================================================
  // PLAYER STARTING VALUES
  // ================================================================

  // Money a new player starts with.
  STARTING_MONEY: 10000,
  // Webdollars a new player starts with.
  STARTING_WEBDOLLARS: 60,
  // Starting player level.
  STARTING_LEVEL: 1,

  // ================================================================
  // REAL-TIME UPDATE SETTINGS
  // ================================================================

  // How often the game checks for updated income, visitors, development progress, etc.
  // Currently this is used by the client.
  // With a real backend, this could become the interval used for WebSocket updates instead.
  // 30 * 1000 = 30 seconds.
  TICK_INTERVAL_MS: 30 * 1000,

  // ================================================================
  // HOSTING
  // ================================================================

  // Hosting plans available to websites.
  HOSTING_PLANS: {
    "Shared Hosting 1": { cost: 199, hours: 24, visitorLimit: 1000  },
    "Shared Hosting 2": { cost: 299, hours: 24, visitorLimit: 4000  },
    "Shared Hosting 3": { cost: 399, hours: 24, visitorLimit: 14000 },
    "Shared Hosting 4": { cost: 499, hours: 24, visitorLimit: 25000 }
  },
  // Hosting plan automatically given to a new website.
  DEFAULT_HOSTING_PLAN: "Shared Hosting 1",

  // ================================================================
  // DOMAIN / TLD OPTIONS
  // ================================================================

  // Domain TLD options.
  // Visitor Boost is a multiplier applied to the website's visitor potential.
  // 1.0 = no boost, 1.5 = +50% visitors, 0.5 = -50% visitors, etc.
  TLD_OPTIONS: {
    ".free": { cost: 0, visitorBoost: 0.5 },
    ".gov":  { cost: 69, visitorBoost: 0.75 },
    ".edu":  { cost: 69, visitorBoost: 0.75 },
    ".com":  { cost: 99, visitorBoost: 1.0 },
    ".net":  { cost: 99, visitorBoost: 1.0 },
    ".org":  { cost: 129, visitorBoost: 1.25 },
    ".info": { cost: 129, visitorBoost: 1.25 },
    ".nz":   { cost: 129, visitorBoost: 1.25 }
  },
  // TLD automatically used when no other TLD is selected.
  DEFAULT_TLD: ".free",
  // Website type automatically assigned when no type is specified.
  DEFAULT_SITE_TYPE: "Blog",

  // ================================================================
  // DOMAIN EXPIRATION
  // ================================================================

  // How long a domain registration lasts in REAL hours.
  // 24 hours * 3 = 72 hours = 3 real days.
  DOMAIN_DURATION_HOURS: 24 * 3,

  // ================================================================
  // DEVELOPMENT WORKERS
  // ================================================================

  // Worker system - 3 types of workers for design, frontend, backend.
  // Each worker generates points per hour when assigned to their track.
  WORKERS: {
    design: { name: 'UI Designer', pointsPerHour: 500000 },
    frontend: { name: 'Frontend Dev', pointsPerHour: 500000 },
    backend: { name: 'Backend Dev', pointsPerHour: 500000 }
  },

  // ================================================================
  // DEVELOPMENT TARGETS
  // ================================================================

  // Starting number of development points required for each track, every new website starts with these.
  DEV_TARGET_BASE: { design: 1000, frontend: 1000, backend: 1000 },

  // Added development points required for every published version.
  DEV_TARGET_GROWTH_PER_VERSION: 150,

  // ================================================================
  // PUBLISHING
  // ================================================================

  // Extra profit per hour added whenever a new version is published.
  PUBLISH_PROFIT_PER_HOUR_GAIN: 5,
  // Extra visitors per hour added whenever a new version is published.
  PUBLISH_VISITORS_PER_HOUR_GAIN: 1,

  // ================================================================
  // VISITOR GROWTH
  // ================================================================

  // Base number of visitors added per hour before other modifiers are applied (dev quality, TLD boost, site age).
  VISITOR_BASE_GROWTH_PER_HOUR: 0.25,
  // Natural visitor churn rate per hour (visitors lost due to natural falloff).
  VISITOR_CHURN_RATE_PER_HOUR: 0.02,
  // Additional visitor bonus gained for each day the website exists - 0.01 = +1% visitors per day, capped at VISITOR_AGE_MAX_BOOST.
  VISITOR_AGE_BOOST_PER_DAY: 0.01,
  // Maximum visitor bonus that website age can provide - 0.5 = +50% visitors.
  VISITOR_AGE_MAX_BOOST: 0.5,
  // Multiplier applied to visitor growth based on overall development quality.
  // 0.1 = +0.1% visitors/hour per 1% dev quality. - Remove this later.
  VISITOR_DEV_QUALITY_MULTIPLIER: 0.1,
  
  // ================================================================
  // HOSTING VISITOR RETENTION
  // ================================================================

  // Controls how much of a hosting plan's visitor capacity can be sustained over time. For example, a 1000 visitor limit with 50% retention can sustain ~500 visitors.
  HOSTING_PLAN_RETENTION: {
    "Shared Hosting 1": 1.0,
    "Shared Hosting 2": 1.0,
    "Shared Hosting 3": 1.0,
    "Shared Hosting 4": 1.0
  },
  
  // ================================================================
  // EXPIRED DOMAIN / HOSTING PENALTIES
  // ================================================================

  // Percentage of visitors lost per hour when the domain has expired - 0.10 = 10% loss per hour. - Needs reworking.
  EXPIRED_DOMAIN_VISITOR_LOSS_PER_HOUR: 0.10,
  EXPIRED_HOSTING_VISITOR_LOSS_PER_HOUR: 0.25,
  
  // ================================================================
  // NEW WEBSITE STARTING VALUES
  // ================================================================

  // New sites start with these initial values of visitors and profit
  STARTING_VISITORS_PER_HOUR: 10,
  STARTING_PROFIT_PER_HOUR: 0,

  // ================================================================
  // EMPLOYEE TYPES
  // ================================================================

  // Types of employees that can be hired.
  EMPLOYEE_TYPES: {
    junior: { name: 'Junior Dev', cost: 500, designBonus: 1.2, frontendBonus: 1.2, backendBonus: 1.0 },
    senior: { name: 'Senior Dev', cost: 1500, designBonus: 1.5, frontendBonus: 1.5, backendBonus: 1.5 },
    designer: { name: 'UI/UX Designer', cost: 800, designBonus: 2.0, frontendBonus: 1.0, backendBonus: 0.8 },
    specialist: { name: 'Specialist', cost: 2000, designBonus: 1.3, frontendBonus: 1.8, backendBonus: 2.0 }
  },
  
  // Max employees allowed
  MAX_EMPLOYEES: 6,

  // ================================================================
  // WEBSITE TYPES
  // ================================================================

  // Types of websites a player can create.
  // Defined as an object so Object.keys() can extract the valid type names.
  SITE_TYPES: {
    Blog: { name: 'Blog', description: 'Share your thoughts and ideas' },
    Store: { name: 'Store', description: 'Sell products online' },
    Portfolio: { name: 'Portfolio', description: 'Showcase your work' },
    Forum: { name: 'Forum', description: 'Build a community' }
  },

  // ================================================================
  // ADVERTISING
  // ================================================================
  
  // Advertising options available to websites, enabled/disabled is not stored here, but in the website object itself.
  // Profit is amount made per 1000 visitors.
  // Impressions needs reworking to be calculated based on visitors and ad type, not a static number.
  ADVERTISING_OPTIONS: [
  {
    id: 1,
    name: 'Display Banner',
    profit: 240,
    visitorPenalty: 0.02,
    adImpressions: 120
  },
  {
    id: 2,
    name: 'Video Ad',
    profit: 480,
    visitorPenalty: 0.05,
    adImpressions: 180
  },
  {
    id: 3,
    name: 'Sponsored Post',
    profit: 860,
    visitorPenalty: 0.08,
    adImpressions: 240
  },
  {
    id: 4,
    name: 'Search Boost',
    profit: 1320,
    visitorPenalty: 0.12,
    adImpressions: 310
  }
  ],

  // Maximum percentage of visitors that can be lost due to advertising penalties (caps at this value).
  MAX_VISITOR_LOSS_FROM_ADVERTISING: 0.35,

});

// ================================================================
// NODE / BACKEND SUPPORT
// ================================================================

// Export GameConfig when this file is being used by Node.js in future.
if (typeof module !== 'undefined' && module.exports) module.exports = GameConfig;
