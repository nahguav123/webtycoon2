/*
PURPOSE: Stores game rules and balance values.

INPUT: None.
OUTPUT: GameConfig.
FUNCTIONS: None.
DATA: Starting values, prices, rewards, visitors, employees and website settings.
*/


export const GameConfig = {

    // Player starting values
    STARTING_MONEY: 10000,
    STARTING_WEBDOLLARS: 60,
    STARTING_LEVEL: 1,

    // New Website starting values
    STARTING_VISITORS_PER_HOUR: 10,
    STARTING_PROFIT_PER_HOUR: 0,


    // How often the game checks for updated income, visitors, development progress, etc - websocket refresh interval.
    // 30 * 1000 = 30 seconds.
    TICK_INTERVAL_MS: 30 * 1000,


    // Hosting plans available to websites.
    HOSTING_PLANS: {
        "Shared Hosting 1": { cost: 199, hours: 24, visitorLimit: 1000  },
        "Shared Hosting 2": { cost: 299, hours: 24, visitorLimit: 4000  },
        "Shared Hosting 3": { cost: 399, hours: 24, visitorLimit: 14000 },
        "Shared Hosting 4": { cost: 499, hours: 24, visitorLimit: 25000 }
    },
    DEFAULT_HOSTING_PLAN: "Shared Hosting 1",

    // Domain TLD options.
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
    DEFAULT_TLD: ".free",

    // How long a domain registration lasts in REAL hours.
    // 24 hours * 3 = 72 hours = 3 real days.
    DOMAIN_DURATION_HOURS: 24 * 3,


    // Worker system - 3 types of workers for design, frontend, backend.
    WORKERS: {
        design: { name: 'UI Designer', pointsPerHour: 500000 }, // 500k points per hour - dev testing values
        frontend: { name: 'Frontend Dev', pointsPerHour: 500000 },
        backend: { name: 'Backend Dev', pointsPerHour: 500000 }
    },

    // Starting number of development points required for each track, every new website starts with these.
    DEV_TARGET_BASE: { design: 1000, frontend: 1000, backend: 1000 },

    // Added development points required for every published version.
    DEV_TARGET_GROWTH_PER_VERSION: 150,


    // Visitors per hour multiplier whenever a new version is published.
    PUBLISH_VISITORS_PER_HOUR_GAIN: 1.1,

    // Base number of visitors added per hour before other modifiers are applied.
    VISITOR_BASE_GROWTH_PER_HOUR: 5,


    // Types of employees that can be hired.
    EMPLOYEE_TYPES: {
        junior: { name: 'Junior Dev', cost: 500, designBonus: 1.2, frontendBonus: 1.2, backendBonus: 1.0 },
        senior: { name: 'Senior Dev', cost: 1500, designBonus: 1.5, frontendBonus: 1.5, backendBonus: 1.5 },
        designer: { name: 'UI/UX Designer', cost: 800, designBonus: 2.0, frontendBonus: 1.0, backendBonus: 0.8 },
        specialist: { name: 'Specialist', cost: 2000, designBonus: 1.3, frontendBonus: 1.8, backendBonus: 2.0 }
    },

    // Max employees allowed
    MAX_EMPLOYEES: 6,


    // Types of websites a player can create.
    SITE_TYPES: {
        Blog: { name: 'Blog', description: 'Share your thoughts and ideas' },
        Store: { name: 'Store', description: 'Sell products online' },
        Portfolio: { name: 'Portfolio', description: 'Showcase your work' },
        Forum: { name: 'Forum', description: 'Build a community' }
    },
    DEFAULT_SITE_TYPE: "Blog",


    // Advertising options available to websites.
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
};