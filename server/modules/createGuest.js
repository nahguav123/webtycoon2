/*
PURPOSE: Creates a guest player with db transaction.

INPUT: None.
OUTPUT: Guest player data + JWT.
FUNCTIONS: createGuest().
DATA: Generated username + starting game data.
*/


import crypto from "crypto";
import { dbpool } from "../database/connection.js";
import { GameConfig } from "../game/config.js";
import { generateToken } from "../auth/auth.js";


export async function createGuest() {
    // Sets starting game data
    const money = GameConfig.STARTING_MONEY;
    const webdollars = GameConfig.STARTING_WEBDOLLARS;
    const level = GameConfig.STARTING_LEVEL;
    const websiteCount = 0;
    const teamCount = 0;

    // Database transaction to create guest user and starting user data 
    let connection;

    try {
        // Gets dedicated database connection and starts transaction
        connection = await dbpool.getConnection(); 
        await connection.beginTransaction();

        // Generates random guest username
        let username;
        let existingUsername;

        // Keeps generating a username until one is not already in the database
        do {
            // Generate a short random ID
            const guestId = crypto
                .randomBytes(4)
                .toString("hex")
                .toUpperCase();

            username = `Guest_${guestId}`;

            // Checks username against database for duplicates
            const rows = await connection.query(` 
                SELECT 
                    userid 
                FROM users 
                WHERE username = ? 
                LIMIT 1
            `, [ 
                username 
            ]);

            existingUsername = rows[0] || null;

        } while (existingUsername);

        // Creates guest user in database 
        const userResult = await connection.query(` 
            INSERT INTO users ( 
                username, 
                email, 
                password_hash 
            ) 
            VALUES (?, NULL, NULL)
        `, [ 
            username 
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

        // Commits both database inserts 
        await connection.commit();

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