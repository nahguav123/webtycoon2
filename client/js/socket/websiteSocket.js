import socket from "./socket.js";
import { useWebsiteStore } from "../stores/websiteStore.js";


// Receive the full website list from the server
socket.on("websites:list", (websites) => {
    const websiteStore = useWebsiteStore();
    websiteStore.setWebsites(websites);
});


// Receive a realtime update for one website
socket.on("website:update", (website) => {
    const websiteStore = useWebsiteStore();
    websiteStore.updateWebsite(website);
});

socket.on("websites:error", (error) => {
    console.error("Website error:", error.message);
});

// Ask the server for this player's websites
export function requestWebsites() {
    socket.emit("websites:get");
}

//Request single website
export function requestWebsite(siteid) {
    socket.emit("website:get", {siteid});
}