<template>
    <div id="websites-app" class="websites-app">

        <!-- Game View -->
        <div class="websites-container">

            <!-- Sidebar -->
            <aside class="sidebar">
                <div class="sidebar-top">
                    <button class="sidebar-logout-button" @click="logout" title="Log Out">⚙️</button>
                </div>

                <div class="sidebar-profile" v-if="user">
                    <div class="sidebar-profile-img-container">
                        <img src="../images/stockavatar.jpg" />
                        <span class="sidebar-profile-level">Lv. {{ level }}</span>
                    </div>

                    <h3 class="sidebar-username-h3">{{ playerStore.username }}</h3>

                    <div class="sidebar-badges">
                        <span>${{ Math.floor(money).toLocaleString() }}</span>
                        <span>₩{{ webdollars }}</span>
                    </div>
                </div>

                <nav>
                    <RouterLink to="/websites" class="sidebar-menu" active-class="active">Websites <span class="sidebar-count">{{ websiteCount }}</span></RouterLink>
                    <a class="sidebar-menu" href="team.html">Team <span class="sidebar-count">{{ teamCount }}/6</span></a>
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
                        <div class="website-card" v-for="site in sites" :key="site.siteid" @click="openWebsite(site.siteid)">

                            <!-- CARD: HEADING -->
                            <div class="website-card-header">
                                <h3 class="website-card-h3">{{ site.domain + site.tld }}</h3>
                                <small>Version {{ site.version }}</small>
                            </div>

                            <!-- CARD: GRAPH -->
                            <div class="website-card-graph-container">
                                <canvas :id="'graph-' + site.siteid" class="website-card-graph"></canvas>
                            </div>

                            <!-- CARD: FOOTER / STATS -->
                            <div class="website-card-stats">

                                <!-- Visitors + Profit Row -->
                                <div class="stats-top">
                                    <span class="stat-main">
                                        {{ site.visitorsPerHour }}
                                        <span class="stat-circle stat-blue"></span>
                                    </span>
                                    <span class="stat-main">
                                        <span class="stat-circle stat-yellow"></span>
                                        ${{ site.profitPerHour }}
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

                        <p v-if="!sites.length" class="websites-empty-note">
                            No websites yet — <a href="createwebsite.html">create your first one</a>.
                        </p>
                    </div>
                </section>
            </main>

        </div>
    </div>
</template>



<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { Chart } from "chart.js/auto";

import { usePlayerStore } from "../js/stores/playerStore.js";
import { useWebsiteStore } from "../js/stores/websiteStore.js"; 
import { getWebsitesList } from "../js/socket/websiteSocket.js";

const router = useRouter();

const playerStore = usePlayerStore();
const websiteStore = useWebsiteStore();

const username = ref("");

// Page State
const filters = ["All", "Notifications"]; 
const activeFilter = ref("All"); 
const sortOption = ref("profit"); 
const charts = {};

const level = ref(1);
const money = ref(0);
const webdollars = ref(0);
const teamCount = ref(0);

// Get websites from Pinia store
const sites = computed(() => {

    return websiteStore.websites;

});

// Number of websites
const websiteCount = computed(() => {

    return websiteStore.websites.length;

});


async function loadWebsites() {
    if (!playerStore.token) return;
    try {
        const websitesData = await getWebsitesList(playerStore.userid);

        // Store websites in Pinia
        websiteStore.setWebsites(websitesData.websites || websitesData);

        // Wait for Vue to render the cards
        await nextTick();
        // Render graphs for each website
        websiteStore.websites.forEach(site => renderGraph(site));

    } catch (error) {
        console.error("Failed to load websites:", error);
    }
}

//Need something for realtime website updates - socket.io all sites
// Also need something for sorting/filter websites
//Also look into nexttick for relevant stuff.


// Page Actions
function setFilter(filter) { 
    activeFilter.value = filter; 
} 

function openWebsite(siteid) { 
    router.push(`/website/${siteid}`); 
} 

function createWebsite() { 
    router.push("/create-website"); 
} 

function logout() { 
    socket.disconnect(); 
    websiteStore.clearWebsites();
    websiteStore.clearWebsite();
    playerStore.clearPlayer(); 
    localStorage.removeItem("token"); 
    router.push("/"); 
}


// Lifecycle
onMounted(async () => { 
    // Make sure player is logged in 
    if (!playerStore.isLoggedIn) { 
        router.push("/welcome"); 
        return; 
    } 
    
    await loadWebsites(); 
    
    socket.on( "websiteUpdateBatch", handleWebsiteUpdateBatch );
}); 

onBeforeUnmount(() => { 
    socket.off( "websiteUpdateBatch", handleWebsiteUpdateBatch ); 
    Object.values(charts).forEach(chart => { chart.destroy(); }); 
});


// ========================================
// REALTIME WEBSITE UPDATES
// ========================================

function handleWebsiteUpdateBatch(data) {

    if (!data) {
        return;
    }


    // If the server sends an entire website list
    if (Array.isArray(data.websites)) {

        websiteStore.setWebsites(
            data.websites
        );

    }


    // Re-render charts after update
    //nextTick(() => {

    //    websiteStore.websites.forEach(site => {

    //        renderGraph(site);

    //    });

    //});
}

</script>