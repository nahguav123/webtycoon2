/*
PURPOSE: Handles player login, registration and logout.

INPUT: Login/register/guest details and JWT.
OUTPUT: Player data and JWT.
FUNCTIONS: requestCreateGuest(), requestCreatePlayer(), requestLoginPlayer(), requestRestoreSession(), logoutPlayer().
DATA: Player data, JWT.
*/


import socket, { connectSocket, setSocketToken, disconnectSocket } from "./socket.js";
import { getToken, setToken, removeToken } from "../auth/auth.js";
import { usePlayerStore } from "../stores/playerStore.js";


// Request creation of new guest account and sets token
export async function requestCreateGuest() {
    await connectSocket();

    return new Promise((resolve, reject) => {
        const playerStore = usePlayerStore();

        // Requests guest account creation
        socket.emit("guestCreate:request");

        // Receives new guest account data
        socket.once("guestCreated:loaded", (data) => {
            // Adds JWT token to local storage
            setToken(data.token);
            // Stores socket token for future reconnects
            setSocketToken(data.token);
            // Stores guest data in Pinia
            playerStore.setPlayer(data.player);
            // Returns guest data to whoever called createGuest()
            resolve(data.player);
        });

        // Receives error when creating guest
        socket.once("guestCreate:error", (error) => {
            reject(new Error(error.message || "Failed to create guest account"));
        });
    });
}

// Request creation of new player account
export async function requestCreatePlayer(username, email, password) {
    await connectSocket();

    return new Promise((resolve, reject) => {
        // Requests player account creation
        socket.emit("playerCreate:request", {
            username,
            email,
            password
        });

        // Receives new player data
        socket.once("playerCreated:loaded", (data) => {
            // Returns player data to whoever called createPlayer()
            resolve(data);
        });

        // Receives error when creating player
        socket.once("playerCreate:error", (error) => {
            reject(new Error(error.message || "Failed to create player account"));
        });
    });
}

// Request to login to player account
export async function requestLoginPlayer(username, password) {
    await connectSocket();

    return new Promise((resolve, reject) => {
        const playerStore = usePlayerStore();

        // Requests player login
        socket.emit("playerLogin:request", {
            username,
            password
        });

        // Receives loggedIn player data
        socket.once("playerLoggedIn:loaded", (data) => {
            // Adds JWT token to local storage
            setToken(data.token);
            // Stores socket token for future reconnects
            setSocketToken(data.token);
            // Stores player data in Pinia
            playerStore.setPlayer(data.player);
            // Returns player data to whoever called loginPlayer()
            resolve(data.player);
        });

        // Receives error when logging in player
        socket.once("playerLogin:error", (error) => {
            reject(new Error(error.message || "Failed to login to player account"));
        });
    });
}

// Request to restore player session
export async function requestRestoreSession() {
    const token = getToken();

    // Returns false if there is no saved JWT token
    if (!token) {
        return false;
    }

    try {
        // Gives socket the stored JWT token
        setSocketToken(token);

        // Connects socket and verifies JWT during handshake
        await connectSocket();

        return new Promise((resolve) => {
            const playerStore = usePlayerStore();

            // Requests player session restoration
            socket.emit("playerRestore:request");

            // Receives restored player data
            socket.once("playerRestored:loaded", (data) => {
                // Stores player data in Pinia
                playerStore.setPlayer(data);

                // Returns true because session was restored successfully
                resolve(true);
            });

            // Receives error when restoring session
            socket.once("playerRestore:error", (error) => {
                console.error("Failed to restore session:", error.message);
                // Removes invalid JWT token
                removeToken();
                // Clears player data from Pinia
                playerStore.clearPlayer();
                // Disconnects socket
                disconnectSocket();
                // Returns false because session could not be restored
                resolve(false);
            });
        });

    } catch (error) {
        console.error("Failed to connect while restoring session:", error);
        // Removes invalid/unusable JWT token
        removeToken();
        // Disconnects socket
        disconnectSocket();
        // Returns false because session could not be restored
        return false;
    }
}

// function run when player clicks logout button
export function logoutPlayer() {
    const playerStore = usePlayerStore();
    // Removes JWT token from localStorage and socket token
    removeToken();
    setSocketToken(null);
    // Clears playerStore and disconnects socket
    playerStore.clearPlayer();
    disconnectSocket();
}