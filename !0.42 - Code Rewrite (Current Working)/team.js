// *********************************************************
// Team Management Page
// Create Vue.js App for Game Page
const { createApp } = Vue;

createApp({
  mixins: [PlayerSessionMixin],

  data() {
    return {
      maxTeam: GameConfig.MAX_EMPLOYEES,
      employees: [],
      websites: [],
      employeeTypes: GameConfig.EMPLOYEE_TYPES,
      showHirePanel: false,
      message: ''
    };
  },

  // *********************************************************
  // Lifecycle Hook
  async mounted() {
    if (!this.requireLogin()) return;

    // Fetch all initial data
    try {
      await this.loadUserData();
      await this.loadTeam();
      await this.loadWebsites();
    } catch (err) {
      console.error('Initial data load failed:', err);
    }

    this.listenForUserUpdates();
    RealtimeBus.connect(this.token);
  },

  // *********************************************************
  // Methods
  methods: {
    // Load team
    async loadTeam() {
      if (!this.token) return;
      const data = await GameAPI.listTeam(this.token);
      this.employees = data.employees || [];
    },

    // Load websites for assignment dropdown
    async loadWebsites() {
      if (!this.token) return;
      const data = await GameAPI.listWebsites(this.token);
      this.websites = data.websites || [];
    },

    // Get employee type label
    getEmployeeTypeLabel(type) {
      return GameConfig.EMPLOYEE_TYPES[type]?.name || type;
    },

    // Get assigned site name
    getAssignedSiteName(siteid) {
      const site = this.websites.find(w => w.siteid === siteid);
      return site ? site.sitename + site.tld : 'Unknown';
    },

    // Format date
    formatDate(timestamp) {
      return new Date(timestamp).toLocaleDateString();
    },

    // Hire employee
    async hireEmployee(employeeType) {
      if (!this.token) return;
      try {
        const data = await GameAPI.hireEmployee(this.token, employeeType);
        this.message = data.message;
        this.employees.push(data.employee);
        await this.loadUserData();
        setTimeout(() => { this.message = ''; }, 3000);
      } catch (err) {
        this.message = err.message || 'Failed to hire employee';
      }
    },

    // Fire employee
    async fireEmployee(employeeid) {
      if (!confirm('Are you sure you want to fire this employee?')) return;
      if (!this.token) return;
      try {
        const data = await GameAPI.fireEmployee(this.token, employeeid);
        this.message = data.message;
        this.employees = this.employees.filter(e => e.employeeid !== employeeid);
        await this.loadUserData();
        setTimeout(() => { this.message = ''; }, 3000);
      } catch (err) {
        this.message = err.message || 'Failed to fire employee';
      }
    },

    // Assign employee to site
    async assignEmployee(employeeid, siteid) {
      if (!this.token) return;
      try {
        const data = await GameAPI.assignEmployee(this.token, employeeid, siteid);
        this.message = data.message;
        // Reload employees to show updated assignment.
        await this.loadTeam();
        setTimeout(() => { this.message = ''; }, 2000);
      } catch (err) {
        this.message = err.message || 'Failed to assign employee';
      }
    },
    // Logout User and Clear Token
    logout() {
      RealtimeBus.disconnect();
      localStorage.removeItem('token');
      window.location = 'welcome.html';
    }
  }
}).mount('#team-app');