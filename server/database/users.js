import { dbpool } from "../fileRouter.js";

// ==========================================
// USERS
// ==========================================

// await getUserById(userid); returns the user with the specified ID
export async function getUserById(userid) {
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

// await getUserByUsername(username); returns the user with the specified username
export async function getUserByUsername(username) {
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

// await getUserByEmail(email);
export async function getUserByEmail(email) {
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

// await createUser(username, email, passwordHash); creates a new user on the db
export async function createUser(username, email, passwordHash) {
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

