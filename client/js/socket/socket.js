import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
    autoConnect: true
});

socket.on("connect", () => {
    console.log("Connected to Web Tycoon server:", socket.id);
});

socket.on("disconnect", () => {
    console.log("Disconnected from server");
});

export default socket;