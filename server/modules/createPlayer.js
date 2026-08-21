// This module handles the creation of a new player account in the game. 
// It validates the input data, checks for existing usernames and emails in the database, 
// hashes the password, and creates a new user record.

import bcrypt from "bcrypt";

import { getUserByUsername, getUserByEmail, createUser } from "../database/users.js";

import { createUserData } from "../database/userData.js";

import { GameConfig } from "../game/config.js";

// Validate email
function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}


// ==========================================
// CREATE PLAYER
// ==========================================
export async function createPlayer(data) {
    // VALIDATE INPUT
    if (!data) {
        throw new Error(
            "No player data provided."
        );
    }

    // Get all inputs
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

    // ==========================================
    // VALIDATION
    // ==========================================
    // Username
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

    // Email
    if (!email) {
        throw new Error(
            "Email is required."
        );
    }

    if (!isValidEmail(email)) {
        throw new Error(
            "Invalid email address."
        );
    }

    // Password
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

    // ==========================================
    // DATABASE CHECKS
    // ==========================================
    //Username
    const existingUsername = await getUserByUsername(username);

    if (existingUsername) {
        throw new Error(
            "Username is already taken."
        );
    }

    //Email
    const existingEmail = await getUserByEmail(email);

    if (existingEmail) {
        throw new Error(
            "Email is already registered."
        );
    }

    // ==============
    // Hash Password
    const passwordHash = await bcrypt.hash(password, 12);

   // ===========
   // Create User
    const userid = Number(await createUser(
        username,
        email,
        passwordHash
    ));


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
        teamCount
    );


    // =========
    // Return data to player frontend
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