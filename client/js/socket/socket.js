/*
PURPOSE: Manages the Socket.IO connection.

INPUT: Server URL and JWT.
OUTPUT: Connected authenticated socket.
FUNCTIONS: connectSocket(), setSocketToken(), disconnectSocket().
DATA: Shared socket instance.
*/


import { io } from "socket.io-client";
import { getToken, removeToken } from "../auth/auth.js";


const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

const socket = io(SERVER_URL, {
    autoConnect: false,
    auth: {
        token: getToken()
    }
});


// Socket connected
socket.on("connect", () => {
    console.log("Connected to Web Tycoon server:", socket.id);
});

// Socket disconnected
socket.on("disconnect", (reason) => {
    console.log("Disconnected from server:", reason);
});

// Socket connection error
socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);

     // If the stored JWT is invalid, removes it so the user can log in again
    if (error.message === "Invalid or expired authentication token.") {
        removeToken();
    }
});


// Connect socket
export function connectSocket() {
    // If already connected, return
    if (socket.connected) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        // Successfully connected
        const handleConnect = () => {
            cleanup();
            resolve();
        };
        // Connection failed
        const handleError = (error) => {
            cleanup();
            reject(error);
        };
        // Remove temporary listeners
        function cleanup() {
            socket.off("connect", handleConnect);
            socket.off("connect_error", handleError);
        }

        socket.once("connect", handleConnect);
        socket.once("connect_error", handleError);

        socket.connect();
    });
}


// Update socket JWT token
export function setSocketToken(token) {
    socket.auth = {
        token
    };
}


// Disconnect socket
export function disconnectSocket() {

    if (socket.connected) {
        socket.disconnect();
    }

    socket.auth = {
        token: undefined
    };
}


export default socket;