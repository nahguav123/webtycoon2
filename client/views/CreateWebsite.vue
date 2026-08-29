<template>
	<div id="create-website-app" class="create-website-app">

		<!-- Game View -->
		<div class="create-website-container">

			<!-- Sidebar -->
			<aside class="sidebar">
				<div class="sidebar-top">
					<button class="sidebar-logout-button" @click="logout" title="Log Out">⚙️</button>
				</div>

				<div class="sidebar-profile" v-if="playerStore.isLoggedIn">
					<div class="sidebar-profile-img-container">
						<img src="../images/stockavatar.jpg" alt="Profile" />
						<span class="sidebar-profile-level">Lv. {{ playerStore.level }}</span>
					</div>

					<h3 class="sidebar-username-h3">{{ playerStore.username }}</h3>

					<div class="sidebar-badges">
						<span>${{ Math.floor(playerStore.money).toLocaleString() }}</span>
						<span>₩{{ playerStore.webdollars }}</span>
					</div>
				</div>

				<nav>
					<RouterLink to="/websites" class="sidebar-menu" active-class="active">Websites <span
							class="sidebar-count">{{
								playerStore.websiteCount }}</span></RouterLink>
					<a class="sidebar-menu" href="team.html">Team <span class="sidebar-count">{{ playerStore.teamCount
					}}/6</span></a>
					<a class="sidebar-menu" href="statistics.html">Statistics</a>
					<a class="sidebar-menu" href="quests.html">Quests</a>
					<a class="sidebar-menu" href="ratings.html">Ratings</a>
					<a class="sidebar-menu" href="holdings.html">Holdings</a>
				</nav>
			</aside>

			<!-- Main -->
			<main class="create-website-main">

				<!-- Top Bar -->
				<header class="create-website-topbar">
					<div class="create-website-topbar-buttons">
						<RouterLink to="/websites" class="create-website-topbar-back-button">Websites</RouterLink>
						<h2 class="create-website-topbar-h2"> > Creating a site</h2>
					</div>
				</header>

				<!-- Create Website Section-->
				<section class="create-website-section">

					<!-- Create Website Form -->
					<form @submit.prevent="createWebsite" class="create-website-form">

						<!-- Row: Domain input + Preview -->
						<div class="create-website-row">

							<!-- Domain + TLD -->
							<div class="create-website-domain-group">
								<label class="create-website-label">Domain name</label>

								<div class="create-website-domain-wrapper">
									<input class="create-website-input" v-model="domainName" placeholder="yourdomain" required/>

									<select class="create-website-select" v-model="tld" required>
										<option v-for="(opt, name) in websiteStore.tldOptions" :value="name" :key="name">
											{{ name }} — ${{ opt.cost }}
										</option>
									</select>
								</div>

								<label class="create-website-info-label">
									Choose a domain name for your site. The
									name must be between 3 and 16 characters.
									You can use Latin letters, numbers, and hyphens.
								</label>
							</div>

							<!-- Live Preview -->
							<div class="create-website-preview">
								<p class="preview-url">
									{{ (domainName || "yourdomain") + tld }}
								</p>

								<div class="preview-card">
									<h3>{{ domainName || "Your Website" }}</h3>
									<p>example-page.html</p>
								</div>
							</div>
						</div>

						<!-- Type Section -->
						<h3 class="create-website-type-heading">Type</h3>

						<div class="create-website-type-grid">
							<div v-for="(type, key) in websiteStore.siteTypes" :key="key" class="type-card"
								:class="{ active: siteType === key }" @click="siteType = key">
								<h4>{{ type.name }}</h4>
								<p>{{ type.description }}</p>
							</div>
						</div>

						<!-- Submit -->
						<button class="create-website-button" type="submit" :disabled="isCreating">{{ isCreating ? "Creating..." : "Create Website" }}</button>

					</form>

					<p v-if="message">{{ message }}</p>

				</section>
			</main>
		</div>
	</div>
</template>



<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

import { usePlayerStore } from "../js/stores/playerStore.js";
import { useWebsiteStore } from "../js/stores/websiteStore.js"; 

import { requestCreateWebsite } from "../js/socket/websiteSocket.js";
import { logoutPlayer } from "../js/socket/playerSocket.js";

const router = useRouter();

const playerStore = usePlayerStore();
const websiteStore = useWebsiteStore();


// Form State
const domainName = ref(""); 
const tld = ref(websiteStore.defaultTld);
const siteType = ref(websiteStore.defaultSiteType); 

const message = ref(""); 
const messageColor = ref(""); 
const isCreating = ref(false);


// Website creation function
async function createWebsite() { 
	// Stops user clicking create multipe times.
	if (isCreating.value) { 
		return; 
	} 
	
	message.value = ""; 
	const domain = domainName.value.trim(); 

	try { 
		isCreating.value = true; 

		// Attempts to create new website
		await requestCreateWebsite({ 
			domain, 
			tld: tld.value, 
			siteType: siteType.value 
		}); 
		
		message.value = "Website created successfully!"; 
		messageColor.value = "green"; 

		// Navigate back to website list using Vue Router 
		setTimeout(() => { router.push("/websites"); }, 500); 

	} catch (error) { 
		console.error("Website creation failed:", error); 
		message.value = error.message || "Failed to create website."; 
		messageColor.value = "red"; 
	} finally { 
		isCreating.value = false; 
	} 
}


function logout() {
    logoutPlayer();
    router.push("/");
}

// Lifecycle
onMounted(async () => {
    try {

    } catch (error) {

    } finally {

    }
});

</script>