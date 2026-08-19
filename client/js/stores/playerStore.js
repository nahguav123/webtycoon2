import { defineStore } from "pinia";


export const usePlayerStore = defineStore("player", {

    state: () => ({
        userid: null,
        username: "",
        password: "",
        email: "",
        createdAt: null
    }),


    actions: {

        setPlayer(data) {

            this.userid = data.userid;
            this.username = data.username;
            this.password = data.password;
            this.email = data.email;
            this.createdAt = data.createdAt;
        },

        //In future for removing player from local store.
        clearPlayer() {
            this.id = null;
            this.username = "";
            this.email = "";
            this.createdAt = null;
        }

    }
});