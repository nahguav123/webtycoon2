/*
PURPOSE: Handles website-related socket events.

INPUT: Website requests + authenticated userid.
OUTPUT: Website list/details or errors.
FUNCTIONS: requireAuthentication(), handleWebsiteSocket().
DATA: Website data.
*/


import { getWebsitesList } from "../database/websites.js";
// To be used in future
import { getWebsiteData } from "../database/websites.js";


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


export function handleWebsiteSocket(socket) {

    // Receives request for players websites
    socket.on("websites:get", async () => {
        try {
            // Checks if user is authenticated and gets userid
            const userid = requireAuthentication(socket);
            // Gets websites for userid from DB
            const websites = await getWebsitesList(userid);

            // Sends list of websites back to player
            socket.emit("websites:list", websites);

        } catch (error) {
            console.error("Failed to get websites:", error);
            // Sends error back to player
            socket.emit("websites:error", { message: error.message || "Failed to retrieve websites."});
        }
    });
}
