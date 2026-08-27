/*
PURPOSE: Creates a guest player.

INPUT: None.
OUTPUT: Guest player data + JWT.
FUNCTIONS: createGuest().
DATA: Generated username + starting game data.
*/


import crypto from "crypto";

import { getUserByUsername, createGuestUser } from "../database/users.js";
import { createUserData } from "../database/userData.js";
import { GameConfig } from "../game/config.js";
import { generateToken } from "../auth/auth.js";


export async function createGuest() {
    // Generates random guest username
    let username;
    let existingUsername;

    // Does the below while existingUsername is empty
    do {
        // Generate a short random ID
        const guestId = crypto
            .randomBytes(4)
            .toString("hex")
            .toUpperCase();

        username = `Guest_${guestId}`;
        // If user already exists, stores in existingUsername variable
        existingUsername = await getUserByUsername(username);

    } while (existingUsername);

    // Creates guest user and stores userid
    const userid = Number(await createGuestUser(username));

    // Sets starting game data
    const money = GameConfig.STARTING_MONEY;
    const webdollars = GameConfig.STARTING_WEBDOLLARS;
    const level = GameConfig.STARTING_LEVEL;
    const websiteCount = 0;
    const teamCount = 0;

    // Stores starting game data in db
    await createUserData(
        userid,
        money,
        webdollars,
        level,
        websiteCount,
        teamCount,
    );

    // Generate JWT Token from userid
    const token = generateToken(userid);

    // Returns data to whoever called createGuest()
    return {
        token,

        player: {
            userid,
            username,
            email: null,

            money,
            webdollars,
            level,
            websiteCount,
            teamCount
        }
    };
}