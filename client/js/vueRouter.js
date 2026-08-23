import { createRouter, createWebHistory } from "vue-router";

import Welcome from "../views/Welcome.vue";
import Register from "../views/Register.vue";
import Login from "../views/Login.vue";
import Websites from "../views/Websites.vue";

import { usePlayerStore } from "./stores/playerStore.js";

const routes = [
    {
        path: "/",
        component: Welcome
    },
    {
        path: "/register",
        component: Register
    },
    {
        path: "/login",
        component: Login
    },
    {
        path: "/websites",
        component: Websites,
        meta: {
            requiresAuth: true
        }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});


// ROUTER AUTH GUARD
router.beforeEach(
    (to) => {

        const playerStore =
            usePlayerStore();

        if (
            to.meta.requiresAuth &&
            !playerStore.isLoggedIn
        ) {

            return "/login";
        }

        return true;
    }
);


export default router;