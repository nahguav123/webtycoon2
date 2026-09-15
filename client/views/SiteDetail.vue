<!--
PURPOSE: Single Website management page.

INPUT: Player and website stores; user actions, siteid.
OUTPUT: Displays player and selected website information with interactive controls.
FUNCTIONS: logout(), onMounted().
DATA: Filters, sorting, playerStore, websiteStore.
-->


<template>
    <div id="site-detail-app" class="site-detail-app">

        <!-- Game View -->
        <div class="site-detail-container">

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
                    <RouterLink to="/websites" class="sidebar-menu" active-class="active">Websites <span class="sidebar-count">{{ playerStore.websiteCount }}</span></RouterLink>
                    <a class="sidebar-menu" href="team.html">Team <span class="sidebar-count">{{ playerStore.teamCount }}/6</span></a>
                    <a class="sidebar-menu" href="statistics.html">Statistics</a>
                    <a class="sidebar-menu" href="quests.html">Quests</a>
                    <a class="sidebar-menu" href="ratings.html">Ratings</a>
                    <a class="sidebar-menu" href="holdings.html">Holdings</a>
                </nav>
            </aside>

            <!-- Main -->
            <main class="site-detail-main">

                <!-- Top Bar -->
				<header class="site-detail-topbar">
					<div class="site-detail-topbar-buttons">
						<RouterLink to="/websites" class="site-detail-topbar-back-button">Websites</RouterLink>
						<h2 class="site-detail-topbar-h2" v-if="website"> {{ website.domain }}{{ website.tld }}</h2>
					</div>
				</header>

                <!-- Site Detail Section-->
                <section class="site-detail-section">

                    <!-- Site Dashboard Card -->
                    <div class="site-detail-dashboard-card" v-if="website">

                        <!-- Site Stats Bar -->
                        <div class="site-detail-card-stats-bar">
                            <div class="site-detail-card-version">Version {{ website.version }}</div>
                            <div class="site-detail-card-stats-colour">
                                <div class="site-detail-stat-red">{{Math.round(website.visitorsPerHour).toLocaleString()}}/hr visitors</div>
                                <div class="site-detail-stat-blue">${{Number(website.profitPerHour).toLocaleString()}}/hr profit</div>
                            </div>
                        </div>

                        <!-- Site Dashboard Header -->
                        <div class="site-detail-dashboard-card-header">
                            <h4>{{ website.domain }}{{ website.tld }}</h4>
                            <p>{{ website.siteType }} site</p>
                        </div>

                        <!-- 24-Hour Performance Graph -->
                        <div class="site-detail-graph-container">
                            <div>
                                <h4>24-Hour Performance (Past, Current & Projected)</h4>
                                <p>Live website values currently provided by the server.</p>
                                <canvas id="site-detail-graph" class="site-detail-graph"></canvas>
                            </div>
                        </div>

                        <!-- Site Comments Section -->
                        <div class="site-detail-comments-box">
                            <button class="site-detail-show-comments-button" @click="commentsPanel = !commentsPanel">{{ commentsPanel ? "Hide comments" : "Show comments" }}</button>
                            <div v-if="commentsPanel" class="site-detail-show-comments-panel">Comments will be available here once comment data is added to the server.</div>
                        </div>

                        <!-- Site Hosting Section -->
                        <div>
                            <p>Hosting Option: <strong>{{ website.hostingOption }}</strong> (Visitor Limit: {{ hostingPlans[website.hostingOption]?.visitorLimit }} visitors)</p>
                            <p>Time remaining: {{ formatMinutes(website.hostingRemainingMs) }}</p>
                            <div class="site-detail-hosting-buttons">
                                <!-- Pay current hosting -->
                                <button @click="payHostingCurrent">Pay Hosting</button>
                                <!-- Change hosting -->
                                <button @click="changeHostingButton">Change Hosting</button>
                            </div>

                            <!-- Dropdown appears when changing hosting -->
                            <div v-if="showChangeHosting" class="site-detail-hosting-dropdown">
                                <select v-model="selectedPlan">
                                    <option v-for="(plan, name) in hostingPlans" :value="name" :key="name">
                                        {{ name }} — ${{ plan.cost }} — {{ plan.hours }}h — up to {{ plan.visitorLimit }} visitors
                                    </option>
                                </select>
                                <button @click="changeHostingPlan">Confirm Change</button>
                            </div>
                        </div>

                        <!-- Site Domain Section -->
                        <div>
                            <p>Domain: <strong>{{ website.domain }}{{ website.tld }}</strong></p>
                            <p>Time remaining: {{ formatMinutes(website.domainRemainingMs) }}</p>
                            <div class="site-detail-domain-buttons">
                                <!-- Pay current domain -->
                                <button @click="renewDomainCurrent">Pay Domain</button>
                                <!-- Change domain -->
                                <button @click="changeDomainButton">Change Domain</button>
                            </div>

                            <!-- Dropdown appears when changing domain/tld -->
                            <div v-if="showChangeDomain" class="site-detail-domain-dropdown">
                                <input type="text" v-model="newDomainName" placeholder="Domain name" class="site-detail-domain-input"/>
                                <select v-model="newTld"> 
                                    <option v-for="(opt, tld) in tldOptions" :value="tld" :key="tld">{{ tld }} — ${{ opt.cost }}</option>
                                </select>
                                <p class="site-detail-domain-preview">Preview: <strong>{{ newDomainName }}{{ newTld }}</strong></p>
                                <button @click="changeDomainConfirm">Confirm Change</button>
                            </div>
                        </div>

                        <!-- Message Display -->
                        <p v-if="message" class="site-detail-change-hosting-message">{{ message }}</p>

                        <!-- Active Effects (placeholder) -->
                        <div class="site-detail-effects-section">
                            <h4>Active Effects</h4>
                            <div class="site-detail-effects-list">
                                <div class="site-detail-effect-chip">N/A</div>
                                <button class="site-detail-effect-add-button">+</button>
                            </div>
                        </div>

                        <!-- Tasks Section -->
                        <div class="site-detail-tasks-section">
                            <h4>Development Progress</h4>

                            <!-- Task Card -->
                            <div class="site-detail-task-card">
                                <!-- Task Bars -->
                                <div v-for="track in ['design', 'frontend', 'backend']" :key="track" class="site-detail-task-bar">
                                    <div class="site-detail-task-left">
                                        <div class="site-detail-task-label">
                                            <span class="site-detail-task-name">{{ getWorkerName(track) }}</span>
                                            <span v-if="getEffectiveRate(track) > 0" class="site-detail-task-rate">+{{ getEffectiveRate(track).toFixed(1) }}/hr</span>
                                        </div>
                                        <button class="site-detail-task-assign" @click="toggleAssign(track)" :title="isAssigned(track) ? 'Unassign worker' : 'Assign worker'">{{ isAssigned(track) ? '−' : '+' }}</button>
                                    </div>

                                    <div class="site-detail-task-bar-bg">
                                        <div class="site-detail-task-bar-fill" :class="track" :style="{ width: progressWidth(track) + '%' }"></div>
                                        <span class="bar-number left">{{ Math.floor(getTrack(track).points) }}</span>
                                        <span class="bar-number right">{{ getTrack(track).target }}</span>
                                    </div>
                                </div>

                                <!-- Overall Progress -->
                                <div class="site-detail-task-progress">
                                    <span>Overall Progress</span>
                                    <div class="site-detail-task-progress-bg">
                                        <div class="site-detail-task-progress-fill" :style="{ width: `${Number(website.overallProgress || 0)}%` }"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Publish Button -->
                            <button class="site-detail-publish-button" :disabled="!website.readyToPublish" @click="publishVersion">Publish Version {{ Number(website.version) + 1 }}</button>
                        </div>
                        

                        <!-- Content Creation (placeholder) -->
                        <div class="site-detail-content-section">
                            <h4>Content Creation</h4>
                            <p style="color:#6b7c87; font-size:13px;">Coming soon.</p>
                        </div>

                        <!-- Site Advertising -->
                        <div class="site-detail-advertising-section">
                            <h4>Advertising</h4>
                            <div class="site-detail-ad-grid">
                                <div v-for="option in advertisingOptions" :key="option.id" class="site-detail-ad-box">
                                    <div class="site-detail-ad-box-top">
                                        <span class="site-detail-ad-label">{{ option.name }}</span>
                                        <label class="site-detail-ad-toggle">
                                            <input type="checkbox" v-model="option.enabled" @change="toggleAdvertising(option)" />
                                            <span class="site-detail-ad-slider"></span>
                                        </label>
                                    </div>
                                    <p class="site-detail-ad-profit">CPM: <strong>${{ option.profit }}</strong></p>
                                    <p class="site-detail-ad-impressions">{{ option.adImpressions }} impressions per hour</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Loading / Not Found States -->
                    <div v-else-if="loading" class="site-detail-loading">Loading site...</div>
                    <div v-else class="site-detail-not-found">
                        <h3>Website not found</h3>
                        <p>{{ message || "The requested website could not be loaded." }}</p>
                        <RouterLink to="/websites" class="site-detail-topbar-back-button">Back to Websites</RouterLink>
                    </div>
                </section>
            </main>
        </div>
    </div>
