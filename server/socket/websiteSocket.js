/*
PURPOSE: Handles website-related socket events.

INPUT: Website requests + authenticated userid.
OUTPUT: Website list/details or errors.
FUNCTIONS: requireAuthentication(), handleWebsiteSocket().
DATA: Website data.
*/


import {
    getWebsitesListDB,
    getWebsiteDataDB,
} from "../database/websites.js";

import { createWebsite } from "../modules/createWebsite.js";
import { websiteHosting } from "../modules/websiteHosting.js";
import { websiteDomain } from "../modules/websiteDomain.js";
import { websiteCreationOptions } from "../modules/configSender.js";


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
    socket.on("websitesList:request", async () => {
        try {
            // Checks if user is authenticated and gets userid
            const userid = requireAuthentication(socket);
            // Gets websites for userid from DB
            const websites = await getWebsitesListDB(userid);

            // Sends list of websites back to player
            socket.emit("websitesList:loaded", websites);

        } catch (error) {
            console.error("Failed to get websites:", error);
            // Sends error back to player
            socket.emit("websitesList:error", { message: error.message || "Failed to retrieve websites."});
        }
    });

	// Receives request to create new website
	socket.on("websiteCreate:request", async (data) => {
		try {
			// Checks if user is authenticated and gets userid
			const userid = requireAuthentication(socket);

			console.log("Website creation request from:", socket.id);

			//Creates website
			const website = await createWebsite(userid, data);

			//Sends website creation back to client
			socket.emit("websiteCreated:loaded", website);

		} catch (error) {
			console.error("Website creation error:", error);
			// Sends error back to client
			socket.emit("websiteCreate:error", {message: error.message || "Failed to create website."});
		}
	});

	// Receives request for website creation options and sends them back to client.
	socket.on("websiteCreationOptions:request", async () => {
		try {
			const options = websiteCreationOptions();

			socket.emit("websiteCreationOptions:loaded", options);
		
		} catch (error) {
			console.error("Website creation options error:", error);
			socket.emit("websiteCreationOptions:error", { message: "Failed to load website creation options."});
		}
	});

	// Receives request for a single website data by siteid.
    socket.on("websiteSingle:request", async ({ siteid } = {}) => {
		try {
			// Checks if user is authenticated and gets userid
			const userid = requireAuthentication(socket);
			// Gets website data for userid and siteid from DB
			const website = await getWebsiteDataDB(userid, Number(siteid));
			
			// Sends website data back to player
			socket.emit("websiteSingle:loaded", website);

		} catch (error) {
			console.error("Failed to get website:", error);
			// Sends error back to player
			socket.emit("websiteSingle:error", { message: error.message || "Failed to retrieve website." });
		}
	});

	// Receives request to renew/update website hosting plan
	socket.on("websiteHostingUpdate:request", async ({ siteid, hostingPlan, renewal } = {}) => {
		try {
			// Checks if user is authenticated and gets userid
			const userid = requireAuthentication(socket);
			// Renews/updates website hosting plan in DB
			await websiteHosting(userid, Number(siteid), hostingPlan, Boolean(renewal));
			// Gets website data for userid and siteid from DB
			const website = await getWebsiteDataDB(userid, Number(siteid));
			
			// Sends website data back to player
			socket.emit("websiteHostingUpdate:loaded", { website });

		} catch (error) { 
			console.error("Failed to update website hosting:", error);
			// Sends error back to player
			socket.emit("websiteHostingUpdate:error", { message: error.message || "Failed to update hosting." }); }
	});

	// Receives request to renew/update website domain/tld
	socket.on("websiteDomainUpdate:request", async ({ siteid, domain, tld, renewal } = {}) => {
		try {
			// Checks if user is authenticated and gets userid
			const userid = requireAuthentication(socket);
			// Renews/updates website domain/tld in DB
			await websiteDomain(userid, Number(siteid), String(domain), String(tld), Boolean(renewal));
			// Gets website data for userid and siteid from DB
			const website = await getWebsiteDataDB(userid, Number(siteid));

			// Sends website data back to player
			socket.emit("websiteDomainUpdate:loaded", { website });

		} catch (error) { 
			console.error("Failed to update website domain:", error);
			// Sends error back to player
			socket.emit("websiteDomainUpdate:error", { message: error.message || "Failed to update domain." }); }
	});

}
