/*
PURPOSE: Stores the player's websites.

INPUT: Website data from server.
OUTPUT: Reactive website list.
FUNCTIONS: setWebsites(), updateWebsite(), clearWebsites().
DATA: websites[].
*/


import { defineStore } from "pinia";


export const useWebsiteStore = defineStore("website", {

    state: () => ({
        websites: [],
    }),


    actions: {
        setWebsites(websites) {
            this.websites = websites;
        },

        updateWebsite(updatedWebsite) {
            const index = this.websites.findIndex(
                website => website.siteid === updatedWebsite.siteid
            );

            if (index !== -1) {
                this.websites[index] = updatedWebsite;
            }
        },

        // Resets the store
        clearWebsites() {
            this.$reset();
        },
    }

});