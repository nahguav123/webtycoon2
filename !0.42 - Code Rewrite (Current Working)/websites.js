// *********************************************************
// Websites list page
// Create Vue.js App for Game Page
const { createApp } = Vue;

createApp({
  // Player login/stats bookkeeping (token, user, money, etc.) is shared
  // across every game page through PlayerSessionMixin (see js/util.js)
  // instead of being duplicated here.
  mixins: [PlayerSessionMixin],

  data() {
    return {
      sites: [],
      // Websites Page Filter Buttons
      filters: ['All', 'Notifications'],
      activeFilter: 'All',
      sortOption: 'profit', // default sort
      designPercentRed: 25, //percent of colour bar
      designPercentBlue: 25, //percent of colour bar
      designPercentPurple: 25, //percent of colour bar
      designPercentGreen: 25, //percent of colour bar
      charts: {} // siteid -> Chart.js instance, so we can destroy on re-render
    };
  },

  // *********************************************************
  // Websites Page Filter Watchers
  watch: {
    // Whenever the sort option changes
    sortOption() { this.filterWebsites(); },
    // Whenever the active filter changes
    activeFilter() { this.filterWebsites(); },
    // Renders graphs whenever sites changes
    sites(newSites) {
      this.$nextTick(() => newSites.forEach(site => this.renderGraph(site)));
    }
  },

  // *********************************************************
  // Lifecycle Hook
  async mounted() {
    if (!this.requireLogin()) return;

    // Fetch all initial data concurrently
    try {
      await this.loadUserData(); // money, webdollars, level, websiteCount, teamCount
      await this.loadWebsites(); // user's websites
    } catch (err) {
      console.error('Initial data load failed:', err);
    }

    // Real-time updates - swap RealtimeBus's internals for real socket.io
    // later without touching any of this event-handling code.
    this.listenForUserUpdates();

    // Listen for batch website updates (all websites at once)
    RealtimeBus.on('websiteUpdateBatch', websites => {
      if (Array.isArray(websites)) this.sites = websites;
    });
    RealtimeBus.connect(this.token);
  },

  // *********************************************************
  // Methods that are run in mounted()
  methods: {
    // Websites Page Filter Action
    setFilter(filter) { this.activeFilter = filter; },
    filterWebsites() {
      // Sorting/filtering hook - extend this once there's more than one
      // active filter worth acting on.
    },

    // Open Single Website Page from button on Websites page
    openWebsite(siteid) {
      window.location = `sitedetail.html?siteid=${siteid}`;
    },

    async loadWebsites() {
      if (!this.token) return;
      const data = await GameAPI.listWebsites(this.token);
      this.sites = data.websites;
    },

        // Logout User and Clear Token
    logout() {
      RealtimeBus.disconnect();
      localStorage.removeItem('token');
      this.user=null;
      window.location = 'welcome.html';
    },

    // *********************************************************
    // Builds a fixed 24h series (history + projection) for a chart, given
    // the website's stored per-hour history and its current per-hour value.
    // There's no minute-by-minute history stored yet, so this is a light
    // visual approximation rather than real historical data.
    buildGraphSeries(history, currentValue) {
      const nowHour = new Date().getHours();

      const actual = Array(24).fill(null);
      const projection = Array(24).fill(null);

      // Use stored historical values
      if (Array.isArray(history)) {
        history.forEach(entry => {
          const hour = Number(entry.hour);
          if (hour >= 0 && hour <= nowHour) {
            actual[hour] = Number(entry.value) || 0;
          }
        });
      }

      // Make sure the current hour has a value
      actual[nowHour] = currentValue;

      // Fill any missing historical hours
      for (let h = 0; h <= nowHour; h++) {
        if (actual[h] == null) {
          actual[h] = h === 0 ? currentValue : actual[h - 1];
        }
      }

      // Project the current value into future hours
      let projected = currentValue;
      for (let h = nowHour + 1; h < 24; h++) {
        projected += currentValue;
        projection[h] = projected;
      }

      return { actual, projection };
    },

    renderGraph(site) {
      const canvas = document.getElementById('graph-' + site.siteid);
      if (!canvas) return;

      if (this.charts[site.siteid]) {
        this.charts[site.siteid].destroy();
      }

      const visitors = this.buildGraphSeries(
        site.history?.visitors || [],
        Number(site.visitorsPerHour) || 0
      );

      const profit = this.buildGraphSeries(
        site.history?.profit || [],
        Number(site.profitPerHour) || 0
      );

      const nowHour = new Date().getHours();

      const labels = Array.from({ length: 24 }, (_, i) => i + ':00');

      const visitorActual = Array(24).fill(null);
      const visitorProjected = Array(24).fill(null);
      const profitActual = Array(24).fill(null);
      const profitProjected = Array(24).fill(null);

      for (let h = 0; h <= nowHour; h++) {
        visitorActual[h] = visitors.actual[h];
        profitActual[h] = profit.actual[h];
      }

      // Connect the projection to the current value
      visitorProjected[nowHour] = visitors.actual[nowHour];
      profitProjected[nowHour] = profit.actual[nowHour];

      for (let h = nowHour + 1; h < 24; h++) {
        visitorProjected[h] = visitors.projection[h];
        profitProjected[h] = profit.projection[h];
      }

      this.charts[site.siteid] = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Visitors',
              data: visitorActual,
              borderColor: 'blue',
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              tension: 0.3,
              pointRadius: 2
            },
            {
              label: 'Visitors (projected)',
              data: visitorProjected,
              borderColor: 'rgba(0,0,255,0.4)',
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderDash: [5, 5],
              tension: 0.3,
              pointRadius: 0
            },
            {
              label: 'Profit',
              data: profitActual,
              borderColor: '#e0b400',
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              tension: 0.3,
              pointRadius: 2
            },
            {
              label: 'Profit (projected)',
              data: profitProjected,
              borderColor: 'rgba(224,180,0,0.4)',
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderDash: [5, 5],
              tension: 0.3,
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { display: false },
            y: { display: false }
          }
        }
      });
    }
  }
}).mount('#websites-app');