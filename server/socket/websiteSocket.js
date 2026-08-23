import { getWebsitesList } from "../database/websites.js";
import { getWebsiteData } from "../database/websites.js";


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

export function handleWebsiteSocket(socket) {

    // ==========================================
    // Load Websites
    // ==========================================


    // Load a list of websites with data for user id
    socket.on("websites:get", async () => {
        try {
            const userid = requireAuthentication(socket);
            const websites = await getWebsitesList(userid);
            socket.emit("websites:list", websites);

        } catch (error) {
            console.error("Failed to get websites:", error);
            socket.emit("websites:error", {
                message: error.message || "Failed to retrieve websites."
            });
        }
    });

}
