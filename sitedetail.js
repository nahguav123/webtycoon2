// *********************************************************
// Create Vue.js App for Game Page
// Site detail / management page
const { createApp } = Vue;

createApp({
  mixins: [PlayerSessionMixin],

  data() {
    return {
      siteid: Number(new URLSearchParams(window.location.search).get('siteid')),
      website: null,
      message: '',
      hostingPlans: GameConfig.HOSTING_PLANS,
      tldOptions: GameConfig.TLD_OPTIONS,
      selectedPlan: null,
      showChangeHosting: false,
      showChangeDomain: false,
      newDomainName: '',
      newTld: GameConfig.DEFAULT_TLD,
      commentsPanel: false,
      // Initialize with empty array; will be populated from server
      advertisingOptions: [],
      chart: null // Chart.js instance for the 24h graph
    };
  },

  // *********************************************************
  // Lifecycle Hook
  async mounted() {
    if (!this.requireLogin()) return;

    // Fetch all initial data concurrently
    try {
      await this.loadUserData();
      if (this.siteid) await this.loadSingleSite();
    } catch (err) {
      console.error('Initial data load failed:', err);
    }

    // Listen for server-pushed updates for user stats
    this.listenForUserUpdates();
    RealtimeBus.connect(this.token);
  },

  beforeUnmount() {
    if (this.chart) this.chart.destroy();
  },

  // *********************************************************
  // Methods that are run in mounted()
  methods: {
    // Logout User and Clear Token
    logout() {
      RealtimeBus.disconnect();
      localStorage.removeItem('token');
      window.location = 'welcome.html';
    },

    formatMinutes(ms) {
      return GameUtil.formatDuration(ms);
    },

    // Get worker name and points/hour from config
    getWorkerName(track) {
      const worker = GameConfig.WORKERS[track];
      return worker ? worker.name : track.charAt(0).toUpperCase() + track.slice(1);
    },

    getEffectiveRate(track) {
      if (!this.website || !this.website.dev || !this.website.dev[track]) return 0;
      return Number(this.website.dev[track].effectiveRatePerHour || this.website.dev[track].ratePerHour || 0);
    },

    getDisplayVisitors() {
      if (!this.website) return 0;
      return Number(this.website.visitorsPerHour || 0);
    },

    getDisplayProfit() {
      if (!this.website) return 0;
      return Number(this.website.profitPerHour || 0);
    },

    // *********************************************************
    // Build a 24h series for a fixed 00:00 to 24:00 axis.
    // Historical data is shown as a solid line up to the current hour.
    // Projected future data is shown as a dashed line from the current hour onwards.
    buildSeries(historyValues, currentValue) {
      const history = Array(25).fill(null);
      const projection = Array(25).fill(null);

      const base = Math.max(0, Number(currentValue) || 0);

      const now = new Date();
      const nowHour = now.getHours();

      const hasHistory = Array.isArray(historyValues) && historyValues.length > 0;

      // -------------------------------------------------------
      // HISTORY
      // -------------------------------------------------------
      if (hasHistory) {
        const historyData = historyValues.slice(-24);

        /*
         * If we have 24 values, treat them as today's
         * 00:00 -> 23:00 values.
         *
         * If we have fewer than 24 values, assume they are
         * the most recent hourly values ending at the current hour.
         */
        if (historyData.length === 24) {
          historyData.forEach((value, hour) => {
            if (hour <= nowHour) {
              history[hour] = Number(value) || 0;
            }
          });
        } else {
          const startHour = Math.max(0, nowHour - historyData.length + 1);
          historyData.forEach((value, index) => {
            const hour = startHour + index;
            if (hour >= 0 && hour <= nowHour) {
              history[hour] = Number(value) || 0;
            }
          });
        }

        // Current value is the final historical point.
        // This makes the solid line meet the dashed projection.
        history[nowHour] = base;
      }

      // -------------------------------------------------------
      // PROJECTION
      // -------------------------------------------------------

      /*
       * The projection starts at the current hour so the
       * dashed line connects directly to the historical line.
       */
      projection[nowHour] = base;

      for (let hour = nowHour + 1; hour <= 24; hour++) {
        const hoursAhead = hour - nowHour;
        // Keep the existing 10% per hour projection.
        projection[hour] = Math.round(base * (1 + 0.1 * hoursAhead));
      }

      return { history, projection };
    },

    // *********************************************************
    // Render the 24-hour performance chart.
    //
    // X axis:
    //   00:00 -> 24:00
    //
    // History:
    //   Solid line up to current time
    //
    // Projection:
    //   Dashed line from current time to 24:00
    //
    // If there is no history, only the projection is shown.
    // *********************************************************
    renderGraph() {
      if (!this.website) return;

      const canvas = document.getElementById('site-detail-graph');
      if (!canvas) return;

      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }

      const visitorsHistory =
        this.website.history && Array.isArray(this.website.history.visitors)
          ? this.website.history.visitors
          : [];

      const profitHistory =
        this.website.history && Array.isArray(this.website.history.profit)
          ? this.website.history.profit
          : [];

      const visitors = this.buildSeries(visitorsHistory, this.getDisplayVisitors());
      const profit = this.buildSeries(profitHistory, this.getDisplayProfit());

      // IMPORTANT:
      // 25 labels gives us 00:00 through 24:00.
      const labels = Array.from({ length: 25 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

      const hasVisitorHistory = visitorsHistory.length > 0;
      const hasProfitHistory = profitHistory.length > 0;

      this.chart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
          labels,
          datasets: [
            // -------------------------------------------------
            // VISITOR HISTORY - SOLID
            // -------------------------------------------------
            ...(hasVisitorHistory
              ? [{
                  label: 'Visitors',
                  data: visitors.history,
                  borderColor: 'blue',
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  borderDash: [],
                  tension: 0.3,
                  pointRadius: 2,
                  pointHoverRadius: 4,
                  spanGaps: false
                }]
              : []),

            // -------------------------------------------------
            // VISITOR PROJECTION - DASHED
            // -------------------------------------------------
            {
              label: 'Visitors (projected)',
              data: visitors.projection,
              borderColor: 'rgba(0, 0, 255, 0.45)',
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderDash: [6, 6],
              tension: 0.3,
              pointRadius: 0,
              pointHoverRadius: 4,
              spanGaps: false
            },

            // -------------------------------------------------
            // PROFIT HISTORY - SOLID
            // -------------------------------------------------
            ...(hasProfitHistory
              ? [{
                  label: 'Profit',
                  data: profit.history,
                  borderColor: '#e0b400',
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  borderDash: [],
                  tension: 0.3,
                  pointRadius: 2,
                  pointHoverRadius: 4,
                  spanGaps: false
                }]
              : []),

            // -------------------------------------------------
            // PROFIT PROJECTION - DASHED
            // -------------------------------------------------
            {
              label: 'Profit (projected)',
              data: profit.projection,
              borderColor: 'rgba(224, 180, 0, 0.45)',
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderDash: [6, 6],
              tension: 0.3,
              pointRadius: 0,
              pointHoverRadius: 4,
              spanGaps: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            legend: { display: true, position: 'top' },
            tooltip: {
              callbacks: {
                title(items) { return items[0]?.label || ''; }
              }
            }
          },
          scales: {
            x: {
              display: true,
              // Force the axis to show the full day.
              min: 0,
              max: 24,
              ticks: {
                autoSkip: false,
                maxRotation: 0,
                callback(value, index) { return labels[index]; }
              }
            },
            y: {
              display: true,
              beginAtZero: true
            }
          }
        }
      });
    },

    // *********************************************************
    // Load single website from server initially and on refresh
    async loadSingleSite() {
      if (!this.token || !this.siteid) return;
      try {
        const data = await GameAPI.getWebsite(this.token, this.siteid);
        this.website = data.website;
        if (data.website.advertising) {
          this.advertisingOptions = data.website.advertising;
        }
        // Render the 24-hour graph after website loads
        this.$nextTick(() => this.renderGraph());
      } catch (err) {
        console.error('Error loading single website:', err);
      }
    },

    // *********************************************************
    // Pay hosting for the current plan (just extends time, doesn't change plan)
    async payHostingCurrent() {
      if (!this.website) return;
      try {
        const data = await GameAPI.payHosting(this.token, this.siteid, this.website.hostingOption);
        this.message = data.message;
        await this.loadSingleSite();
        await this.loadUserData();
      } catch (err) {
        this.message = err.message || 'Failed to pay hosting';
      }
    },

    // *********************************************************
    // Allow user to change hosting for a new plan (changes plan, updates DB, resets time to new plan)
    async changeHostingPlan() {
      if (!this.selectedPlan) { this.message = 'Select a hosting plan first'; return; }
      try {
        const data = await GameAPI.payHosting(this.token, this.siteid, this.selectedPlan);
        this.message = data.message;
        this.showChangeHosting = false;
        await this.loadSingleSite();
        await this.loadUserData();
      } catch (err) {
        this.message = err.message || 'Failed to pay hosting';
      }
    },

    // *********************************************************
    // Renew current domain only (no change)
    async renewDomainCurrent() {
      if (!this.website) return;
      try {
        const data = await GameAPI.payDomain(this.token, this.siteid, {
          newSitename: this.website.sitename,
          newTld: this.website.tld
        });
        this.message = `Domain renewed: ${data.domain}`;
        await this.loadSingleSite();
        await this.loadUserData();
      } catch (err) {
        this.message = err.message || 'Failed to renew domain';
      }
    },

    // *********************************************************
    // Change domain / change TLD
    async changeDomainConfirm() {
      if (!this.newDomainName || !this.newTld) { this.message = 'Domain name and TLD required'; return; }
      try {
        const data = await GameAPI.payDomain(this.token, this.siteid, {
          newSitename: this.newDomainName,
          newTld: this.newTld
        });
        this.message = data.message;
        this.showChangeDomain = false;
        await this.loadSingleSite();
        await this.loadUserData();
      } catch (err) {
        this.message = err.message || 'Failed to update domain';
      }
    },

    async toggleAssign(track) {
      if (!this.website) return;
      const assigned = this.website.dev[track].ratePerHour === 0;
      try {
        const data = await GameAPI.setDevAssignment(this.token, this.siteid, track, assigned);
        this.website = data.website;
      } catch (err) {
        this.message = err.message || 'Failed to assign worker';
      }
    },

    async publishVersion() {
      try {
        const data = await GameAPI.publishVersion(this.token, this.siteid);
        this.message = data.message;
        this.website = data.website;
        if (data.website.advertising) {
          this.advertisingOptions = data.website.advertising;
        }
      } catch (err) {
        this.message = err.message || 'Failed to publish';
      }
    },

    async toggleAdvertising(option) {
      if (!this.website || !this.token) return;
      try {
        const data = await GameAPI.setAdvertising(this.token, this.siteid, option.id, option.enabled);
        this.website = data.website;
        this.advertisingOptions = data.website.advertising || this.advertisingOptions;
        this.message = data.message;
        this.$nextTick(() => this.renderGraph());
        await this.loadUserData();
      } catch (err) {
        option.enabled = !option.enabled;
        this.message = err.message || 'Failed to update advertising';
      }
    },

    // *********************************************************
    // Dashboard Panel Button Functions
    showComments() {
      this.commentsPanel = !this.commentsPanel;
    },
    changeHostingButton() {
      this.showChangeHosting = !this.showChangeHosting;
    },
    changeDomainButton() {
      this.showChangeDomain = !this.showChangeDomain;
    }
  }
}).mount('#site-detail-app');