const { createApp } = Vue;

createApp({
  data() {
    return {
      register: { username: '', email: '', password: '', confirmPassword: '' },
      registerMessage: '',
      registerMessageColor: 'black'
    };
  },
  methods: {
    async submitRegister() {
      this.registerMessage = '';
      if (this.register.password !== this.register.confirmPassword) {
        this.registerMessage = 'Passwords do not match!';
        this.registerMessageColor = 'red';
        return;
      }
      try {
        const data = await GameAPI.register({
          username: this.register.username,
          email: this.register.email,
          password: this.register.password
        });
        this.registerMessage = data.message;
        this.registerMessageColor = 'green';
        setTimeout(() => (window.location = 'login.html'), 800);
      } catch (err) {
        this.registerMessage = err.message;
        this.registerMessageColor = 'red';
      }
    }
  }
}).mount('#register-app');