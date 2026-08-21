import { getWebsitesList } from "../database/websites.js";
import { getWebsiteData } from "../database/websites.js";

export function handleWebsiteSocket(socket) {

    // ==========================================
    // Load Websites
    // ==========================================


    // Load a list of websites
    socket.on("websites:list:load", async (data) => {

        try {
            console.log("Websites list request from:", socket.id);

            // Create websitesList variable from db request
            const websitesList = await getWebsitesList(data);

            // Tell client the websites list was loaded and pass variable to them
            socket.emit("websites:list:loaded", websitesList);

        } catch (error) {
            console.error("Websites list load error:", error);

            socket.emit("websites:list:error", { message: error.message || "Failed to load websites list." });
        }
    });


        // Load data from a single website
    socket.on("website:data:load", async (data) => {

        try {
            console.log("Website data request from:", socket.id);

            // Create websitesList variable from db request
            const websiteData = await getWebsiteData(data);

            // Tell client the websites list was loaded and pass variable to them
            socket.emit("website:data:loaded", websiteData);

        } catch (error) {
            console.error("Website data load error:", error);

            socket.emit("website:data:error", { message: error.message || "Failed to load website data." });
        }
    });


}
