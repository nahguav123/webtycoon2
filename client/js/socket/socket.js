import { io } from "socket.io-client";

import { getToken, removeToken } from "../auth/auth.js";


const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

const socket = io(SERVER_URL, {
    autoConnect: false,
    auth: {
        token: getToken()
    }
});

socket.on("connect", () => {
    console.log("Connected to Web Tycoon server:", socket.id);
});

socket.on("disconnect", (reason) => {
    console.log("Disconnected from server:", reason);
});

socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);

     // If the stored JWT is invalid,
    // remove it so the user can log in again.

    if (error.message === "Invalid or expired authentication token.") {
        removeToken();
    }

});

// ==========================================
// CONNECT SOCKET
// ==========================================

export function connectSocket() {

    if (socket.connected) {
        return Promise.resolve();
    }

    return new Promise(
        (resolve, reject) => {

            const handleConnect =
                () => {
                    cleanup();
                    resolve();
                };

            const handleError =
                (error) => {
                    cleanup();
                    reject(error);
                };

            function cleanup() {

                socket.off(
                    "connect",
                    handleConnect
                );

                socket.off(
                    "connect_error",
                    handleError
                );
            }

            socket.once(
                "connect",
                handleConnect
            );

            socket.once(
                "connect_error",
                handleError
            );

            socket.connect();
        }
    );
}

// ==========================================
// UPDATE AUTH TOKEN
// ==========================================

export function setSocketToken(token) {
    socket.auth = {
        token
    };
}

// ==========================================
// DISCONNECT
// ==========================================

export function disconnectSocket() {

    if (socket.connected) {
        socket.disconnect();
    }

    socket.auth = {
        token: undefined
    };
}


export default socket;