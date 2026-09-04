/*
PURPOSE: Reads player game data.

INPUT: User ID and game values.
OUTPUT: Player game data/database updates.
FUNCTIONS: getUserData(), saveUserData().
DATA: user_data table.
*/


import { dbpool } from "./connection.js";


// Returns user data for specified userid
export async function getUserDataDB(userid) {
    const rows = await dbpool.query(`
        SELECT
            userid,
            money,
            webdollars,
            level,
            website_count AS websiteCount,
            team_count AS teamCount,
            last_tick AS lastTick
        FROM user_data
        WHERE userid = ?
    `, [userid]);

    return rows[0] || null;
}

// Updates the user data for specified userid - note all values are added to the existing values in the db, not replaced
export async function saveUserDataDB(moneyAmount, webdollarsAmount, level, websiteCount, teamCount, userid) {
    await dbpool.query(`
        UPDATE user_data
        SET 
            money = money + ?,
            webdollars = webdollars + ?,
            level = level + ?,
            website_count = website_count + ?,
            team_count = team_count + ?,
            last_tick = NOW()
        WHERE userid = ?
    `, [
        moneyAmount,
        webdollarsAmount,
        level,
        websiteCount,
        teamCount,
        userid
    ]);
}
