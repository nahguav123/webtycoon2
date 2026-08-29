/*
PURPOSE: Stores the current player's data.

INPUT: Player data from server.
OUTPUT: Reactive player data.
FUNCTIONS: setPlayer(), clearPlayer().
DATA: userid, username, email, money, webdollars, level, counts.
*/


import { defineStore } from "pinia";


export const usePlayerStore = defineStore("player", {

    state: () => ({
        userid: null,
        username: "",
        email: "",
        createdAt: null,

        level: 1,
        money: 0,
        webdollars: 0,
        websiteCount: 0,
        teamCount: 0,
    }),

    getters: {
        // Used in vueRouter.js to check if user logged in
        isLoggedIn: (state) => {
            return !!state.userid;
        }
    },

    actions: {

        setPlayer(data) {

            this.userid = data.userid;
            this.username = data.username;
            this.email = data.email;
            this.createdAt = data.createdAt;
            
            this.level = data.level;
            this.money = data.money;
            this.webdollars = data.webdollars;
            this.websiteCount = data.websiteCount;
            this.teamCount = data.teamCount;
        },


        // Only resets the store. Token removal and socket disconnect are
        // handled by logoutPlayer() in socket/playerSocket.js
        clearPlayer() {
            this.$reset();
        }

    }
});