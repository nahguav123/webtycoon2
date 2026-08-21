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

      <div class="welcome-footer-note">
        Inspired by the original webtycoon game.
      </div>
    </div>
  </div>
</template>


<script setup>
import { useRouter } from "vue-router";

import { usePlayerStore } from "../js/stores/playerStore.js";
import { createGuest } from "../js/socket/playerSocket.js";

const router = useRouter();

const playerStore = usePlayerStore();

async function playAsGuest() {
  try {
    const player = await createGuest();

    console.log(
      "Successfully created guest account",
      "Player:",
      player
    );

    router.push("/websites");

  } catch (error) {
    console.error("Guest creation failed:", error);
  }
}

function goToLogin() {
  router.push("/login");
}

function goToRegister() {
  router.push("/register");
}
</script>