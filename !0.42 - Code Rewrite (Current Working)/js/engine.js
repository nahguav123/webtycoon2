/**
 * engine.js
 * ------------------------------------------------------------------
 * Contains the game's core calculations.
 * It only takes game data, performs calculations, and updates/returns
 * that data.
 *
 * All time calculations use real-world timestamps from Date.now().
 * This means the game can calculate what happened while the player
 * was offline instead of needing the game to run continuously.
 *
 * Keeping the game calculations here also means the same logic could
 * eventually be moved to a real backend without changing the rules.
 * 
 * The big `settleVisitors` calculation from the previous version has
 * been split into several small, single-purpose private methods
 * (prefixed with `_`) so each piece of the visitor formula can be
 * read and tested on its own.
 * ------------------------------------------------------------------
 */

class WebsiteGameEngine {
  // ================================================================
  // EMPLOYEE BONUSES
  // ================================================================

  // Multiple employees can have their bonuses combined.
  getTrackBonusMultiplier(site, employees = [], track) {
    // Convert the website ID to a number so IDs stored as strings and numbers can be compared correctly.
    const siteId = Number(site.siteid);
    // Start every development track with no bonus.
    const bonusByTrack = { design: 0, frontend: 0, backend: 0 };
    // Check every employee.
    employees.forEach(emp => {
      // Find the website this employee is assigned to.
      const assignedSiteId = Number(emp.assignedTo);
      // Only include employees assigned to this website.
      if (!Number.isNaN(assignedSiteId) && assignedSiteId === siteId) {
        // Converts the employee's multiplier into a bonus and adds it to the base bonus for that track.
        bonusByTrack.design += (Number(emp.designBonus) || 1) - 1;
        bonusByTrack.frontend += (Number(emp.frontendBonus) || 1) - 1;
        bonusByTrack.backend += (Number(emp.backendBonus) || 1) - 1;
      }
    });
    // Return the final multiplier for the requested track.
    return 1 + (bonusByTrack[track] || 0);
  }

  // ================================================================
  // PLAYER INCOME
  // ================================================================

  // Settles real-time passive income earned since the user's last time online.
  settleIncome(userData, websites, now = Date.now()) {
    // Find the last time the player's income was calculated.
    const lastTick = userData.lastTick || now;
    // Convert the elapsed time from milliseconds into hours.
    const elapsedHours = Math.max(0, (now - lastTick) / 3_600_000);
    // Only calculate income if some time has actually passed.
    if (elapsedHours > 0) {
      // Add together the normal website income and advertising income from all of the player's websites.
      const hourlyIncome = websites.reduce(
        (sum, site) => sum + (site.profitPerHour || 0) + (site.advertisingProfitPerHour || 0),
        0
      );
      // Give the player income for the amount of time that passed.
      userData.money = (userData.money || 0) + hourlyIncome * elapsedHours;
      // Remember when income was last calculated.
      userData.lastTick = now;
    }
    // Return the updated player data.
    return userData;
  }

  // ================================================================
  // WEBSITE DEVELOPMENT
  // ================================================================

  // Advances a website's development based on the amount of real time passed.
  advanceDevelopment(site, employees = [], now = Date.now()) {
    // Find the last time this website's development was calculated.
    const lastTick = site.devLastTick || now;
    // Convert elapsed time into hours.
    const elapsedHours = Math.max(0, (now - lastTick) / 3_600_000);
    // Only add development points if time has passed.
    if (elapsedHours > 0) {
      // Update each development track.
      ['design', 'frontend', 'backend'].forEach(track => {
        // Get the development data for this track.
        const trackData = site.dev[track];
        // Get the employee bonus multiplier for this track.
        const bonusMultiplier = this.getTrackBonusMultiplier(site, employees, track);
        // Calculate how many points were earned during this period.
        const pointsThisPeriod = trackData.ratePerHour * bonusMultiplier * elapsedHours;
        // Add the points without allowing the track to exceed its target.
        trackData.points = Math.min(trackData.target, trackData.points + pointsThisPeriod);
      });
      // Remember when development was last calculated.
      site.devLastTick = now;
    }
    // Return the updated website.
    return site;
  }

  // ================================================================
  // WEBSITE HISTORY
  // ================================================================

  // Get current hour of day and decide when a new history entry should be created.
  getHistoryBucket(site, now = Date.now()) {
    const bucket = Number(new Date(now).getHours());
    // Return the hour if it is valid otherwise 0.
    return Number.isFinite(bucket) ? bucket : 0;
  }

