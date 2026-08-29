/*
PURPOSE: Logs in an existing player.

INPUT: Username and password.
OUTPUT: Player data + JWT.
FUNCTIONS: loginPlayer().
DATA: User and game data.
*/


import bcrypt from "bcrypt";

import { getUserByUsernameDB } from "../database/users.js";
import { getUserDataDB } from "../database/userData.js";
import { generateToken } from "../auth/auth.js";


export async function loginPlayer(data) {
    // Checks input data
    if (!data) {
        throw new Error(
            "No player data provided."
        );
    }

    // Get all inputs and cleans them
    const username =
        typeof data.username === "string"
            ? data.username.trim()
            : "";

    const password =
        typeof data.password === "string"
            ? data.password
            : "";

    // Validates username
    if (!username) {
        throw new Error(
            "Username is required."
        );
    }

    // Validates password
    if (!password) {
        throw new Error(
            "Password is required."
        );
    }

    // Checks username against database for user
    const existingUsername = await getUserByUsernameDB(username);
    if (!existingUsername) {
        throw new Error("Invalid username or password.");
    }

    // Checks password against database for a match
    const passwordMatch = await bcrypt.compare(password, existingUsername.passwordHash);
    if (!passwordMatch) {
        throw new Error("Invalid username or password");
    }

    // Store userid and email in variables
    const userid = Number(existingUsername.userid);
    const email = existingUsername.email;

    // Get userData 
    const userData = await getUserDataDB(userid);
    if (!userData) {
        throw new Error("Player game data not found.");
    }

    // Generate JWT token
    const token = generateToken(userid);

    // Return data to whoever called loginPlayer()
    return {
        token,

        player: {
            userid,
            username,
            email,

            createdAt: existingUsername.createdAt,
            money: userData.money,
            webdollars: userData.webdollars,
            level: userData.level,
            websiteCount: userData.websiteCount,
            teamCount: userData.teamCount
        }
    };
}