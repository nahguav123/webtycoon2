import socket, {
    connectSocket,
    setSocketToken,
    disconnectSocket
} from "./socket.js";

import {
    getToken,
    setToken,
    removeToken
} from "../auth/auth.js";

import { usePlayerStore } from "../stores/playerStore.js";


export async function createGuest() {

    await connectSocket();

    return new Promise((resolve, reject) => {

        const playerStore = usePlayerStore();


        // Tell server we want to create a guest account
        socket.emit("guest:create");


        // Server successfully created guest
        socket.once("guest:created", (data) => {

            setToken(data.token);

            setSocketToken(data.token);

            // Store player information in Pinia
            playerStore.setPlayer(data.player);

            // Return the data to whoever called createGuest()
            resolve(data.player);

        });


        // Server failed to create guest
        socket.once("guest:error", (error) => {

            reject(
                new Error(error.message || "Failed to create guest account")
            );

        });

    });

}


export async function createPlayer(username, email, password) {

    await connectSocket();

    return new Promise((resolve, reject) => {

        // Tell server we want to create a player account
        socket.emit("player:create", {
            username,
            email,
            password
        });


        // Server successfully created player
        socket.once("player:created", (data) => {

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

export async function loginPlayer(username, password) {

    await connectSocket();

    return new Promise((resolve, reject) => {

        const playerStore = usePlayerStore();

        // Tell server we want to login a player account
        socket.emit("player:login", {
            username,
            password
        });


        // Server successfully logged in player
        socket.once("player:loggedIn", (data) => {

            // Store JWT
            setToken(data.token);

            // Tell Socket.IO about the token for future reconnects.
            setSocketToken(data.token);

            const playerStore = usePlayerStore();

            playerStore.setPlayer(data.player);

            // Return the data to whoever called loginPlayer()
            resolve(data.player);

        });


        // Server failed to login player
        socket.once("login:error", (error) => {

            reject(
                new Error(error.message || "Failed to login to player account")
            );

        });

    });

}


export async function restoreSession() {

    const token = getToken();

    // No token means there is no session.
    if (!token) {
        return false;
    }

    try {

        // Give Socket.IO the stored JWT
        setSocketToken(token);

        // Connect.
        // Server verifies the JWT during handshake.

        await connectSocket();

        return new Promise(
            (resolve) => {

                const playerStore = usePlayerStore();

                const handleSuccess = (player) => {

                    cleanup();
                    playerStore.setPlayer(player);
                    resolve(true);
                };

                const handleError = () => {

                    cleanup();
                    removeToken();
                    playerStore.clearPlayer();
                    disconnectSocket();
                    resolve(false);
                };

                function cleanup() {
                    socket.off("player:restored", handleSuccess);
                    socket.off("player:restore:error", handleError);
                }

                socket.once("player:restored", handleSuccess);

                socket.once("player:restore:error", handleError);

                socket.emit("player:restore");
            }
        );

    } catch (error) {

        console.error("Failed to restore session:", error);

        removeToken();
        disconnectSocket();
        return false;
    }
}

// ==========================================
// LOGOUT
// ==========================================

export function logoutPlayer() {

    const playerStore = usePlayerStore();

    removeToken();
    setSocketToken(null);

    playerStore.clearPlayer();
    disconnectSocket();
}