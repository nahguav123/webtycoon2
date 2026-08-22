import { defineStore } from "pinia";


export const useWebsiteStore = defineStore("website", {

    state: () => ({
        websites: [],
    }),


    actions: {
        setWebsites(websites) {
            this.websites = websites;
        },

        addWebsite(website) {
            this.websites.push(website);
        },

        updateWebsite(updatedWebsite) {
            const index = this.websites.findIndex(
                website => website.siteid === updatedWebsite.siteid
            );

            if (index !== -1) {
                this.websites[index] = updatedWebsite;
            }
        },

        clearWebsites() {
            this.websites = [];
        },
    }

});