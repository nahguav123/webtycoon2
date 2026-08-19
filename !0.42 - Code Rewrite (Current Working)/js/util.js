/**
 * util.js
 * ------------------------------------------------------------------
 * Small helper functions shared by different parts of the game.
 *
 * These functions do not store game data and do not change game state.
 * They simply take a value, do something useful with it, and return
 * the result.
 *
 * Examples:
 *
 *   GameUtil.formatMoney(1234.5)
 *   → "1,234.5"
 *
 *   GameUtil.formatDuration(9000000)
 *   → "2h 30m"
 *
 *   GameUtil.parseJwt(token)
 *   → returns the information stored inside the token
 *
 * Keeping these helpers in one place means the same formatting and
 * token-handling code does not have to be copied across every page.
 * 
 * This file also exposes PlayerSessionMixin, a small reusable Vue
 * mixin. Every game page (websites, site detail, team, create
 * website) needs the same "who is logged in / how much money do
 * they have" bookkeeping and the same logout button. Rather than
 * copy-pasting that logic into every page's script (as the previous
 * version did), each page now just adds `mixins: [PlayerSessionMixin]`
 * to its Vue app and gets it for free. If that bookkeeping ever needs
 * to change, it only needs to change here.
 * ------------------------------------------------------------------
 */

const GameUtil = {

  // Creates a JWT-shaped token for the current local/development auth system. (NOT SECURE - DO NOT USE IN PRODUCTION).
  encodeToken(payload) {
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'LOCAL' }));
    // Convert the supplied information into JSON and then Base64.
    const body = btoa(JSON.stringify(payload));
    // Create a fake signature.
    const signature = btoa('local-dev-signature');
    // Put the three parts together.
    return `${header}.${body}.${signature}`;
  },

  // Reads the payload section of a JWT-shaped token.
  parseJwt(token) {
    try {
      const base64Payload = token.split('.')[1];
      // Convert the Base64 payload back into normal text.
      const payload = atob(base64Payload);
      // Convert the JSON text back into a JavaScript object.
      return JSON.parse(payload);
      // If the token is missing, malformed, or cannot be decoded, return null.
    } catch (e) {
      return null;
    }
  },

  // Formats a millisecond duration as "1d 4h 12m", always driven off real
  // timestamps so it stays correct even after the tab was closed a while.
  formatDuration(ms) {
    // No time remaining means the timer has expired.
    if (ms == null || ms <= 0) return 'Expired';
    // Convert milliseconds into whole minutes.
    const totalMinutes = Math.floor(ms / 60000);
    // Calculate how many complete days are remaining.
    const days = Math.floor(totalMinutes / 1440);
    // Calculate the remaining hours after removing complete days.
    const hrs = Math.floor((totalMinutes % 1440) / 60);
    // Calculate the remaining minutes after removing complete hours.
    const mins = totalMinutes % 60;
    // Build the final readable string one section at a time.
    const parts = [];
    // Only display days when there is at least one day.
    if (days) parts.push(`${days}d`);
    // Display hours when there are hours OR when days are being displayed (so it shows "1d 0h 30m" instead of "1d 30m").
    if (hrs || days) parts.push(`${hrs}h`);
    // Always display minutes.
    parts.push(`${mins}m`);
    // Join the individual parts with spaces.
    return parts.join(' ');
  },

  // Converts a number into a readable money-style number.
  formatMoney(n) {
    // Convert the value to a number, if n is missing, null, or otherwise evaluates to 0.
    // Adds thousands separators and allow a maximum of two decimal places.
    return Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
};

/**
 * PlayerSessionMixin
 * ------------------------------------------------------------------
 * Shared Vue mixin used by every logged-in game page.
 *
 * Provides:
 *   - data: token, user, money, webdollars, level, websiteCount, teamCount
 *   - methods: loadUserData(), logout(), listenForUserUpdates()
 *
 * A page opts in with:
 *
 *   createApp({
 *     mixins: [PlayerSessionMixin],
 *     data() { return { ...page-specific state... }; },
 *     async mounted() {
 *       if (!this.requireLogin()) return;
 *       await this.loadUserData();
 *       this.listenForUserUpdates();
 *       RealtimeBus.connect(this.token);
 *     },
 *     ...
 *   })
 * ------------------------------------------------------------------
 */
const PlayerSessionMixin = {
  data() {
    return {
      // JWT-shaped login token, read once when the page loads.
      token: localStorage.getItem('token') || '',
      // Decoded token payload (userid/username).
      user: null,
      // Player stats kept in sync with the server/localStorage.
      money: 0,
      webdollars: 0,
      level: 1,
      websiteCount: 0,
      teamCount: 0
    };
  },
  methods: {
    // Redirects to the login page when there is no token, and decodes the
    // current user from the token when there is one. Returns true when the
    // page is safe to continue loading.
    requireLogin() {
      if (!this.token) {
        window.location = 'login.html';
        return false;
      }
      this.user = GameUtil.parseJwt(this.token);
      return true;
    },

    // Loads the player's core stats (money, webdollars, level, etc).
    async loadUserData() {
      if (!this.token) return;
      const data = await GameAPI.loadGame(this.token);
      this.money = data.money;
      this.webdollars = data.webdollars;
      this.level = data.level;
      this.websiteCount = data.websiteCount;
      this.teamCount = data.teamCount;
    },

    // Applies a real-time "userUpdate" payload from RealtimeBus to the
    // page's local stats, only overwriting fields that were actually sent.
    applyUserUpdate(data) {
      if (!data) return;
      if (data.money != null) this.money = data.money;
      if (data.webdollars != null) this.webdollars = data.webdollars;
      if (data.level != null) this.level = data.level;
      if (data.websiteCount != null) this.websiteCount = data.websiteCount;
      if (data.teamCount != null) this.teamCount = data.teamCount;
    },

    // Starts listening for real-time player stat updates.
    listenForUserUpdates() {
      RealtimeBus.on('userUpdate', this.applyUserUpdate);
    },

    // Logs the player out and returns them to the welcome page.
    logout() {
      RealtimeBus.disconnect();
      localStorage.removeItem('token');
      this.user = null;
      window.location = 'welcome.html';
    }
  },
  beforeUnmount() {
    RealtimeBus.disconnect();
  }
};

// Export for future Node.js/back-end use.
if (typeof module !== 'undefined' && module.exports) module.exports = { GameUtil, PlayerSessionMixin };