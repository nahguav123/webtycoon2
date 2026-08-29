import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./vueRouter";

import "../css/style.css";

import { requestRestoreSession } from "./socket/playerSocket.js";
import { storeWebsiteCreationOptions } from "./components/configLoader.js";

const app = createApp(App);
app.use(createPinia());

// Run configLoader and store values in websiteStore on inital game load.
await storeWebsiteCreationOptions();

await requestRestoreSession();

app.use(router);
app.mount("#app");
