<!--
PURPOSE: Main landing page.

INPUT: User button actions.
OUTPUT: Guest account, login or registration navigation.
FUNCTIONS: playAsGuest(), goToLogin(), goToRegister().
DATA: errorMessage.
-->


<template>
  <div class="welcome-app">
    <div class="welcome-container">
      <h1 class="welcome-h1">Web Tycoon</h1>

      <div class="welcome-tagline">
        Build your startup. Grow your empire. Rule the web.
      </div>

      <div class="welcome-button-row-top">
        <button
          class="welcome-button-play-now"
          @click="playAsGuest"
        >
          Play Now (No Save)
        </button>
      </div>

      <div class="welcome-button-row">
        <button
          class="welcome-button"
          @click="goToLogin"
        >
          Log In
        </button>

        <button
          class="welcome-button"
          @click="goToRegister"
        >
          Register
        </button>
      </div>

      <p v-if="errorMessage" class="welcome-error">{{ errorMessage }}</p>

      <div class="welcome-footer-note">
        Inspired by the original webtycoon game.
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import { requestCreateGuest } from "../js/socket/playerSocket.js";

const router = useRouter();

const errorMessage = ref("");


async function playAsGuest() {
  errorMessage.value = "";

  try {
    const player = await requestCreateGuest();

    console.log(
      "Successfully created guest account",
      "Player:",
      player
    );

    router.push("/websites");

  } catch (error) {
    console.error("Guest creation failed:", error);
    errorMessage.value = error.message || "Could not start a guest game.";
  }
}

function goToLogin() {
  router.push("/login");
}

function goToRegister() {
  router.push("/register");
}
</script>