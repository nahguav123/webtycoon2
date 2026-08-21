import socket from "./socket.js";
import { useWebsiteStore } from "../stores/websiteStore.js";


// Get all websites owned by the current player
export function getWebsitesList(userid) {

    return new Promise((resolve, reject) => {

        // Tell server we want the player's websites
        socket.emit("websites:list:load", {
            userid: userid
        });

        // Server successfully retrieved websites
        socket.once("websites:list:loaded", (data) => {

            // Return the website list to whoever called getWebsitesList()
            resolve(data);
        });

        // Server failed to retrieve websites
        socket.once("websites:list:error", (error) => {

            reject(
                new Error(error.message || "Failed to retrieve websites")
            );
        });
    });
}


// Get a single website
export function getWebsiteData(userid, siteid) {

    return new Promise((resolve, reject) => {

        // Tell server we want this website
        socket.emit("website:data:load", {
            userid: userid,
            siteid: siteid
        });

        // Server successfully retrieved website
        socket.once("website:data:loaded", (data) => {

            // Return the website data to whoever called getWebsite()
            resolve(data);
        });

        // Server failed to retrieve website
        socket.once("website:data:error", (error) => {
            reject(
                new Error(error.message || "Failed to retrieve website")
            );
        });
    });
}