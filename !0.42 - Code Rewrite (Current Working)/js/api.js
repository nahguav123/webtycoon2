/**
 * api.js
 * ------------------------------------------------------------------
 * This file contains all of the game's API functions.
 *
 * Right now, these functions use LocalStore (localStorage) as the
 * database. In the future, the inside of these functions can be
 * replaced with real fetch() calls to a backend server.
 *
 * The rest of the game talks to GameAPI instead of directly accessing
 * the database, which means the frontend does not need to change when
 * a real backend is added.
 * 
 * This version splits responsibilities into small classes,
 * each with a single job:
 *
 *   ApiError               - a request-style error with a status code
 *   PasswordHasher         - hashes/verifies passwords
 *   SessionManager         - creates/validates login sessions
 *   DevelopmentTargets     - calculates dev-point targets per version
 *   WebsiteFactory         - builds a brand-new website record
 *   AdvertisingCalculator  - advertising income/visitor-penalty math
 *   WebsitePresenter        - turns internal website records into the
 *                             shape the frontend is allowed to see
 *   AuthService             - register / login
 *   PlayerService           - loading a player's core stats
 *   WebsiteService          - everything website-related
 *   EmployeeService         - everything employee/team-related
 *
 * Every service is given the LocalStore instance it should use
 * through its constructor.
 *
 * GameAPI at the bottom of the file is a thin facade that wires all
 * of these services together and exposes the exact same public
 * methods the rest of the game already calls.
 * ------------------------------------------------------------------
 */
