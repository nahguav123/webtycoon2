// All the import {} from ... stuff point to this file and then this file manages all of the file paths.

export { handlePlayerSocket } from "./socket/playerSocket.js";
export { createPlayer } from "./modules/createPlayer.js";
export { createGuest } from "./modules/createGuest.js";
export { loginPlayer } from "./modules/loginPlayer.js";

export { dbpool } from "./database/connection.js";

export { setupSocket } from "./socket/socket.js";

export { GameConfig } from "./game/config.js";