  // Make sure the website has a valid history object.
  ensureHistory(site) {
    // Create the history object if it doesn't exist.
    if (!site.history) site.history = { visitors: [], profit: [], lastHour: null };
    // Make sure the visitors history is an array.
    if (!Array.isArray(site.history.visitors)) site.history.visitors = [];
    // Make sure the profit history is an array.
    if (!Array.isArray(site.history.profit)) site.history.profit = [];
    // Keep only the most recent 24 visitor records.
    if (site.history.visitors.length > 24) site.history.visitors = site.history.visitors.slice(-24);
    // Keep only the most recent 24 profit records.
    if (site.history.profit.length > 24) site.history.profit = site.history.profit.slice(-24);
    return site.history;
  }

  // Save the current visitor and profit values into the website's history, creating a new entry if the hour has changed.
  recordHistorySnapshot(site, now = Date.now()) {
    // Make sure the history structure exists first.
    const history = this.ensureHistory(site);
    // Find the current hour.
    const currentHour = this.getHistoryBucket(site, now);
    // Get the current visitor count.
    const visitors = Math.max(0, Number(site.visitorsPerHour) || 0);
    // Get the current profit.
    const profit = Math.max(0, Number(site.profitPerHour) || 0);
    // If we have moved into a new hour, create a new history entry.
    if (history.lastHour !== currentHour) {
      history.visitors.push(visitors);
      history.profit.push(profit);
      if (history.visitors.length > 24) history.visitors = history.visitors.slice(-24);
      if (history.profit.length > 24) history.profit = history.profit.slice(-24);
      // Remember the hour this snapshot belongs to.
      history.lastHour = currentHour;
      // Else if in same hour, update the last entry with the latest values.
    } else {
      if (history.visitors.length === 0) history.visitors.push(visitors);
      else history.visitors[history.visitors.length - 1] = visitors;
      if (history.profit.length === 0) history.profit.push(profit);
      else history.profit[history.profit.length - 1] = profit;
    }
    return history;
  }

  // ================================================================
  // DEVELOPMENT PROGRESS
  // ================================================================

  // Calculate the overall development percentage of a website.
  overallProgress(site) {
    const tracks = ['design', 'frontend', 'backend'];
    // Add together the targets for all tracks.
    const totalTarget = tracks.reduce((sum, track) => sum + site.dev[track].target, 0);
    // Add together the completed points for all tracks.
    const totalPoints = tracks.reduce((sum, track) => sum + site.dev[track].points, 0);
    // Convert completed points into a percentage, if no value return 0.
    return totalTarget ? Math.round((totalPoints / totalTarget) * 100) : 0;
  }

  // Check whether every development track has reached its target.
  isReadyToPublish(site) {
    return ['design', 'frontend', 'backend'].every(track => site.dev[track].points >= site.dev[track].target);
  }

  // ================================================================
  // HOSTING AND DOMAIN TIME
  // ================================================================

  // Return the number of milliseconds remaining on the website's hosting plan, or a negative number if it has expired.
  hostingRemainingMs(site, now = Date.now()) {
    return (site.hostingExpiresAt || 0) - now;
  }

  // Return the number of milliseconds remaining on the website's domain, or a negative number if it has expired.
  domainRemainingMs(site, now = Date.now()) {
    return (site.domainExpiresAt || 0) - now;
  }

  // ================================================================
  // VISITOR SYSTEM
  // ================================================================

  // Update the website's visitors based on the amount of real time passed, applying growth, churn, and penalties for expired domain/hosting.
  settleVisitors(site, now = Date.now()) {
    // Find the last time visitors were calculated, if it doesn't exist, use the website's creation time or now.
    const lastTick = site.visitorLastTick || site.createdAt || now;
    // Convert elapsed time into hours.
    const elapsedHours = Math.max(0, (now - lastTick) / 3_600_000);
    // Nothing to calculate if no time has passed.
    if (elapsedHours === 0) return site;

    // Current visitor count.
    let visitors = Math.max(0, site.visitorsPerHour || 0);

    if (this._hasExpiredDomainOrHosting(site, now)) {
      visitors = this._applyExpirationPenalty(site, visitors, elapsedHours, now);
    } else {
      visitors = this._applyNormalGrowth(site, visitors, elapsedHours, now);
    }

    // Store the final visitor count, capped by hosting capacity and rounded to the nearest whole number.
    site.visitorsPerHour = Math.max(0, Math.round(this._capToHostingCapacity(site, visitors)));
    // Remember when visitors were last calculated.
    site.visitorLastTick = now;
    // Save the current values to the website's history.
    this.recordHistorySnapshot(site, now);
    // Return the updated website.
    return site;
  }

  // Whether the website's domain or hosting has expired as of `now`.
  _hasExpiredDomainOrHosting(site, now) {
    const domainExpired = (site.domainExpiresAt || 0) <= now;
    const hostingExpired = (site.hostingExpiresAt || 0) <= now;
    return domainExpired || hostingExpired;
  }

