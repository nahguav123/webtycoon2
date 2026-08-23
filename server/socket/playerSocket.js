import { createPlayer } from "../modules/createPlayer.js";
import { createGuest } from "../modules/createGuest.js";
import { loginPlayer } from "../modules/loginPlayer.js";

import { getUserById } from "../database/users.js";
import { getUserData } from "../database/userData.js";


function requireAuthentication(socket) {

    if (!socket.user?.userid) {

        throw new Error(
            "Authentication required."
        );

    }

    return Number(
        socket.user.userid
    );
}


export function handlePlayerSocket(socket) {

    // ==========================================
    // CREATE PLAYER
    // ==========================================

    socket.on("player:create", async (data) => {

        try {

            console.log(
                "Player creation request from:",
                socket.id
            );


            // Create player on the server
            const player = await createPlayer(data);


            // Tell client the player was created
            socket.emit("player:created", player);


        } catch (error) {

            console.error(
                "Player creation error:",
                error
            );


            socket.emit("player:error", {

                message:
                    error.message ||
                    "Failed to create player account."

            });

        }

    });


    // ==========================================
    // CREATE GUEST
    // ==========================================

    socket.on("guest:create", async () => {

        try {

            console.log(
                "Guest creation request from:",
                socket.id
            );

            // Create guest on the server
            const result = await createGuest();

            // Mark this socket as authenticated
            socket.user = {
                userid: Number(result.player.userid)
            };

            // Tell client the guest was created
            socket.emit("guest:created",result);

        } catch (error) {

            console.error(
                "Guest creation error:",
                error
            );


            socket.emit("guest:error", {

                message:
                    error.message ||
                    "Failed to create guest account."

            });

        }

    });

    // ==========================================
    // LOGIN PLAYER
    // ==========================================

    socket.on("player:login", async (data) => {

        try {

            console.log(
                "Login request from:",
                socket.id
            );

            // Login player on the server
            const result = await loginPlayer(data);

            // Mark this socket as authenticated
            socket.user = {
                userid: Number(result.player.userid)
            };

            // Tell client the player was logged in
            socket.emit("player:loggedIn", result);

        } catch (error) {

            console.error(
                "Player login error:",
                error
            );

            socket.emit("login:error", {

                message: error.message || "Failed to login user account."
            });
        }
    });


    socket.on("player:restore", async () => {

        try {

            const userid = requireAuthentication(socket);

            const user = await getUserById(userid);

            if (!user) {
                throw new Error("Player account no longer exists.");
            }

            const userData = await getUserData(userid);

            if (!userData) {
                throw new Error("Player game data not found.");
            }

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

            socket.emit("player:restored", player);

        } catch (error) {
            console.error("Session restore error:", error);

            socket.emit("player:restore:error", {
                message: error.message || "Failed to restore session."
            });

        }
    });
}