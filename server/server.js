/*
PURPOSE: Starts the Web Tycoon server.

INPUT: Environment configuration and socket connections.
OUTPUT: HTTP + Socket.IO server.
FUNCTIONS: Server startup.
DATA: HTTP server, Socket.IO server, PORT.
*/


// Modules from node.js server e.g http is built in
import "dotenv/config";

import http from "node:http";
import { Server } from "socket.io";

import { setupSocket } from "./socket/socket.js";

// Create HTTP server
const httpServer = http.createServer();

// Create Socket.IO server
const io = new Server(httpServer, {

    cors: {
        // Origin needs to be changed in production
        origin: "*",
        methods: ["GET", "POST"]
    }

});

// Setup Socket.IO event handling
setupSocket(io);

// Start server
const PORT = Number(process.env.PORT) || 3000;

httpServer.listen(PORT, () => {

    console.log(
        `Web Tycoon server running on http://localhost:${PORT}`
    );

});
