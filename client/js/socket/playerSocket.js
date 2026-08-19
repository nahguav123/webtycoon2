import socket from "./socket.js";
import { usePlayerStore } from "../fileRouter.js";


export function createGuest() {

    return new Promise((resolve, reject) => {

        const playerStore = usePlayerStore();


        // Tell server we want to create a guest account
        socket.emit("guest:create");


        // Server successfully created guest
        socket.once("guest:created", (data) => {

            // Store player information in Pinia
            playerStore.setPlayer({
                id: data.id,
                username: data.username,
                password: data.password,
                email: data.email,
                createdAt: data.createdAt
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
                id: data.id,
                username: data.username,
                password: data.password,
                email: data.email,
                createdAt: data.createdAt
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