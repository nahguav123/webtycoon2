<template>
  <div class="register-app">
    <form
      class="register-form"
      @submit.prevent="submitRegister"
    >
      <h1 class="register-h1">Register</h1>

      <input
        v-model="username"
        placeholder="Username"
        class="register-field"
        type="text"
        required
      >

      <input
        v-model="email"
        placeholder="Email"
        class="register-field"
        type="email"
        required
      >

      <input
        v-model="password"
        placeholder="Password"
        class="register-field"
        type="password"
        required
      >

      <input
        v-model="confirmPassword"
        placeholder="Confirm Password"
        class="register-field"
        type="password"
        required
      >

      <button
        class="register-button"
        type="submit"
        :disabled="isRegistering"
      >
        {{ isRegistering ? "Registering..." : "Register" }}
      </button>

      <div
        class="register-form-message"
        :style="{ color: messageColor }"
      >
        {{ message }}
      </div>

      <div class="register-footer-note">
        Already have an account?

        <RouterLink to="/login">
          Log in here
        </RouterLink>.
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import { usePlayerStore } from "../js/stores/playerStore.js";
import { createPlayer as createPlayerSocket } from "../js/socket/playerSocket.js";

const router = useRouter();

const playerStore = usePlayerStore();

const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const message = ref("");
const messageColor = ref("");
const isRegistering = ref(false);


async function submitRegister() {

  // Stops user clicking Register multiple times.
  if (isRegistering.value) {
    return;
  }

  message.value = "";

  // Check password
  if (!password.value) {
    message.value = "Please enter a password.";
    messageColor.value = "red";
    return;
  }

  // Check password match
  if (password.value !== confirmPassword.value) {
    message.value = "Passwords do not match!";
    messageColor.value = "red";
    return;
  }

  // Check username
  if (!username.value.trim()) {
    message.value = "Please enter a username.";
    messageColor.value = "red";
    return;
  }

  // Check email
  if (!email.value.trim()) {
    message.value = "Please enter an email address.";
    messageColor.value = "red";
    return;
  }

  try {

    isRegistering.value = true;

    // Put registration information into Pinia
    playerStore.setPlayer({
      username: username.value.trim(),
      email: email.value.trim(),
      password: password.value
    });

    // createPlayerSocket() gets the data from Pinia
    const player = await createPlayerSocket();

    console.log(
      "Successfully created player account:",
      player
    );

    // Player has been created by the server
    message.value = "Player created successfully!";
    messageColor.value = "green";

    // Navigate using Vue Router
    setTimeout(() => {
      router.push("/login");
    }, 800);

  } catch (error) {

    console.error("Player creation failed:", error);

    message.value =
      error.message || "Failed to create player account.";

    messageColor.value = "red";

  } finally {

    isRegistering.value = false;

  }
}
</script>