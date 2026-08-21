<template>
    <div id="login-app" class="login-app">
        <form class="login-form" @submit.prevent="submitLogin">
            <h1 class="login-h1">Log In</h1>

            <input v-model="username" placeholder="Username" class="login-field" type="text" required>
            <input v-model="password" placeholder="Password" class="login-field" type="password" required>

            <button class="login-button" type="submit" :disabled="isLoggingIn">{{ isLoggingIn ? "Logging in..." : "Log In" }}</button>
            <div class="login-form-message" :style="{color: messageColor}">{{ message }}</div>
            <div class="login-footer-note"> Don't have an account? <RouterLink to="/register">Register here</RouterLink></div>
        </form>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import { usePlayerStore } from "../js/fileRouter.js";
import { loginPlayer as loginPlayerSocket } from "../js/fileRouter.js";

const router = useRouter();
const playerStore = usePlayerStore();

const username = ref("");
const password = ref("");

const message = ref("");
const messageColor = ref("");
const isLoggingIn = ref(false);

async function submitLogin() {

    // Stops user clicking Register multiple times.
    if (isLoggingIn.value) {
        return;
    }

    message.value = "";

    // Check password
    if (!password.value) {
        message.value = "Please enter a password.";
        messageColor.value = "red";
        return;
    }

    // Check username
    if (!username.value.trim()) {
        message.value = "Please enter a username.";
        messageColor.value = "red";
        return;
    }

    try {

        isLoggingIn.value = true;

        // Put registration information into Pinia
        playerStore.setPlayer({
            username: username.value.trim(),
            password: password.value
        });

        // loginPlayerSocket() gets the data from Pinia
        const player = await loginPlayerSocket();

        console.log("Successfully logged in player account:", player);

        // Player login authorised by the server
        message.value = "Player logged in successfully!";
        messageColor.value = "green";

        // Navigate using Vue Router
        setTimeout(() => {router.push("/websites");}, 800);

    } catch (error) {

        console.error("Player login failed:", error);

        message.value = error.message || "Failed to login player account.";
        messageColor.value = "red";

    } finally {

        isLoggingIn.value = false;
    }
}

</script>