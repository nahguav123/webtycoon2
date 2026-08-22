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


// Ask the server for this player's websites
export function requestWebsites(userid) {
    socket.emit("websites:get", {
        userid
    });
}