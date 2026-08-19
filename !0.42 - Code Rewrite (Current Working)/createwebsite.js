// *********************************************************
// Create website page
// Create Vue.js App for Game Page
const { createApp } = Vue;

createApp({
  mixins: [PlayerSessionMixin],

  data() {
    return {
      domainName: '',
      tld: GameConfig.DEFAULT_TLD,
      siteType: 'Blog',
      siteTypes: GameConfig.SITE_TYPES,
      tldOptions: GameConfig.TLD_OPTIONS,
      message: ''
    };
  },

  // *********************************************************
  // Lifecycle Hook
  async mounted() {
    if (!this.requireLogin()) return;

    try {
      await this.loadUserData();
    } catch (err) {
      console.error('Initial data load failed:', err);
    }

    this.listenForUserUpdates();
    RealtimeBus.connect(this.token);
  },

  // *********************************************************
  // Methods that are run in mounted()
  methods: {
    // *********************************************************
    // Create new website
    async createWebsite() {
      this.message = '';
      if (this.domainName.includes(' ')) {
        this.message = 'Domain name cannot contain spaces.';
        return;
      }
      try {
        await GameAPI.createWebsite(this.token, {
          domainName: this.domainName,
          tld: this.tld,
          siteType: this.siteType
        });
        this.message = `Website created! ${this.domainName}${this.tld}`;
        this.domainName = '';
        this.tld = GameConfig.DEFAULT_TLD;
        await this.loadUserData();
        setTimeout(() => (window.location = 'websites.html'), 700);
      } catch (err) {
        this.message = err.message || 'Failed to create website';
      }
    },
    // Logout User and Clear Token
    logout() {
      RealtimeBus.disconnect();
      localStorage.removeItem('token');
      this.user=null;
      window.location = 'welcome.html';
    }
  }
}).mount('#create-website-app');