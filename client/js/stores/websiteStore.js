/*
PURPOSE: Stores the player's websites and game config options.

INPUT: Website data from server.
OUTPUT: Reactive website list.
FUNCTIONS: clearWebsites().
DATA: websites[], tldOptions and siteTypes.
*/


import { defineStore } from "pinia";


export const useWebsiteStore = defineStore("website", {

    state: () => ({
        websites: [],
        currentWebsite: null,
		tldOptions: {},
		defaultTld: {},
		siteTypes: {},
		defaultSiteType: {},
        hostingPlans: {},
        defaultHostingPlan: null,
    }),
	

    actions: {

        // Resets the store
        clearWebsites() {
            this.$reset();
        },
        setCurrentWebsite(website) {
            this.currentWebsite = website || null;
        },
    }

});