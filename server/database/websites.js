import { dbpool } from "./connection.js";

// ========================================

// await getWebsitesList(userid); returns a list of websites owned by specific user from the db
export async function getWebsitesList(userid) {
    const rows = await dbpool.query(`
        SELECT
            siteid,
            userid,
            domain,
            tld,
            created_at AS createdAt,
            version,
            visitors_per_hour AS visitorsPerHour,
            profit_per_hour AS profitPerHour
        FROM websites
        WHERE userid = ?
    `, [userid]);

    return rows || null;
}

// await getWebsiteData(userid, siteid); returns data from a single website owned by specific user from the db
export async function getWebsiteData(userid, siteid) {
    const rows = await dbpool.query(`
        SELECT
            siteid,
            userid,
            domain,
            tld,
            created_at AS createdAt,
            version,
            visitors_per_hour AS visitorsPerHour,
            profit_per_hour AS profitPerHour
        FROM websites
        WHERE userid = ?
        AND siteid = ?

    `, [userid, siteid]);

    return rows[0] || null;
}