import { defineStore } from "pinia";


export const useWebsiteStore = defineStore("website", {

    state: () => ({
        websites: [],

        siteid: null,
        userid: null,
        domain: "",
        tld: "",
        createdAt: null,
        version: null,
        visitorsPerHour: null,
        profitPerHour: null
    }),


    actions: {

        // Store a list of websites with data
        setWebsites(data) {

            this.websites = data;

        },


        // Store a single website with data
        setWebsite(data) {

            this.siteid = data.siteid;
            this.userid = data.userid;
            this.domain = data.domain;
            this.tld = data.tld;
            this.createdAt = data.createdAt;
            this.version = data.version;
            this.visitorsPerHour = data.visitorsPerHour;
            this.profitPerHour = data.profitPerHour;

        },


        // Clear the current website
        clearWebsite() {

            this.siteid = null;
            this.userid = null;
            this.domain = "";
            this.tld = "";
            this.createdAt = null;
            this.version = null;
            this.visitorsPerHour = null;
            this.profitPerHour = null;

        },


        // Clear all stored websites
        clearWebsites() {

            this.websites = [];

        }

    }

});