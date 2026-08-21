// This module handles the creation of a new guest player.
// Guests do not require an email address or password.
// A temporary username is generated and the guest receives
// the standard starting game data.

import crypto from "crypto";

import {
    getUserByUsername,
    createGuestUser,
} from "../database/users.js";

import {
    saveUserData
} from "../database/userData.js";


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
    const money = 10000;
    const webdollars = 50;

    const level = 1;

    const websiteCount = 0;
    const teamCount = 0;


    await saveUserData(
        money,
        webdollars,
        level,
        websiteCount,
        teamCount,
        userid
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