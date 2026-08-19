/**
 * realtime.js
 * ------------------------------------------------------------------
 * Handles the game's real-time updates.
 *
 * This is currently a simple replacement for a real Socket.IO
 * connection.
 *
 * Instead of receiving updates from a server, this file regularly
 * asks GameAPI for the latest game data.
 *
 * The rest of the application does not need to know whether updates
 * are coming from polling or a real multiplayer server.
 *
 * The application can:
 *
 *   RealtimeBus.on()          Listen for an event
 *   RealtimeBus.off()         Stop listening for an event
 *   RealtimeBus.connect()     Start receiving updates
 *   RealtimeBus.disconnect()  Stop receiving updates
 *
 * When a real multiplayer backend is added later, this file can be
 * replaced with a real Socket.IO/WebSocket connection while keeping
 * the same event names.
 * ------------------------------------------------------------------
 */

class RealtimeUpdatesBus {
  constructor() {
    // Stores all functions that are waiting for real-time events.
    this.listeners = {};
    // This lets the timer stop when disconnect() is called.
    this.intervalId = null;
  }

  // SEND AN EVENT
  // Gives the event data to every listener registered for it.
  emit(event, payload) {
    (this.listeners[event] || []).forEach(cb => cb(payload));
  }

  // Adds a function that should run whenever an event occurs.
  // RealtimeBus.on('userUpdate', userData => { ... });
  on(event, cb) {
    (this.listeners[event] = this.listeners[event] || []).push(cb);
  }

  // Remove a previously registered event listener.
  off(event, cb) {
    // There is nothing to remove if the event has no listeners.
    if (!this.listeners[event]) return;
    // Keep every listener except the one we want to remove.
    this.listeners[event] = this.listeners[event].filter(fn => fn !== cb);
  }

  // START RECEIVING REAL-TIME UPDATES
  // Currently this works by repeatedly calling GameAPI.tick(), a proper backend would replace this with a Socket.IO connection.
  connect(token) {
    // Make sure an old connection is not still running.
    this.disconnect();
    // Tell the application that the connection has started.
    this.emit('connect', {});

    // Function that gets the latest game data.
    const poll = async () => {
      try {
        // Ask the API to settle the player's latest income, development, visitors and advertising.
        const { userData, websites } = await GameAPI.tick(token);
        // Send the latest player information to anything listening for user updates.
        this.emit('userUpdate', userData);
        // Convert the full website objects into the smaller set of information needed for website list updates and send them.
        this.emit('websiteUpdateBatch', websites.map(w => ({
          siteid: w.siteid,
          sitename: w.sitename,
          tld: w.tld,
          version: w.version,
          visitorsPerHour: Math.round(w.visitorsPerHour),
          profitPerHour: Math.round(w.profitPerHour)
        })));
        // A failed update should not crash the rest of the app, the next scheduled poll can try again.
      } catch (err) {
        console.error('RealtimeBus: tick failed', err);
      }
    };

    // Run the first update immediately instead of waiting for the first interval.
    poll();
    // Continue checking for updates at the configured interval. The interval is controlled by GameConfig.TICK_INTERVAL_MS so it can be changed in one place for the entire game.
    this.intervalId = setInterval(poll, GameConfig.TICK_INTERVAL_MS);
  }

  // Stop receiving real-time updates.
  disconnect() {
    // If a polling timer exists, stop it.
    if (this.intervalId) clearInterval(this.intervalId);
    // Clear the timer reference so the app knows it is disconnected.
    this.intervalId = null;
  }
}

// Single shared instance used throughout the game.
const RealtimeBus = new RealtimeUpdatesBus();

// Export for future Node.js/back-end use.
if (typeof module !== 'undefined' && module.exports) module.exports = { RealtimeUpdatesBus, RealtimeBus };
