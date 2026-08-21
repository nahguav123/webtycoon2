// This module handles the creation of a new guest player.
// Guests do not require an email address or password.
// A temporary username is generated and the guest receives
// the standard starting game data.

//Functions:
//function createGuest()

import crypto from "crypto";

import { getUserByUsername, createGuestUser } from "../database/users.js";

import { saveUserData } from "../database/userData.js";

import { GameConfig } from "../game/config.js";

export async function createGuest() {

    // ==========================================
    // GENERATE GUEST USERNAME
    // ==========================================

    let username;
    let existingUsername;

    do {

        // Generate a short random ID
        const guestId = crypto
            .randomBytes(4)
            .toString("hex")
            .toUpperCase();

        username = `Guest_${guestId}`;

        existingUsername = await getUserByUsername(username);

    } while (existingUsername);


    // ==========================================
    // CREATE USER
    // ==========================================

    const userid = Number(
        await createGuestUser(username)
    );


    // ==========================================
    // CREATE GAME DATA
    // ==========================================

    // Starting player values
    const money = GameConfig.STARTING_MONEY;
    const webdollars = GameConfig.STARTING_WEBDOLLARS;

    const level = GameConfig.STARTING_LEVEL;

    const websiteCount = 0;
    const teamCount = 0;


    await createUserData(
        userid,
        money,
        webdollars,
        level,
        websiteCount,
        teamCount,
    );


    // ==========================================
    // RETURN DATA TO PLAYER
    // ==========================================

    return {
        userid,
        username,
        money,
        webdollars,
        level,
        websiteCount,
        teamCount
    };

}