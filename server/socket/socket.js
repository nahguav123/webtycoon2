import { handlePlayerSocket } from "./playerSocket.js";
import { handleWebsiteSocket } from "./websiteSocket.js";


export function setupSocket(io) {

    io.on("connection", (socket) => {

        console.log(
            "Client connected:",
            socket.id
        );


        // Player-related events
        handlePlayerSocket(socket);
        handleWebsiteSocket(socket);


        // Client disconnected
        socket.on("disconnect", (reason) => {

            console.log(
                "Client disconnected:",
                socket.id,
                reason
            );

        });

    });

}   