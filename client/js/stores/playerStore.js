import { defineStore } from "pinia";


export const usePlayerStore = defineStore("player", {

    state: () => ({
        userid: null,
        username: "",
        password: "",
        email: "",
        createdAt: null,

        level: 1,
        money: 0,
        webdollars: 0,
        websiteCount: 0,
        teamCount: 0,
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
            this.password = data.password;
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
        }

    }
});