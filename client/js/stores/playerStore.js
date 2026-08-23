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

        isLoading: false,
        sessionRestored: false
    }),

    getters: {
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


        //In future for removing player from local store.
        logout() {
            this.$reset();
            localStorage.removeItem("token");
            socket.disconnect();
        },
        clearPlayer() {
            this.$reset();
            localStorage.removeItem("token");
            socket.disconnect();
        }

    }
});