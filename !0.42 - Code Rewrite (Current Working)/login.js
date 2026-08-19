const { createApp } = Vue;

createApp({
  data() {
    return {
      login: { username: '', password: '' },
      loginMessage: '',
      loginMessageColor: 'black'
    };
  },
  methods: {
    async submitLogin() {
      this.loginMessage = '';
      try {
        const data = await GameAPI.login(this.login);
        localStorage.setItem('token', data.token);
        this.loginMessage = 'Login successful!';
        this.loginMessageColor = 'green';
        this.login.username = '';
        this.login.password = '';
        setTimeout(() => (window.location = 'websites.html'), 800);
      } catch (err) {
        this.loginMessage = err.message;
        this.loginMessageColor = 'red';
      }
    }
  }
}).mount('#login-app');