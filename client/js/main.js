import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./vueRouter";

import "../css/style.css";

import { restoreSession } from "./socket/playerSocket.js";
import { usePlayerStore } from "./stores/playerStore.js";

const app = createApp(App);

app.use(createPinia());

// Remove maybe?
const playerStore = usePlayerStore();

await restoreSession();

app.use(router);

app.mount("#app");
