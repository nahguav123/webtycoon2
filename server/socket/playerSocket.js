import { createPlayer } from "../fileRouter.js";
import { createGuest } from "../fileRouter.js";
import { loginPlayer } from "../fileRouter.js";

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
            const guest = await createGuest();

            // Tell client the guest was created
            socket.emit("guest:created", guest);

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
            const player = await loginPlayer(data);

            // Tell client the player was logged in
            socket.emit("player:loggedIn", player);

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


}