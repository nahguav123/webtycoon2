/*
PURPOSE: Controls client-side page navigation.

INPUT: Requested route and login state.
OUTPUT: Displays/redirects to the correct page.
FUNCTIONS: Navigation guard.
DATA: Application routes.
*/


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


// Router authentication guard
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