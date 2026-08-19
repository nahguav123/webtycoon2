//To do list:

// Optimise code as it is and stress test for errors and bugs
// Refactor and optimise code after testing
// Once ready:
// Drop in modules for all the other game components.

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./vueRouter";

import "../css/style.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
