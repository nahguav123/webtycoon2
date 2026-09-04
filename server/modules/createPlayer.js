/*
PURPOSE: Creates a registered player with db transaction.

INPUT: Username, email and password.
OUTPUT: New player data.
FUNCTIONS: createPlayer().
DATA: User account + starting game data.
*/


import bcrypt from "bcrypt";

import { dbpool } from "../database/connection.js";
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

    // Hashes the password before opening a database transaction 
    const passwordHash = await bcrypt.hash(password, 12);

    // Sets starting game data
    const money = GameConfig.STARTING_MONEY;
    const webdollars = GameConfig.STARTING_WEBDOLLARS;
    const level = GameConfig.STARTING_LEVEL;
    const websiteCount = 0;
    const teamCount = 0;

    // Database transaction to create user and starting user data 
    let connection;

    try {
        // Gets dedicated database connection and starts transaction
        connection = await dbpool.getConnection(); 
        await connection.beginTransaction();

        // Checks username against database for duplicates
        const existingUsername = await connection.query(` 
            SELECT 
                userid 
            FROM users 
            WHERE username = ? 
            LIMIT 1
        `, [ 
            username 
        ]);

        if (existingUsername.length > 0) { 
            throw new Error("Username is already taken." ); 
        }

        // Checks email against database for duplicates 
        const existingEmail = await connection.query(` 
            SELECT 
                userid 
            FROM users 
            WHERE email = ? 
            LIMIT 1
        `, [ 
            email 
        ]); 
        
        if (existingEmail.length > 0) { 
            throw new Error( "Email is already registered." ); 
        }

        // Creates user in database 
        const userResult = await connection.query(` 
            INSERT INTO users ( 
                username, 
                email, 
                password_hash 
            ) 
            VALUES (?, ?, ?)
        `, [ 
            username, 
            email, 
            passwordHash 
        ]);

        // Stores newly created userid 
        const userid = Number(userResult.insertId);

        // Creates starting game data in database 
        await connection.query(` 
            INSERT INTO user_data ( 
                userid, 
                money, 
                webdollars, 
                level, 
                website_count, 
                team_count, 
                last_tick 
            ) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [ 
            userid, 
            money, 
            webdollars, 
            level, 
            websiteCount, 
            teamCount 
        ]);

        // Commits transaction
        await connection.commit();

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

    } catch (error) { 
        // Rolls back all database changes in case of error 
        if (connection) { 
            await connection.rollback(); 
        } 
        throw error; 

    } finally { 
        // Releases database connection 
        if (connection) { 
            await connection.release(); 
        } 
    } 
}







