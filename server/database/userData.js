import { dbpool } from "../fileRouter.js";

// ==========================================
// USER GAME DATA
// ==========================================

// await getUserData(userid); returns the user data for a specific user from the db
export async function getUserData(userid) {
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


// Create initial game data for a new user
export async function createUserData(userid, money, webdollars, level, websiteCount, teamCount) {
    await dbpool.query(`
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
}


// await saveUserData(moneyAmount, webdollarsAmount, level, websiteCount, teamCount, userid); updates the user data for a specific user in the db - note all values are added to the existing values in the db, not replaced
export async function saveUserData(moneyAmount, webdollarsAmount, level, websiteCount, teamCount, userid) {
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