</template>


<script setup>
// Tidy all this up later
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

import { usePlayerStore } from "../js/stores/playerStore.js";
import { useWebsiteStore } from "../js/stores/websiteStore.js"; 

import { requestWebsites, requestWebsite, websiteAction } from "../js/socket/websiteSocket.js";
import { logoutPlayer } from "../js/socket/playerSocket.js";

const router = useRouter();
const route = useRoute();

const playerStore = usePlayerStore();
const websiteStore = useWebsiteStore();

const tracks = ["design", "frontend", "backend"];
const loading = ref(true);
const message = ref("");
const commentsPanel = ref(false);
const showChangeHosting = ref(false);
const showChangeDomain = ref(false);
const selectedPlan = ref(null);
const newDomainName = ref("");
const newTld = ref(".free");

const hostingPlans = computed(() => websiteStore.hostingPlans || {});
const tldOptions = computed(() => websiteStore.tldOptions || {});
const website = computed(() => websiteStore.currentWebsite);
const advertisingOptions = computed(() => website.value?.advertising || []);

// UTILITY FUNCTIONS 
// Format milliseconds to human-readable duration string
function formatMinutes(ms) {
    // TODO: Implement using GameUtil.formatDuration when available
    if (!ms || ms <= 0) return "Expired";

    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function getWorkerName(track) {
    return website.value?.dev?.[track]?.workerName || ({ design: "UI Designer", frontend: "Frontend Dev", backend: "Backend Dev" }[track] || track);
}

function getTrack(track) {
    return website.value?.dev?.[track] || { points: 0, target: 1, ratePerHour: 0, effectiveRatePerHour: 0, assigned: false };
}

function getEffectiveRate(track) {
    return Number(getTrack(track).effectiveRatePerHour || getTrack(track).ratePerHour || 0);
}

function isAssigned(track) {
    return Boolean(getTrack(track).assigned || getEffectiveRate(track) > 0);
}

function progressWidth(track) {
    const item = getTrack(track);
    return Math.min(100, (Number(item.points) / Math.max(1, Number(item.target))) * 100);
}

function logout() {
    logoutPlayer();
    router.push("/");
}

function changeHostingButton() {
    showChangeHosting.value = !showChangeHosting.value;
    if (showChangeHosting.value) selectedPlan.value = website.value?.hostingOption || websiteStore.defaultHostingPlan;
}

function changeDomainButton() {
    showChangeDomain.value = !showChangeDomain.value;
    if (showChangeDomain.value && website.value) {
        newDomainName.value = website.value.domain;
        newTld.value = website.value.tld;
    }
}

async function runAction(event, data, successMessage) {
    try {
        message.value = "";
        await websiteAction(event, data);
        message.value = successMessage;
        await requestWebsite(route.params.siteid);
    } catch (error) {
        message.value = error.message || "Action failed.";
    }
}

async function payHostingCurrent() {
    if (!website.value) return;
    await runAction("websiteHosting:request", { siteid: website.value.siteid, plan: website.value.hostingOption }, "Hosting payment processed!");
}

async function changeHostingPlan() {
    if (!selectedPlan.value) return;
    await runAction("websiteHosting:request", { siteid: website.value.siteid, plan: selectedPlan.value }, "Hosting plan changed!");
    showChangeHosting.value = false;
}

async function renewDomainCurrent() {
    if (!website.value) return;
    await runAction("websiteDomain:request", { siteid: website.value.siteid, domain: website.value.domain, tld: website.value.tld }, "Domain renewed!");
}

async function changeDomainConfirm() {
    if (!website.value || !newDomainName.value || !newTld.value) {
        message.value = "Please enter a domain name and select a TLD";
        return;
    }
    await runAction("websiteDomain:request", { siteid: website.value.siteid, domain: newDomainName.value, tld: newTld.value }, "Domain changed successfully!");
    showChangeDomain.value = false;
}

async function toggleAssign(track) {
    if (!website.value) return;
    await runAction("websiteDevAssignment:request", { siteid: website.value.siteid, track, assigned: !isAssigned(track) }, `${getWorkerName(track)} ${isAssigned(track) ? "unassigned" : "assigned"}`);
}

async function publishVersion() {
    if (!website.value) return;
    await runAction("websitePublish:request", { siteid: website.value.siteid }, "Version published successfully!");
}

async function toggleAdvertising(option) {
    if (!website.value) return;
    try {
        await websiteAction("websiteAdvertising:request", { siteid: website.value.siteid, optionId: option.id, enabled: option.enabled });
        await requestWebsite(route.params.siteid);
        message.value = `${option.name} ${option.enabled ? "enabled" : "disabled"}`;
    } catch (error) {
        message.value = error.message || "Failed to update advertising";
    }
}

onMounted(async () => {
    try {
        loading.value = true;
        await requestWebsite(route.params.siteid);
        if (website.value) {
            selectedPlan.value = website.value.hostingOption;
            newDomainName.value = website.value.domain;
            newTld.value = website.value.tld;
        }
    } catch (error) {
        console.error("Failed to load website:", error);
        message.value = error.message || "Failed to load website data";
        websiteStore.currentWebsite = null;
    } finally {
        loading.value = false;
    }
});

</script>