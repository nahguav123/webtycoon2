/*
PURPOSE: Gets and updates website data.

INPUT: Website/site ID requests.
OUTPUT: Website data sent to websiteStore.
FUNCTIONS: requestWebsites(), requestWebsite().
DATA: Website list/details.
*/


import socket, { connectSocket } from "./socket.js";
import { useWebsiteStore } from "../stores/websiteStore.js";
import { usePlayerStore } from "../stores/playerStore.js";


// Request players websites and adds to websiteStore
export async function requestWebsites() {
	await connectSocket();

	return new Promise((resolve, reject) => {
		const websiteStore = useWebsiteStore();

		socket.emit("websitesList:request");

		socket.once("websitesList:loaded", (websites) => {
			// Adds websites to websiteStore
			websiteStore.websites = websites;
			resolve(websites);
		});

		socket.once("websitesList:error", (error) => {
			reject(new Error(error.message || "Failed to load websites."));
		});
	});
}

// Request to create a new website
export async function requestCreateWebsite(data) { 
	await connectSocket();

	return new Promise((resolve, reject) => { 
		const playerStore = usePlayerStore();

		socket.emit("websiteCreate:request", data); 
		
		socket.once("websiteCreated:loaded", (website) => { 
			// Updates player money in playerStore
			playerStore.money = Number(website.money);
			resolve(website); 
		}); 
		
		socket.once("websiteCreate:error", (error) => { 
			reject( new Error( error.message || "Failed to create website." ) ); 
		}); 
	}); 
}




