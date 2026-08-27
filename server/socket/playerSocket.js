/*
PURPOSE: Handles player-related socket events.

INPUT: Login, registration, guest and restore requests.
OUTPUT: Player data, JWTs and errors.
FUNCTIONS: requireAuthentication(), handlePlayerSocket().
DATA: socket.user and player data.
*/


import { createPlayer } from "../modules/createPlayer.js";
import { createGuest } from "../modules/createGuest.js";
import { loginPlayer } from "../modules/loginPlayer.js";

import { getUserById } from "../database/users.js";
import { getUserData } from "../database/userData.js";


function requireAuthentication(socket) {
    let userId;

    // Checks if a user is attached to the socket
    if (socket.user) {
        // Gets the userid
        userId = socket.user.userid;
    }

    // If no userid, throw an error
    if (!userId) {
        throw new Error("Authentication required.");
    }

    // Converts userid to a number and returns it
    return Number(userId);
}


export function handlePlayerSocket(socket) {

    // Receives request for guest creation
    socket.on("guest:create", async () => {
        try {
            console.log("Guest creation request from:", socket.id);
            // Creates guest
            const result = await createGuest();
            // Marks this socket as authenticated - due to being a guest there is no login.
            socket.user = {userid: Number(result.player.userid)};

            // Sends new guest data back to client
            socket.emit("guest:created", result);

        } catch (error) {
            console.error("Guest creation error:", error);
            // Sends error back to player
            socket.emit("guest:error", {message: error.message || "Failed to create guest account."});
        }
    });
    
    // Receives request for player creation
    socket.on("player:create", async (data) => {
        try {
            console.log("Player creation request from:", socket.id);
            // Creates player
            const player = await createPlayer(data);

            // Sends new player data back to the client
            socket.emit("player:created", player);

        } catch (error) {
            console.error("Player creation error:", error);
            // Sends error back to player
            socket.emit("player:error", {message: error.message || "Failed to create player account."});
        }
    });

    // Receives request for player login
    socket.on("player:login", async (data) => {
        try {
            console.log("Login request from:", socket.id);
            // Login player
            const result = await loginPlayer(data);
            // Mark this socket as authenticated
            socket.user = {userid: Number(result.player.userid)};

            // Sends player data back to client
            socket.emit("player:loggedIn", result);

        } catch (error) {
            console.error("Player login error:", error);
            // Sends error back to player
            socket.emit("login:error", {message: error.message || "Failed to login user account."});
        }
    });

    // Receives request to restore player session
    socket.on("player:restore", async () => {
        try {
            // Checks if user is authenticated and gets userid
            const userid = requireAuthentication(socket);

            // Stores user (if exists) identified by userid
            const user = await getUserById(userid);
            // If user doesn't exist, throw an error
            if (!user) {
                throw new Error("Player account no longer exists.");
            }

            // Gets user data identified by userid
            const userData = await getUserData(userid);
            // If no user data, throw an error
            if (!userData) {
                throw new Error("Player game data not found.");
            }

            // Creates player variable from data
            const player = {
                userid,

                username: user.username,
                email: user.email,
                createdAt: user.createdAt,

                money: userData.money,
                webdollars: userData.webdollars,
                level: userData.level,
                websiteCount: userData.websiteCount,
                teamCount: userData.teamCount
            };

            // Sends player data back to client
            socket.emit("player:restored", player);

        } catch (error) {
            console.error("Session restore error:", error);
            // Sends error back to player
            socket.emit("player:restore:error", {message: error.message || "Failed to restore session."});
        }
    });
}