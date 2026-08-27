/*
PURPOSE: Sets up Socket.IO authentication and connections.

INPUT: Socket.IO server + JWT.
OUTPUT: Authenticated sockets.
FUNCTIONS: setupSocket().
DATA: socket.user = authenticated userid.
*/


import { handlePlayerSocket } from "./playerSocket.js";
import { handleWebsiteSocket } from "./websiteSocket.js";
import { verifyToken } from "../auth/auth.js";


export function setupSocket(io) {

    // Authenticate socket when a JWT is provided
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;

        // No token is allowed for guests, login and registration
        if (!token) {
            socket.user = null;
            return next();
        }

        try {
            const decoded = verifyToken(token);
            // Store authenticated user on the socket
            socket.user = { userid: Number(decoded.userid) };

            console.log("Authenticated socket:", socket.id, "userid:", socket.user.userid);
            next();

        } catch (error) {
            console.error("Invalid socket token:", error.message);
            next(new Error("Invalid or expired authentication token."));
        }
    });

    // Handle new socket connections
    io.on("connection", (socket) => {
        
        console.log("Client connected:", socket.id,);

        handlePlayerSocket(socket);
        handleWebsiteSocket(socket);

        socket.on("disconnect", (reason) => {
            console.log("Client disconnected:", socket.id, reason);
        });
    });
}