import { getWebsitesList } from "../database/websites.js";
import { getWebsiteData } from "../database/websites.js";

export function handleWebsiteSocket(socket) {

    // ==========================================
    // Load Websites
    // ==========================================


    // Load a list of websites with data for user id
    socket.on("websites:get", async (data) => {
        try {
            const websites = await getWebsitesList(data.userid);
            socket.emit("websites:list", websites);

        } catch (error) {
            console.error("Failed to get websites:", error);
            socket.emit("websites:error", {
                message: "Failed to retrieve websites"
            });
        }
    });

}
