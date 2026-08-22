import socket from "./socket.js";
import { usePlayerStore } from "../stores/playerStore.js";


export function createGuest() {

    return new Promise((resolve, reject) => {

        const playerStore = usePlayerStore();


        // Tell server we want to create a guest account
        socket.emit("guest:create");


        // Server successfully created guest
        socket.once("guest:created", (data) => {

            // Store player information in Pinia
            playerStore.setPlayer({
                userid: data.userid,
                username: data.username,
                email: data.email,

                money: data.money,
                webdollars: data.webdollars,
                level: data.level,
                websiteCount: data.websiteCount,
                teamCount: data.teamCount
            });


            // Return the data to whoever called createGuest()
            resolve(data);

        });


        // Server failed to create guest
        socket.once("guest:error", (error) => {

            reject(
                new Error(error.message || "Failed to create guest account")
            );

        });

    });

}


export function createPlayer() {

    return new Promise((resolve, reject) => {

        const playerStore = usePlayerStore();

        // Tell server we want to create a player account
        socket.emit("player:create", {
            username: playerStore.username,
            password: playerStore.password,
            email: playerStore.email
        });


        // Server successfully created player
        socket.once("player:created", (data) => {

            // Store player information in Pinia
            playerStore.setPlayer({
                userid: data.userid,
                username: data.username,
                email: data.email,

                money: data.money,
                webdollars: data.webdollars,
                level: data.level,
                websiteCount: data.websiteCount,
                teamCount: data.teamCount
            });


            // Return the data to whoever called createPlayer()
            resolve(data);

        });


        // Server failed to create player
        socket.once("player:error", (error) => {

            reject(
                new Error(error.message || "Failed to create player account")
            );

        });

    });

}

export function loginPlayer() {

    return new Promise((resolve, reject) => {

        const playerStore = usePlayerStore();

        // Tell server we want to login a player account
        socket.emit("player:login", {
            username: playerStore.username,
            password: playerStore.password,
        });


        // Server successfully logged in player
        socket.once("player:loggedIn", (data) => {

            // Store player information in Pinia
            playerStore.setPlayer({
                userid: data.userid,
                username: data.username,
                email: data.email,
                
                money: data.money,
                webdollars: data.webdollars,
                level: data.level,
                websiteCount: data.websiteCount,
                teamCount: data.teamCount
            });


            // Return the data to whoever called loginPlayer()
            resolve(data);

        });


        // Server failed to login player
        socket.once("login:error", (error) => {

            reject(
                new Error(error.message || "Failed to login to player account")
            );

        });

    });

}