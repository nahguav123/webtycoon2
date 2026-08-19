// Modules from node.js server e.g http is built in

import http from "node:http";
import { Server } from "socket.io";

import { setupSocket } from "./socket/socket.js";

// Create HTTP server
const httpServer = http.createServer();

// Create Socket.IO server
const io = new Server(httpServer, {

    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }

});

// Setup Socket.IO event handling
setupSocket(io);

// Start server
const PORT = 3000;

httpServer.listen(PORT, () => {

    console.log(
        `Web Tycoon server running on http://localhost:${PORT}`
    );

});
