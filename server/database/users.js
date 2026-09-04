/*
PURPOSE: Reads user accounts.

INPUT: User ID, username, email or account details.
OUTPUT: User records/new user ID.
FUNCTIONS: getUserById(), getUserByUsername(), getUserByEmail(), createGuestUser().
DATA: users table.
*/


import { dbpool } from "./connection.js";


// Returns user with specified userid
export async function getUserByIdDB(userid) {
    const rows = await dbpool.query(`
        SELECT
            userid,
            username,
            email,
            password_hash AS passwordHash,
            created_at AS createdAt
        FROM users
        WHERE userid = ?
        LIMIT 1
    `, [userid]);

    return rows[0] || null;
}

// Returns user with specified username
export async function getUserByUsernameDB(username) {
    const rows = await dbpool.query(`
        SELECT
            userid,
            username,
            email,
            password_hash AS passwordHash,
            created_at AS createdAt
        FROM users
        WHERE username = ?
        LIMIT 1
    `, [username]);

    return rows[0] || null;
}

// Returns user with specified email
export async function getUserByEmailDB(email) {
    const rows = await dbpool.query(`
        SELECT
            userid,
            username,
            email,
            password_hash AS passwordHash,
            created_at AS createdAt
        FROM users
        WHERE email = ?
        LIMIT 1
    `, [email]);

    return rows[0] || null;
}