const GameAPI = (() => {

  // ================================================================
  // ERRORS
  // ================================================================

  // A request-style error. `status` mirrors an HTTP status code so the
  // frontend can tell what kind of problem occurred (400, 401, 404, ...).
  class ApiError extends Error {
    constructor(message, status) {
      super(message);
      this.status = status;
    }
  }

  // Stops the current operation and raises an ApiError.
  function fail(message, status) {
    throw new ApiError(message, status);
  }

  // ================================================================
  // PASSWORD HASHING
  // ================================================================

  // Creates a simple hash of a password, should be replaced with bcrypt or argon2 when using a real server.
  class PasswordHasher {
    static hash(str) {
      // Start with a hash value of zero.
      let h = 0;
      // For every character in the password add the current character to the hash.
      for (let i = 0; i < str.length; i++) { h = (Math.imul(31, h) + str.charCodeAt(i)) | 0; }
      // Add "h" to the beginning so the result is stored as a string.
      return 'h' + h;
    }

    static matches(str, hash) {
      return PasswordHasher.hash(str) === hash;
    }
  }

  // ================================================================
  // SESSIONS
  // ================================================================

  // Creates and validates login sessions. Every service that needs to
  // know "who is making this request" goes through this class instead
  // of reading db.sessions directly.
  class SessionManager {
    constructor(store) {
      this.store = store;
    }

    // Loads the database and checks whether the supplied token maps to a
    // valid, non-expired session. Throws a 401 ApiError when it does not.
    require(token) {
      const db = this.store.read();
      const session = token && db.sessions[token];
      if (!session || session.expiresAt < Date.now()) fail('Invalid or expired session', 401);
      return { db, session };
    }

    // Creates a new 24-hour session for the given user and stores it in the database.
    create(db, user) {
      const token = GameUtil.encodeToken({ userid: user.userid, username: user.username });
      db.sessions[token] = {
        userid: user.userid,
        username: user.username,
        expiresAt: Date.now() + 24 * 3_600_000
      };
      return token;
    }
  }

  // ================================================================
  // WEBSITE DEVELOPMENT TARGETS
  // ================================================================

  // Calculates how much to increase every development target based on the current version.
  class DevelopmentTargets {
    static forVersion(version) {
      const growth = GameConfig.DEV_TARGET_GROWTH_PER_VERSION * version;
      // Empty object to store the final target values.
      const targets = {};
      // Go through each base development target and add the version-based growth to the base value.
      Object.entries(GameConfig.DEV_TARGET_BASE).forEach(([name, baseValue]) => {
        targets[name] = baseValue + growth;
      });
      // Returns the calculated targets for this version.
      return targets;
    }
  }

  // ================================================================
  // NEW WEBSITE CREATION
  // ================================================================

  // Builds all of the starting data for a new website.
  class WebsiteFactory {
    static create(userid, siteid, domainName, tld, siteType) {
      // Gets the current time.
      const now = Date.now();
      // Get the development targets for version zero.
      const targets = DevelopmentTargets.forVersion(0);
      // Creates an empty object to store the development tracks.
      const dev = {};
      // Creates a development track for design, frontend and backend and starts each development track with 0 progress, 0 rate, and the target calculated above.
      ['design', 'frontend', 'backend'].forEach(track => {
        dev[track] = { points: 0, target: targets[track], ratePerHour: 0 };
      });
      // Returns the complete starting website record.
      return {
        siteid, userid,
        // Stores the website's name and domain ending.
        sitename: domainName,
        tld,
        // Stores the type of website.
        siteType,
        // New websites always start at version zero.
        version: 0,
        // Gives the website the default hosting plan.
        hostingOption: GameConfig.DEFAULT_HOSTING_PLAN,
        // Hosting is initially unpaid.
        hostingExpiresAt: now,
        // Gets the visitor limit from the default hosting plan.
        visitorLimit: GameConfig.HOSTING_PLANS[GameConfig.DEFAULT_HOSTING_PLAN].visitorLimit,
        // Set when the domain expires (*3,600,000 is hrs->ms).
        domainExpiresAt: now + GameConfig.DOMAIN_DURATION_HOURS * 3_600_000,
        // Set the starting number of visitors per hour.
        visitorsPerHour: GameConfig.STARTING_VISITORS_PER_HOUR,
        // Set the starting profit per hour.
        profitPerHour: GameConfig.STARTING_PROFIT_PER_HOUR,
        // Create the advertising options available on the website from the game config, but disable them all by default.
        advertising: GameConfig.ADVERTISING_OPTIONS.map(option => ({ ...option, enabled: false })),
        // No advertising is enabled when the website is created.
        // - Maybe change this to use AdvertisingCalculator.profitPerHour to calculate the initial advertising profit per hour based on the advertising options and their enabled status.
        advertisingProfitPerHour: 0,
        // Creates the history object to store the last 24 hours of visitors and profit.
        history: {
          visitors: Array(24).fill(GameConfig.STARTING_VISITORS_PER_HOUR),
          profit: Array(24).fill(GameConfig.STARTING_PROFIT_PER_HOUR),
          // Remembers which hour the history currently represents.
          lastHour: new Date(now).getHours()
        },
        // Store the development information.
        dev,
        // Remembers when development was last updated.
        devLastTick: now,
        // Remembers when visitor calculations were last updated.
        visitorLastTick: now,
        // Remembers when the website was created.
        createdAt: now
      };
    }
  }

  // ================================================================
  // ADVERTISING MATH
  // ================================================================

  class AdvertisingCalculator {
    // Calculates profit from advertising.
    static profitPerHour(site) {
      // Gets the website's current visitors per hour and use zero if the value is missing or invalid.
      const visitors = Math.max(0, site.visitorsPerHour || 0);
      // Goes through every advertising option and calculates the total income.
      return (site.advertising || []).reduce((sum, option) => {
        // Ignore advertising options that are disabled.
        if (!option.enabled) return sum;
        // Advertising profit is stored per 1,000 visitors, so divides the visitors by 1,000.
        const revenuePerVisitor = Number(option.profit || 0) / 1000;
        // Adds this advertising option's income to the total.
        return sum + visitors * revenuePerVisitor;
      }, 0);
    }

    // Calculates how much advertising reduces the website's visitors.
    static visitorPenalty(site) {
      // Go through every advertising option.
      return (site.advertising || []).reduce((sum, option) => {
        // Ignore advertising options that are disabled.
        if (!option.enabled) return sum;
        // Add this advertising option's visitor penalty to the total penalty.
        return sum + (Number(option.visitorPenalty) || 0);
      }, 0);
    }
  }

  // ================================================================
  // WEBSITE PRESENTATION (internal record -> frontend-safe shape)
  // ================================================================

  class WebsitePresenter {
    // Creates the version of a website's data that is safe to send to the frontend.
    static toPublic(site, employees = []) {
      // Creates an object to hold development information.
      const dev = {};
      // Go through each development track on the website.
      Object.entries(site.dev || {}).forEach(([track, data]) => {
        // Get the worker's normal development rate.
        const baseRate = Number(data.ratePerHour) || 0;
        // Applies employee bonuses to the normal development rate.
        const effectiveRate = baseRate * GameEngine.getTrackBonusMultiplier(site, employees, track);
        // Stores the development information that the frontend needs.
        dev[track] = {
          ...data,
          // Keep the original worker rate.
          ratePerHour: baseRate,
          // Store the rate after employee bonuses have been applied.
          effectiveRatePerHour: effectiveRate
        };
      });
      // Calculates the total visitor penalty from advertising.
      const adPenalty = AdvertisingCalculator.visitorPenalty(site);
      // Calculates the website's actual visitors per hour after advertising penalties have been applied.
      // Uses the configured maximum visitor loss cap from advertising.
      const effectiveVisitorsPerHour = Math.max(
        0,
        Number(site.visitorsPerHour || 0) * (1 - Math.min(GameConfig.MAX_VISITOR_LOSS_FROM_ADVERTISING, adPenalty))
      );
      // Calculates the website's total profit per hour: normal profit + advertising profit.
      const effectiveProfitPerHour = (Number(site.profitPerHour) || 0) + (Number(site.advertisingProfitPerHour) || 0);
      // Return the information the frontend is allowed to see.
      return {
        // Basic website information.
        siteid: site.siteid,
        sitename: site.sitename, tld: site.tld, version: site.version,
        siteType: site.siteType,
        // Current visitor and profit rates.
        visitorsPerHour: effectiveVisitorsPerHour,
        profitPerHour: effectiveProfitPerHour,
        // Advertising information.
        advertising: site.advertising,
        advertisingProfitPerHour: site.advertisingProfitPerHour,
        // Hosting information.
        hostingOption: site.hostingOption,
        hostingRemainingMs: GameEngine.hostingRemainingMs(site),
        // Domain information.
        domainRemainingMs: GameEngine.domainRemainingMs(site),
        // Website history.
        history: {
          // Return the most recent 24 visitor values.
          visitors: Array.isArray(site.history?.visitors) ? site.history.visitors.slice(-24) : Array(24).fill(site.visitorsPerHour || 0),
          // Return the most recent 24 profit values.
          profit: Array.isArray(site.history?.profit) ? site.history.profit.slice(-24) : Array(24).fill(site.profitPerHour || 0)
        },
        // Development information.
        dev,
        // Calculate the website's overall development progress.
        overallProgress: GameEngine.overallProgress(site),
        // Check whether the website is ready to publish.
        readyToPublish: GameEngine.isReadyToPublish(site)
      };
    }

    // Creates the small summary shape used by website list/tick updates.
    static toSummary(site, employees = []) {
      const publicSite = WebsitePresenter.toPublic(site, employees);
      return {
        siteid: publicSite.siteid,
        sitename: publicSite.sitename,
        tld: publicSite.tld,
        version: publicSite.version,
        visitorsPerHour: Math.round(publicSite.visitorsPerHour),
        profitPerHour: Math.round(publicSite.profitPerHour)
      };
    }
  }

  // ================================================================
  // SMALL SHARED HELPERS
  // ================================================================

  // Finds every website/employee belonging to a given user.
  function websitesForUser(db, userid) {
    return Object.values(db.websites).filter(w => w.userid === userid);
  }
  function employeesForUser(db, userid) {
    return db.employees ? Object.values(db.employees).filter(e => e.userid === userid) : [];
  }

  // Brings a single website's development, visitors, and advertising income up to date "now".
  function settleWebsite(site, employees) {
    GameEngine.advanceDevelopment(site, employees);
    GameEngine.settleVisitors(site);
    site.advertisingProfitPerHour = AdvertisingCalculator.profitPerHour(site);
    return site;
  }

  // ================================================================
  // AUTH SERVICE - register / login
  // ================================================================

  class AuthService {
    constructor(store) {
      this.store = store;
      this.sessions = new SessionManager(store);
    }

    // POST /register - Creates a new player account.
    async register({ username, email, password }) {
      // Make sure all required fields were provided.
      if (!username || !email || !password) fail('All fields required', 400);
      // Load the database.
      const db = this.store.read();
      // Clean up the username and email for searching.
      const cleanUser = username.trim().toLowerCase();
      const cleanEmail = email.trim().toLowerCase();
      // Check whether the username is already registered.
      if (db.usernameIndex[cleanUser]) fail('Username or email already exists', 409);

      // Give the new user a unique ID.
      const userid = db.nextUserId++;
      // Create the user's account information.
      db.users[userid] = {
        userid,
        username: username.trim(),
        email: cleanEmail,
        passwordHash: PasswordHasher.hash(password),
        createdAt: Date.now()
      };
      // Add the username to the username lookup table.
      db.usernameIndex[cleanUser] = userid;
      // Create the player's starting game data.
      db.userData[userid] = {
        money: GameConfig.STARTING_MONEY,
        webdollars: GameConfig.STARTING_WEBDOLLARS,
        level: GameConfig.STARTING_LEVEL,
        websiteCount: 0,
        teamCount: 0,
        lastTick: Date.now()
      };
      // Save the updated database.
      this.store.write(db);
      // Return the message and userid to the frontend.
      return { message: 'Account created', userid };
    }

    // POST /login - Logs a player into their account and returns a session token.
    async login({ username, password }) {
      // Make sure the username and password were provided.
      if (!username || !password) fail('All fields required', 400);
      // Load the database.
      const db = this.store.read();
      // Find the user ID associated with the username.
      const userid = db.usernameIndex[username.trim().toLowerCase()];
      // Get the actual user account.
      const user = userid && db.users[userid];
      // Check that the account exists and the password is correct.
      if (!user || !PasswordHasher.matches(password, user.passwordHash)) fail('Invalid username or password', 401);
      // Create a login token for this player and save the session (expires after 24 hours).
      const token = this.sessions.create(db, user);
      // Save the updated database.
      this.store.write(db);
      // Return the message and login token to the frontend.
      return { message: 'Login successful', token };
    }
  }

  // ================================================================
  // PLAYER SERVICE - core player stats
  // ================================================================

  class PlayerService {
    constructor(store, sessionManager) {
      this.store = store;
      this.sessions = sessionManager;
    }

    // GET /load-game - Loads the player's main game information.
    async loadGame(token) {
      // Make sure the player has a valid login session.
      const { db, session } = this.sessions.require(token);
      // Find all websites owned by this player.
      const websites = websitesForUser(db, session.userid);
      // Get the player's game data.
      const userData = db.userData[session.userid];
      // Add any income that has accumulated since the last time the player was online.
      GameEngine.settleIncome(userData, websites);
      // Save the updated database.
      this.store.write(db);
      // Get only the player information the frontend needs.
      const { money, webdollars, level, websiteCount, teamCount } = userData;
      // Return the player's current game information.
      return { money, webdollars, level, websiteCount, teamCount };
    }
  }

  // ================================================================
  // WEBSITE SERVICE - everything website-related
  // ================================================================

  class WebsiteService {
    constructor(store, sessionManager) {
      this.store = store;
      this.sessions = sessionManager;
    }

    // GET /api/websites - Gets a list of all websites owned by the player.
    async listWebsites(token) {
      // Make sure the player is logged in.
      const { db, session } = this.sessions.require(token);
      // Find all websites/employees belonging to this player.
      const websites = websitesForUser(db, session.userid);
      const employees = employeesForUser(db, session.userid);
      // Update every website before returning its information.
      websites.forEach(site => settleWebsite(site, employees));
      // Save the updated website data.
      this.store.write(db);
      // Return a simplified list of websites.
      return { websites: websites.map(site => WebsitePresenter.toSummary(site, employees)) };
    }

    // GET /api/website/:siteid - Gets detailed information about one website.
    async getWebsite(token, siteid) {
      // Make sure the player is logged in.
      const { db, session } = this.sessions.require(token);
      // Find the requested website.
      const site = db.websites[siteid];
      // Make sure the website exists and belongs to this player.
      if (!site || site.userid !== session.userid) fail('Website not found', 404);
      // Find the player's employees.
      const employees = employeesForUser(db, session.userid);
      // Bring the website up to date.
      settleWebsite(site, employees);
      // Save the updated website.
      this.store.write(db);
      // Return the website to the frontend.
      return { website: WebsitePresenter.toPublic(site, employees) };
    }

    // POST /create-website - Creates a new website.
    async createWebsite(token, { domainName, tld, siteType }) {
      // Make sure the player is logged in.
      const { db, session } = this.sessions.require(token);
      // Make sure a domain name and TLD were supplied.
      if (!domainName || !tld) fail('Domain name and TLD required', 400);
      // Remove unnecessary spaces from the domain name.
      const cleanDomain = domainName.trim();
      // Domain names cannot contain spaces.
      if (/\s/.test(cleanDomain)) fail('Domain name cannot contain spaces', 400);
      // Make sure the domain name is between 3 and 16 characters.
      if (cleanDomain.length < 3 || cleanDomain.length > 16) fail('Domain name must be 3-16 characters', 400);
      // Check whether another website already uses this domain.
      const taken = Object.values(db.websites).some(w => w.sitename === cleanDomain && w.tld === tld);
      // Stop if the domain is already being used.
      if (taken) fail('This domain name is already taken', 400);
      // Find the selected TLD configuration.
      const tldOption = GameConfig.TLD_OPTIONS[tld];
      // Make sure the selected TLD exists.
      if (!tldOption) fail('Invalid TLD option', 400);
      // Get the player's game data.
      const userData = db.userData[session.userid];
      // Make sure the player can afford the domain.
      if (userData.money < tldOption.cost) fail('Not enough money', 400);
      // Give the website a unique ID.
      const siteid = db.nextSiteId++;
      // Create and store the new website, using the default site type from config if not provided.
      const defaultSiteType = siteType || GameConfig.DEFAULT_SITE_TYPE;
      // Validate that the site type exists in the config.
      const validSiteTypes = Object.keys(GameConfig.SITE_TYPES || {});
      if (!validSiteTypes.includes(defaultSiteType)) fail('Invalid site type', 400);
      db.websites[siteid] = WebsiteFactory.create(session.userid, siteid, cleanDomain, tld, defaultSiteType);
      // Charge the player for the domain.
      userData.money -= tldOption.cost;
      // Increase the player's website count.
      userData.websiteCount = (userData.websiteCount || 0) + 1;
      // Save the updated database.
      this.store.write(db);
      // Tell the frontend the website was created with the site id.
      return { success: true, siteid, message: 'Website created!' };
    }

    // POST /api/website/:siteid/pay-hosting - Purchase or extend hosting for a website.
    async payHosting(token, siteid, planName) {
      // Make sure the player is logged in.
      const { db, session } = this.sessions.require(token);
      // Find the selected hosting plan.
      const plan = GameConfig.HOSTING_PLANS[planName];
      // Make sure the hosting plan exists.
      if (!plan) fail('Invalid hosting plan', 400);
      // Find the website.
      const site = db.websites[siteid];
      // Make sure the website belongs to this player.
      if (!site || site.userid !== session.userid) fail('Website not found', 404);
      // Get the player's money.
      const userData = db.userData[session.userid];
      // Make sure the player can afford the plan.
      if (userData.money < plan.cost) fail('Not enough money', 400);
      // Charge the player for hosting.
      userData.money -= plan.cost;
      // Get the current time.
      const now = Date.now();
      // Calculate how much time is left on the current hosting.
      const remaining = Math.max(0, site.hostingExpiresAt - now);
      // If the player buys the same plan, adds the new time to the remaining time.
      // If the player buys a different plan, resets the time to the new plan's duration.
      site.hostingExpiresAt = (site.hostingOption === planName)
        ? now + remaining + plan.hours * 3_600_000
        : now + plan.hours * 3_600_000;
      // Store the new hosting plan.
      site.hostingOption = planName;
      // Update the website's visitor limit.
      site.visitorLimit = plan.visitorLimit;
      // Save the updated database.
      this.store.write(db);
      // Tell the frontend the hosting purchase succeeded with the plan name and plan details.
      return { success: true, message: `Hosting purchased: ${planName}`, plan };
    }

    // POST /api/website/:siteid/pay-domain - Renew a domain or change its name/TLD.
    async payDomain(token, siteid, { newSitename, newTld }) {
      // Make sure the player is logged in.
      const { db, session } = this.sessions.require(token);
      // Make sure a new domain name and TLD were provided.
      if (!newSitename || !newTld) fail('Domain name and TLD required', 400);
      // Clean up the domain name and TLD.
      const sitename = newSitename.trim();
      const tld = newTld.trim();
      // Domain names cannot contain spaces.
      if (/\s/.test(sitename)) fail('Domain name cannot contain spaces', 400);
      // Find the selected TLD.
      const tldOption = GameConfig.TLD_OPTIONS[tld];
      // Make sure the TLD exists.
      if (!tldOption) fail('Invalid TLD option', 400);
      // Find the website.
      const site = db.websites[siteid];
      // Make sure the website belongs to this player.
      if (!site || site.userid !== session.userid) fail('Website not found', 404);
      // Check whether another website already uses this domain.
      const clash = Object.values(db.websites)
        .some(w => w.siteid !== site.siteid && w.sitename === sitename && w.tld === tld);
      // Stop if another website already owns the domain.
      if (clash) fail('This domain name is already taken', 400);
      // Get the player's game data.
      const userData = db.userData[session.userid];
      // Make sure the player can afford the domain.
      if (userData.money < tldOption.cost) fail('Not enough money', 400);
      // Charge the player.
      userData.money -= tldOption.cost;
      // Get the current time.
      const now = Date.now();
      // Check whether the player is keeping the exact same domain.
      const sameName = site.sitename === sitename && site.tld === tld;
      // Calculate how much time is left on the current domain.
      const remaining = Math.max(0, site.domainExpiresAt - now);
      // If the domain is staying the same, adds the new time to the remaining time. If the domain is changing, resets the time to the new domain's duration.
      site.domainExpiresAt = sameName
        ? now + remaining + GameConfig.DOMAIN_DURATION_HOURS * 3_600_000
        : now + GameConfig.DOMAIN_DURATION_HOURS * 3_600_000;
      // Update the domain name.
      site.sitename = sitename;
      // Update the TLD.
      site.tld = tld;
      // Save the updated database.
      this.store.write(db);
      // Tell the frontend the domain was updated with the domain name and TLD.
      return { success: true, message: `Domain updated to ${sitename}${tld}`, domain: `${sitename}${tld}` };
    }

    // GET /api/hosting-plans - Returns all available hosting plans.
    async hostingPlans() {
      // Return the hosting plans stored in GameConfig.
      return GameConfig.HOSTING_PLANS;
    }

    // GET /api/tld-options - Returns all available domain TLD options.
    async tldOptions() {
      // Return the TLD options stored in GameConfig.
      return GameConfig.TLD_OPTIONS;
    }

    // POST /api/website/:siteid/assign  { track: 'design'|'frontend'|'backend', assigned: bool } - Turns development work on or off for a track.
    // Swap this code out with workers rates instead of a constant rate in future.
    async setDevAssignment(token, siteid, track, assigned) {
      // Make sure the player is logged in.
      const { db, session } = this.sessions.require(token);
      // Find the website.
      const site = db.websites[siteid];
      // Make sure the website belongs to this player.
      if (!site || site.userid !== session.userid) fail('Website not found', 404);
      // Make sure the requested development track exists.
      if (!site.dev[track]) fail('Invalid track', 400);
      // Find the player's employees.
      const employees = employeesForUser(db, session.userid);
      // Apply all development progress that has accumulated since the last update before changing the rate.
      GameEngine.advanceDevelopment(site, employees);
      // Get the worker configuration for this track.
      const workerConfig = GameConfig.WORKERS[track];
      // Turn the development rate on or off. If true, use worker's points per hour, if false, set to 0.
      site.dev[track].ratePerHour = assigned ? workerConfig.pointsPerHour : 0;
      // Save the updated website.
      this.store.write(db);
      // Return the updated website information.
      return { website: WebsitePresenter.toPublic(site, employees) };
    }

    // POST /api/website/:siteid/publish - Publishes the current website version.
    async publishVersion(token, siteid) {
      // Make sure the player is logged in.
      const { db, session } = this.sessions.require(token);
      // Find the website.
      const site = db.websites[siteid];
      // Make sure the website belongs to this player.
      if (!site || site.userid !== session.userid) fail('Website not found', 404);
      // Find the player's employees.
      const employees = employeesForUser(db, session.userid);
      // Apply any development progress that has happened since the last update.
      GameEngine.advanceDevelopment(site, employees);
      // Update the website's visitor calculations.
      GameEngine.settleVisitors(site);
      // Make sure all development tracks are finished.
      if (!GameEngine.isReadyToPublish(site)) fail('Development is not finished yet', 400);
      // Increase the website's version number.
      site.version += 1;
      // Publishing increases the website's normal profit.
      site.profitPerHour += GameConfig.PUBLISH_PROFIT_PER_HOUR_GAIN;
      // Publishing also increases the number of visitors.
      site.visitorsPerHour += GameConfig.PUBLISH_VISITORS_PER_HOUR_GAIN;
      // Calculate the new development targets for the next version and reset the development progress.
      const targets = DevelopmentTargets.forVersion(site.version);
      ['design', 'frontend', 'backend'].forEach(track => {
        site.dev[track].points = 0;
        site.dev[track].target = targets[track];
        site.dev[track].ratePerHour = 0;
      });
      // Recalculate advertising income after publishing.
      site.advertisingProfitPerHour = AdvertisingCalculator.profitPerHour(site);
      // Save all changes.
      this.store.write(db);
      // Return the updated website information.
      return { success: true, message: `Published version ${site.version}!`, website: WebsitePresenter.toPublic(site, employees) };
    }

    // Change whether a specific advertising option is enabled.
    async setAdvertising(token, siteid, optionId, enabled) {
      // Make sure the player is logged in.
      const { db, session } = this.sessions.require(token);
      // Find the website.
      const site = db.websites[siteid];
      // Make sure the website belongs to this player.
      if (!site || site.userid !== session.userid) fail('Website not found', 404);
      // Find the advertising option being changed.
      const option = (site.advertising || []).find(item => Number(item.id) === Number(optionId));
      // Make sure the advertising option exists.
      if (!option) fail('Advertising option not found', 404);
      // Convert the supplied value into true or false.
      option.enabled = Boolean(enabled);
      // Recalculate the website's advertising income.
      site.advertisingProfitPerHour = AdvertisingCalculator.profitPerHour(site);
      // Save the updated website.
      this.store.write(db);
      // Return the updated website information.
      return { success: true, message: 'Advertising updated', website: WebsitePresenter.toPublic(site) };
    }

    // Internal helper used by GameAPI.tick() - brings every one of a player's
    // websites up to date and returns them, without touching player income.
    settleAllForUser(db, userid) {
      const websites = websitesForUser(db, userid);
      const employees = employeesForUser(db, userid);
      websites.forEach(site => settleWebsite(site, employees));
      return { websites, employees };
    }
  }

  // ================================================================
  // EMPLOYEE SERVICE - everything employee/team-related
  // ================================================================

  class EmployeeService {
    constructor(store, sessionManager) {
      this.store = store;
      this.sessions = sessionManager;
    }

    // GET /api/team - Get all employees belonging to the player.
    async listTeam(token) {
      // Make sure the player is logged in.
      const { db, session } = this.sessions.require(token);
      // Return the player's employees.
      return { employees: employeesForUser(db, session.userid) };
    }

    // POST /api/team/hire - Hire a new employee.
    async hireEmployee(token, employeeType) {
      // Make sure the player is logged in.
      const { db, session } = this.sessions.require(token);
      // Find the configuration for the selected employee type.
      const typeConfig = GameConfig.EMPLOYEE_TYPES[employeeType];
      // Make sure the employee type exists.
      if (!typeConfig) fail('Invalid employee type', 400);
      // Create the employees object if it does not exist yet.
      if (!db.employees) db.employees = {};
      // Create the employee ID counter if it does not exist yet.
      if (!db.nextEmployeeId) db.nextEmployeeId = 1;
      // Get the player's game data.
      const userData = db.userData[session.userid];
      // Count how many employees the player currently has.
      const currentTeamSize = employeesForUser(db, session.userid).length;
      // Make sure the player has not reached the team limit.
      if (currentTeamSize >= GameConfig.MAX_EMPLOYEES) fail('Team is full', 400);
      // Make sure the player can afford the employee.
      if (userData.money < typeConfig.cost) fail('Not enough money', 400);
      // Give the employee a unique ID.
      const employeeid = db.nextEmployeeId++;
      // Create a readable name for the employee.
      const employeeName = typeConfig.name + ' #' + employeeid;
      // Create the employee record.
      db.employees[employeeid] = {
        employeeid,
        userid: session.userid,
        // Give the employee their generated name.
        name: employeeName,
        // Store the employee's type.
        type: employeeType,
        // Store their development bonuses.
        designBonus: typeConfig.designBonus,
        frontendBonus: typeConfig.frontendBonus,
        backendBonus: typeConfig.backendBonus,
        // Newly hired employees are not assigned to a website.
        assignedTo: null,
        // Store when the employee was hired.
        hired: Date.now()
      };
      // Pay for the employee.
      userData.money -= typeConfig.cost;
      // Increase the player's team count.
      userData.teamCount = (userData.teamCount || 0) + 1;
      // Save the updated database.
      this.store.write(db);
      // Return the newly hired employee.
      return { success: true, message: `Hired ${employeeName}!`, employee: db.employees[employeeid] };
    }

    // POST /api/team/:employeeid/assign - Assign an employee to a website or remove them from a website.
    async assignEmployee(token, employeeid, siteid) {
      // Make sure the player is logged in.
      const { db, session } = this.sessions.require(token);
      // Make sure the employees object exists.
      if (!db.employees) db.employees = {};
      // Find the employee.
      const employee = db.employees[employeeid];
      // Make sure the employee belongs to this player.
      if (!employee || employee.userid !== session.userid) fail('Employee not found', 404);
      // Convert the website ID into a number, empty/null values mean the employee should be unassigned.
      const normalizedSiteId = (siteid === null || siteid === undefined || siteid === '') ? null : Number(siteid);
      // Find the selected website.
      const site = normalizedSiteId !== null ? db.websites[normalizedSiteId] : null;
      // If a website was selected, make sure it exists and belongs to this player.
      if (normalizedSiteId !== null && (!site || site.userid !== session.userid)) fail('Website not found', 404);
      // Assign the employee to the website, null means unassigned.
      employee.assignedTo = normalizedSiteId;
      // Save the updated database.
      this.store.write(db);
      // Return a message indicating whether the employee was assigned or unassigned, along with the employee's updated information.
      return { success: true, message: normalizedSiteId !== null ? `Assigned to ${site.sitename}` : 'Unassigned', employee };
    }

    // POST /api/team/:employeeid/fire - Remove an employee from the player's team.
    async fireEmployee(token, employeeid) {
      // Make sure the player is logged in.
      const { db, session } = this.sessions.require(token);
      // Make sure the employees object exists.
      if (!db.employees) db.employees = {};
      // Find the employee.
      const employee = db.employees[employeeid];
      // Make sure the employee belongs to this player.
      if (!employee || employee.userid !== session.userid) fail('Employee not found', 404);
      // Remove the employee from the database.
      delete db.employees[employeeid];
      // Get the player's game data.
      const userData = db.userData[session.userid];
      // Decrease the player's team count, math.max prevents the count from going below zero.
      userData.teamCount = Math.max(0, (userData.teamCount || 0) - 1);
      // Save the updated database.
      this.store.write(db);
      // Return a message indicating the employee was fired.
      return { success: true, message: `Fired ${employee.name}` };
    }
  }

  // ================================================================
  // FACADE - wires the services together and exposes the public API
  // ================================================================

  const sessionManager = new SessionManager(LocalStore);
  const auth = new AuthService(LocalStore);
  const player = new PlayerService(LocalStore, sessionManager);
  const websiteService = new WebsiteService(LocalStore, sessionManager);
  const employeeService = new EmployeeService(LocalStore, sessionManager);

  return {
    // Auth
    register: (...args) => auth.register(...args),
    login: (...args) => auth.login(...args),

    // Player
    loadGame: (...args) => player.loadGame(...args),

    // Websites
    listWebsites: (...args) => websiteService.listWebsites(...args),
    getWebsite: (...args) => websiteService.getWebsite(...args),
    createWebsite: (...args) => websiteService.createWebsite(...args),
    payHosting: (...args) => websiteService.payHosting(...args),
    payDomain: (...args) => websiteService.payDomain(...args),
    hostingPlans: (...args) => websiteService.hostingPlans(...args),
    tldOptions: (...args) => websiteService.tldOptions(...args),
    setDevAssignment: (...args) => websiteService.setDevAssignment(...args),
    publishVersion: (...args) => websiteService.publishVersion(...args),
    setAdvertising: (...args) => websiteService.setAdvertising(...args),

    // Team
    listTeam: (...args) => employeeService.listTeam(...args),
    hireEmployee: (...args) => employeeService.hireEmployee(...args),
    assignEmployee: (...args) => employeeService.assignEmployee(...args),
    fireEmployee: (...args) => employeeService.fireEmployee(...args),

    //  Updates the player's game state. - Not a REST endpoint
    //  It currently acts like the periodic update that a real backend
    //  could send through a WebSocket.
    //  Called on an interval by RealtimeBus.
    async tick(token) {
      // Make sure the player is logged in.
      const { db, session } = sessionManager.require(token);
      // Bring every one of the player's websites up to date.
      const { websites: userWebsites, employees: userEmployees } = websiteService.settleAllForUser(db, session.userid);
      // Get the player's game data.
      const userData = db.userData[session.userid];
      // Add any income the player has earned since the last time they were online.
      GameEngine.settleIncome(userData, userWebsites);
      // Save all of the updated game data.
      LocalStore.write(db);
      // Return the player's current data and websites.
      return {
        userData: { ...userData },
        websites: userWebsites.map(site => WebsitePresenter.toPublic(site, userEmployees))
      };
    }
  };
})();

// Export for future Node.js/back-end use.
if (typeof module !== 'undefined' && module.exports) module.exports = GameAPI;
