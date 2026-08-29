/*
PURPOSE: Creates a registered player.

INPUT: Username, email and password.
OUTPUT: New player data.
FUNCTIONS: createPlayer().
DATA: User account + starting game data.
*/


import bcrypt from "bcrypt";

import { getUserByUsernameDB, getUserByEmailDB, createUserDB } from "../database/users.js";
import { createUserDataDB } from "../database/userData.js";
import { GameConfig } from "../game/config.js";


export async function createPlayer(data) {
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

    const email =
        typeof data.email === "string"
            ? data.email.trim().toLowerCase()
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
    if (username.length < 3) {
        throw new Error(
            "Username must be at least 3 characters."
        );
    }
    if (username.length > 20) {
        throw new Error(
            "Username must be 20 characters or less."
        );
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error(
            "Username can only contain letters, numbers and underscores."
        );
    }

    // Validates email
    if (!email) {
        throw new Error(
            "Email is required."
        );
    }
    if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
        throw new Error(
            "Invalid email address."
        );
    }

    // Validates password
    if (!password) {
        throw new Error(
            "Password is required."
        );
    }
    if (password.length < 8) {
        throw new Error(
            "Password must be at least 8 characters."
        );
    }

    // Checks username against database for duplicates
    const existingUsername = await getUserByUsernameDB(username);
    if (existingUsername) {
        throw new Error(
            "Username is already taken."
        );
    }

    // Checks email against database for duplicates
    const existingEmail = await getUserByEmailDB(email);
    if (existingEmail) {
        throw new Error(
            "Email is already registered."
        );
    }

    // Hashes the password
    const passwordHash = await bcrypt.hash(password, 12);

   // Creates user and stores userid
    const userid = Number(await createUserDB(
        username,
        email,
        passwordHash
    ));

    // Sets starting game data
    const money = GameConfig.STARTING_MONEY;
    const webdollars = GameConfig.STARTING_WEBDOLLARS;
    const level = GameConfig.STARTING_LEVEL;
    const websiteCount = 0;
    const teamCount = 0;

    // Stores starting game data in db
    await createUserDataDB(
        userid,
        money,
        webdollars,
        level,
        websiteCount,
        teamCount
    );

    // Returns data to whoever called createPlayer()
    return {
    userid,
    username,
    email,
    
    money,
    webdollars,
    level,
    websiteCount,
    teamCount
    };
}