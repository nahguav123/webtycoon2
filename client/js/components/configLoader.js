/*
PURPOSE: Gets all configuration options from the server and stores in relevant stores. The function is run in main.js on inital load.

INPUT: None.
OUTPUT: Config options sent to websiteStore.
FUNCTIONS: storeWebsiteCreationOptions().
DATA: Website tld options and site types.
*/


import socket, { connectSocket } from "../socket/socket.js";
import { useWebsiteStore } from "../stores/websiteStore.js";


// Requests website options - tld, siteType
async function requestWebsiteCreationOptions() {
	await connectSocket();
	
    return new Promise((resolve, reject) => {
        socket.emit("websiteCreationOptions:request");

        socket.once("websiteCreationOptions:loaded", (options) => {
            resolve(options);
        });

        socket.once("websiteCreationOptions:error", (error) => {
            reject(new Error(error.message || "Failed to load website creation options."));
        });
    });
}

// Runs websiteCreationOptions() function above and then stores values in websiteStore.
export async function storeWebsiteCreationOptions() {
	const websiteStore = useWebsiteStore();
	await connectSocket();

	try {
        const options = await requestWebsiteCreationOptions();

		websiteStore.tldOptions = options.tlds;
		websiteStore.defaultTld = options.defaultTld;
		websiteStore.siteTypes = options.siteTypes;
		websiteStore.defaultSiteType = options.defaultSiteType;

    } catch (error) {
		console.error("Config load error:", error.message);
	}
}