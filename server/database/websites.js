/*
PURPOSE: Reads player websites.

INPUT: User ID and site ID.
OUTPUT: Website list or single website.
FUNCTIONS: getWebsitesList(), getWebsiteData().
DATA: websites table.
*/


import { dbpool } from "./connection.js";


// Returns a list of websites owned by specified userid
export async function getWebsitesList(userid) { // Implement tokens into this in future
    const rows = await dbpool.query(`
        SELECT
            siteid,
            domain,
            tld,
            created_at AS createdAt,
            version,
            visitors_per_hour AS visitorsPerHour,
            profit_per_hour AS profitPerHour
        FROM websites
        WHERE userid = ?
    `, [userid]);

    return rows;
}

// Returns data from a single website owned by specified userid
export async function getWebsiteData(userid, siteid) {
    const rows = await dbpool.query(`
        SELECT
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