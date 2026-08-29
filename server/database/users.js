/*
PURPOSE: Reads and creates user accounts.

INPUT: User ID, username, email or account details.
OUTPUT: User records/new user ID.
FUNCTIONS: getUserById(), getUserByUsername(), getUserByEmail(), createUser(), createGuestUser().
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

// In the future these user creations need to also set default userData 
// values in 1 transaction because current setup can leave a user created 
// with no userData.

// Creates a new user in the db
export async function createUserDB(username, email, passwordHash) {
    const result = await dbpool.query(`
        INSERT INTO users
            (username, email, password_hash)
        VALUES
            (?, ?, ?)
    `, [
        username,
        email,
        passwordHash
    ]);

    console.log("Created user:", result.insertId);
    return result.insertId;
}

// Creates a new guest user in the db
export async function createGuestUserDB(username) {
    const result = await dbpool.query(`
        INSERT INTO users (
            username,
            email,
            password_hash
        )
        VALUES (?, NULL, NULL)
    `, [
        username
    ]);

    return result.insertId;
}

