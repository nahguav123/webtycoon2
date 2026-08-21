// This module handles the login of a player account in the game. 
// It validates the input data, checks for existing usernames and passwords in the database, 
// and returns the player data if the login is successful.

import bcrypt from "bcrypt";

import { getUserByUsername } from "../database/users.js";

import { getUserData } from "../database/userData.js";


// ==========================================
// LOGIN PLAYER
// ==========================================
export async function loginPlayer(data) {
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

    // Password
    if (!password) {
        throw new Error(
            "Password is required."
        );
    }

    // ==========================================
    // DATABASE CHECKS
    // ==========================================
    //Username
    const existingUsername = await getUserByUsername(username);

    if (!existingUsername) {
        throw new Error("Invalid username or password.");
    }

    // ==============
    // Check Password
    const passwordMatch = await bcrypt.compare(password, existingUsername.passwordHash);

    if (!passwordMatch) {
        throw new Error("Invalid username or password");
    }

   // ===========
   // Login User
    const userid = Number(existingUsername.userid);
    const email = existingUsername.email;


    // ==========================================
    // GET GAME DATA
    // ==========================================

    const userData = await getUserData(userid);

    if (!userData) {
        throw new Error("Player game data not found.");
    }


    // =========
    // Return data to player frontend
    return {

    userid,
    username,
    email,
    money: userData.money,
    webdollars: userData.webdollars,
    level: userData.level,
    websiteCount: userData.websiteCount,
    teamCount: userData.teamCount
    };

}