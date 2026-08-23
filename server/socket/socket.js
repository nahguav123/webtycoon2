import { handlePlayerSocket } from "./playerSocket.js";
import { handleWebsiteSocket } from "./websiteSocket.js";

import { verifyToken } from "../auth/auth.js";


export function setupSocket(io) {

    io.use((socket, next) => {

        const token = socket.handshake.auth?.token;

        // No token is allowed because login/register/guest creation
        // can happen without authentication.
        if (!token) {
            socket.user = null;
            return next();
        }

        try {
            const decoded = verifyToken(token);
            socket.user = { userid: Number(decoded.userid) };

            console.log(
                "Authenticated socket:",
                socket.id,
                "userid:",
                socket.user.userid
            );

            next();

        } catch (error) {

            console.error(
                "Invalid socket token:",
                error.message
            );
            next(new Error("Invalid or expired authentication token."));

        }

    });

    io.on("connection", (socket) => {

        console.log(
            "Client connected:",
            socket.id,
        );

        handlePlayerSocket(socket);
        handleWebsiteSocket(socket);

        socket.on("disconnect", (reason) => {

            console.log(
                "Client disconnected:",
                socket.id,
                reason
            );

        });

    });

}