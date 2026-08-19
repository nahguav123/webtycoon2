/**
 * store.js
 * ------------------------------------------------------------------
 * Handles saving and loading the game's data.
 *
 * Right now the game uses the browser's localStorage as its database.
 *
 * IMPORTANT:
 * Other files should NOT use localStorage directly.
 *
 * They should always use:
 *
 *   LocalStore.read()
 *   LocalStore.write()
 *   LocalStore.reset()
 *
 * This gives us one place to replace when a real backend/database
 * is added later.
 *
 * For example, the current setup is:
 *
 *   GameAPI
 *      ↓
 *   LocalStore
 *      ↓
 *   localStorage
 *
 * A future backend could become:
 *
 *   GameAPI
 *      ↓
 *   fetch()
 *      ↓
 *   Real database
 *
 * without the rest of the application needing to know how the data
 * is actually stored.
 * ------------------------------------------------------------------
 */

class LocalStorageGameStore {
  constructor(storageKey) {
    // Name used to store the entire game database inside localStorage.
    this.storageKey = storageKey;
  }

  // Create the default database structure.
  createEmptyDatabase() {
    return {
      // Next ID to use when creating a new user.
      nextUserId: 1,
      // Next ID to use when creating a new website.
      nextSiteId: 1,
      // Next ID to use when creating a new employee.
      nextEmployeeId: 1,
      // Quickly find a user ID from a lowercase username, this allows the login system to find user #... without searching through every user.
      usernameIndex: {},
      // Stores the actual user accounts.
      users: {},         // userid -> { userid, username, email, passwordHash, createdAt }
      // Stores the game-related information belonging to each user.
      userData: {},      // userid -> { money, webdollars, level, websiteCount, teamCount, lastTick }
      // Stores every website created in the game, each website is connected to its owner through userid.
      websites: {},      // siteid -> website object
      // Stores every employee hired by every player.
      employees: {},     // employeeid -> { employeeid, userid, name, type, hired, assignedTo }
      // Stores active login sessions.
      sessions: {}        // token -> { userid, username, expiresAt }
    };
  }

  // Load the complete game database from localStorage.
  read() {
    try {
      // Get the saved database from the browser.
      const raw = localStorage.getItem(this.storageKey);
      // If data exists, convert the JSON string back into an object.
      // If no data exists, create a new empty database.
      return raw ? JSON.parse(raw) : this.createEmptyDatabase();
    } catch (e) {
      // If the saved data is corrupt or cannot be read, log the problem and start with a fresh database.
      console.error('LocalStore: read failed, resetting local db', e);
      return this.createEmptyDatabase();
    }
  }

  // Save the complete game database to localStorage.
  write(db) {
    // Convert the JavaScript object into JSON and store it in the browser.
    localStorage.setItem(this.storageKey, JSON.stringify(db));
  }

  // Completely erase the current database and replace it with a fresh empty database.
  reset() {
    this.write(this.createEmptyDatabase());
  }
}

// Single shared instance used by the rest of the game, keyed under its own
// namespace so it doesn't clash with anything else stored in localStorage.
const LocalStore = new LocalStorageGameStore('webtycoon:db');

// Export for future Node.js/back-end use.
if (typeof module !== 'undefined' && module.exports) module.exports = { LocalStorageGameStore, LocalStore };