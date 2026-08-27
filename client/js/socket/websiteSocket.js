/*
PURPOSE: Gets and updates website data.

INPUT: Website/site ID requests.
OUTPUT: Website data sent to websiteStore.
FUNCTIONS: requestWebsites(), requestWebsite().
DATA: Website list/details.
*/


import socket from "./socket.js";
import { useWebsiteStore } from "../stores/websiteStore.js";


// Request players websites
export function requestWebsites() {
    socket.emit("websites:get");
}

// Receives list of players websites and adds to websiteStore
socket.on("websites:list", (websites) => {
    const websiteStore = useWebsiteStore();
    websiteStore.setWebsites(websites);
});

// Receives error when requesting websites
socket.on("websites:error", (error) => {
    console.error("Website error:", error.message);
});

//Request player single website - NOT IN USE YET
export function requestWebsite(siteid) {
    socket.emit("website:get", {siteid});
}

// Receives update for player single website and modifys websiteStore - NOT IN USE YET
socket.on("website:update", (website) => {
    const websiteStore = useWebsiteStore();
    websiteStore.updateWebsite(website);
});





