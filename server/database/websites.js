/*
PURPOSE: Reads and creates player websites in the database.

INPUT: User ID, site ID and website creation data.
OUTPUT: Websites list, Single website details.
FUNCTIONS: getWebsitesListDB(), getWebsiteDataDB(), getWebsiteByDomainDB().
DATA: websites table.
*/


import { dbpool } from "./connection.js";


// Returns a list of websites owned by specified userid
export async function getWebsitesListDB(userid) {
    const rows = await dbpool.query(`
        SELECT
            siteid,
            domain,
            tld,
			site_type AS siteType,
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
export async function getWebsiteDataDB(userid, siteid) {
    const rows = await dbpool.query(`
        SELECT
            domain,
            tld,
			site_type AS siteType,
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

// Returns website if it exists by domain/tld check
export async function getWebsiteByDomainDB(domain, tld) { 
	const rows = await dbpool.query(` 
		SELECT 
			siteid 
		FROM websites
		WHERE domain = ? 
		AND tld = ? 
		LIMIT 1
	`, [
		domain,
		tld 
	]); 
	
	return rows[0] || null; 
}