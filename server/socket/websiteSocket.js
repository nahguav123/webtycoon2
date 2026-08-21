import { getWebsitesList } from "../database/websites.js";

export function handleWebsitesSocket(socket) {
    // ==========================================
    // Load Websites
    // ==========================================

    // Load a list of websites
    socket.on("websitesList:load", async (data) => {

        try {

            console.log(
                "Website list request from:",
                socket.id
            );

            // Create guest on the server
            const websitesList = await getWebsitesList(data);

            // Tell client the websites list was loaded
            socket.emit("websitesList:loaded", websitesList);

        } catch (error) {

            console.error(
                "Website list load error:",
                error
            );


            socket.emit("websitesList:error", {

                message:
                    error.message ||
                    "Failed to load websites list."

            });

        }

    });


}