  // Applies the visitor loss penalty for an expired domain and/or hosting plan.
  // Hosting expiration is treated as the more severe penalty when both are expired.
  _applyExpirationPenalty(site, visitors, elapsedHours, now) {
    const hostingExpired = (site.hostingExpiresAt || 0) <= now;
    const penaltyRate = hostingExpired
      ? GameConfig.EXPIRED_HOSTING_VISITOR_LOSS_PER_HOUR
      : GameConfig.EXPIRED_DOMAIN_VISITOR_LOSS_PER_HOUR;
    // Apply the penalty repeatedly over the elapsed time, math.pow() allows the penalty to compound correctly when several hours have passed while the player was offline.
    return visitors * Math.pow(1 - penaltyRate, elapsedHours);
  }

  // Applies normal hourly visitor growth, churn, age/dev bonuses, and advertising penalties.
  _applyNormalGrowth(site, visitors, elapsedHours, now) {
    // Base visitors gained per hour before churn/penalties, given the website's current bonuses.
    const baseAddition = this._hourlyVisitorGrowth(site, now);
    // Natural visitor loss.
    const churn = GameConfig.VISITOR_CHURN_RATE_PER_HOUR;
    // Adds together every advertising option's visitor penalty, up to the configured maximum.
    const adPenalty = this._advertisingVisitorPenalty(site);

    let result = visitors;
    // Each hour: add new visitors, then lose some to churn
    // Doing this one hour at a time allows the visitor system to behave consistently even after long periods offline.
    for (let h = 0; h < elapsedHours; h++) {
      // Add new visitors generated during this hour.
      result += baseAddition;
      // Apply natural visitor churn.
      result *= (1 - churn);
      // Apply advertising penalties.
      if (adPenalty > 0) result *= (1 - adPenalty);
    }
    // If less than a full hour remains, apply a proportional amount of growth and churn for the fractional hour.
    const fractionalHour = elapsedHours % 1;
    if (fractionalHour > 0) {
      // Add a proportional amount of new visitors.
      result += baseAddition * fractionalHour;
      // Apply a proportional amount of churn.
      result *= Math.pow(1 - churn, fractionalHour);
    }
    return result;
  }

  // Calculates the number of new visitors generated each hour before churn/penalties,
  // combining the website's TLD boost, age bonus, and development quality bonus.
  _hourlyVisitorGrowth(site, now) {
    // Get the website's overall development progress.
    const devProgress = this.overallProgress(site) || 0;
    // Get the visitor boost from the website's TLD, if tld is invalid or missing, default to 1.0 (no boost).
    const tldBoost = (GameConfig.TLD_OPTIONS[site.tld] || {}).visitorBoost || 1.0;
    // Calculate how many hours old the website is.
    const siteAgeHours = Math.max(0, (now - (site.createdAt || now)) / 3_600_000);
    // Convert website age into an age bonus, the bonus increases once per day but cannot exceed VISITOR_AGE_MAX_BOOST.
    const ageBonus = Math.min(
      GameConfig.VISITOR_AGE_MAX_BOOST,
      (siteAgeHours / 24) * GameConfig.VISITOR_AGE_BOOST_PER_DAY
    );
    // Convert development percentage into a visitor bonus.
    const devQualityBonus = (devProgress / 100) * GameConfig.VISITOR_DEV_QUALITY_MULTIPLIER;
    // Calculate the number of new visitors generated each hour.
    return GameConfig.VISITOR_BASE_GROWTH_PER_HOUR * (1 + tldBoost) * (1 + ageBonus + devQualityBonus);
  }

  // Adds together every enabled advertising option's visitor penalty, capped at the configured maximum.
  _advertisingVisitorPenalty(site) {
    return Math.min(
      GameConfig.MAX_VISITOR_LOSS_FROM_ADVERTISING,
      (site.advertising || []).reduce((sum, advertising) => {
        // Disabled adverts do not affect visitors.
        if (!advertising.enabled) return sum;
        // Add this advert's visitor penalty.
        return sum + (Number(advertising.visitorPenalty) || 0);
      }, 0)
    );
  }

  // Caps the website's visitor count at the amount its hosting plan can sustainably support.
  _capToHostingCapacity(site, visitors) {
    // The raw visitor limit granted by the current hosting plan.
    const capacity = site.visitorLimit || 1000;
    // Find how much of the hosting capacity can be sustainably maintained over time, defaults to 50% if the plan is invalid or missing.
    const retention = GameConfig.HOSTING_PLAN_RETENTION[site.hostingOption || GameConfig.DEFAULT_HOSTING_PLAN] || 0.5;
    // Calculate the sustainable visitor capacity.
    const sustainedCapacity = capacity * retention;
    // Visitors cannot exceed the sustainable hosting capacity.
    return Math.min(visitors, sustainedCapacity);
  }
}

// Single shared instance used throughout the game.
const GameEngine = new WebsiteGameEngine();

// Export for future Node.js/back-end use.
if (typeof module !== 'undefined' && module.exports) module.exports = { WebsiteGameEngine, GameEngine };
