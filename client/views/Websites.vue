<template>
    <div id="websites-app" class="websites-app">

        <!-- Game View -->
        <div class="websites-container">

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
            <main class="websites-main">

                <!-- Top Bar -->
                <header class="websites-topbar">
                    <div class="websites-filters">

                        <!-- Filter Buttons -->
                        <button
                            v-for="filter in filters"
                            :key="filter"
                            :class="{ active: activeFilter === filter }"
                            @click="setFilter(filter)"
                            class="websites-filter-button"
                        >
                            {{ filter }}
                        </button>

                        <!-- Sort By Dropdown -->
                        <select v-model="sortOption" class="websites-sort-option">
                            <option value="profit">By profit</option>
                            <option value="visitors">By visitors</option>
                            <option value="date">By creation date</option>
                        </select>
                    </div>

                    <div class="websites-topbar-right">
                        <nav>
                            <a class="websites-create-button" href="createwebsite.html">Create a site</a>
                        </nav>
                    </div>
                </header>

                <!-- Website Cards Container-->
                <section class="websites-cards-container">

                    <!-- SINGLE CARD -->
                    <div class="websites-cards">
                        <div class="website-card" v-for="website in websiteStore.websites" :key="website.siteid" @click="openWebsite(website.siteid)">

                            <!-- CARD: HEADING -->
                            <div class="website-card-header">
                                <h3 class="website-card-h3">{{ website.domain + website.tld }}</h3>
                                <small>Version {{ website.version }}</small>
                            </div>

                            <!-- CARD: GRAPH -->
                            <div class="website-card-graph-container">
                                <canvas :id="`graph-${website.siteid}`" class="website-card-graph"></canvas>
                            </div>

                            <!-- CARD: FOOTER / STATS -->
                            <div class="website-card-stats">

                                <!-- Visitors + Profit Row -->
                                <div class="stats-top">
                                    <span class="stat-main">
                                        {{ website.visitorsPerHour }}
                                        <span class="stat-circle stat-blue"></span>
                                    </span>
                                    <span class="stat-main">
                                        <span class="stat-circle stat-yellow"></span>
                                        ${{ website.profitPerHour }}
                                    </span>
                                </div>

                                <!-- Detail Row -->
                                <div class="stats-bottom">
                                    <span class="stat-label">visitors per hour</span>
                                    <span class="stat-label">profit per hour</span>
                                </div>
                            </div>

                            <!-- CARD: BARS -->
                            <div class="website-card-bars">
                                <div class="website-card-bar-red" :style="{ width: 25 + '%' }"></div>
                                <div class="website-card-bar-blue" :style="{ width: 25 + '%' }"></div>
                                <div class="website-card-bar-purple" :style="{ width: 25 + '%' }"></div>
                                <div class="website-card-bar-green" :style="{ width: 25 + '%' }"></div>
                            </div>

                        </div>

                        <p v-if="websiteStore.websites.length === 0" class="websites-empty-note">
                            No websites yet — <a href="createwebsite.html">create your first one</a>.
                        </p>
                    </div>
                </section>
            </main>

        </div>
    </div>
</template>



<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

import { usePlayerStore } from "../js/stores/playerStore.js";
import { useWebsiteStore } from "../js/stores/websiteStore.js"; 

import { requestWebsites } from "../js/socket/websiteSocket";

const router = useRouter();

const playerStore = usePlayerStore();
const websiteStore = useWebsiteStore();


// Page State
const filters = ["All", "Notifications"]; 
const activeFilter = ref("All"); 
const sortOption = ref("profit"); 

function logout() {
    playerStore.logout();
    router.push("/");
}

// Lifecycle
onMounted(async () => {
    requestWebsites(playerStore.userid);

    //if (!playerStore.isLoggedIn) {
    //    router.push("/");
    //    return;
    //}

});

</script>