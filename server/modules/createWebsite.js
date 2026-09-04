/*
PURPOSE: Validates and creates a new website with db transaction.

INPUT: Authenticated userid, domain, TLD and site type.
OUTPUT: Newly created website and updated player data.
FUNCTIONS: createWebsite().
DATA: Websites and user_data database tables.
*/


import { dbpool } from "../database/connection.js";
import { GameConfig } from "../game/config.js";


export async function createWebsite(userid, data) {
	// Checks input data
    if (!data) {
        throw new Error("No website data provided.");
    }

	// Gets all inputs and cleans them
    const domain =
        typeof data.domain === "string"
            ? data.domain.trim().toLowerCase()
            : "";

    const tld =
        typeof data.tld === "string"
            ? data.tld.trim().toLowerCase()
            : "";

    const siteType =
        typeof data.siteType === "string"
            ? data.siteType.trim()
            : "";

    // Validates domain
    if (!domain) {
        throw new Error("Domain name is required.");
    }
    if (domain.length < 3) {
        throw new Error(
            "Domain name must be at least 3 characters."
        );
    }
    if (domain.length > 16) {
        throw new Error(
            "Domain name must be 16 characters or less."
        );
    }
    if (!/^[a-zA-Z0-9-]+$/.test(domain)) {
        throw new Error(
            "Domain name can only contain letters, numbers and hyphens."
        );
    }

	// Validates tld
    const tldOption = GameConfig.TLD_OPTIONS[tld];
    if (!tldOption) {
        throw new Error("Invalid domain extension.");
    }

    // Gets tld cost from server config
    const tldCost = Number(tldOption.cost);

    // Validates website type
    const typeOption = GameConfig.SITE_TYPES[siteType];
    if (!typeOption) {
        throw new Error("Invalid website type.");
    }

	// Sets starting values from config
	const visitorsPerHour = GameConfig.STARTING_VISITORS_PER_HOUR;
	const profitPerHour = GameConfig.STARTING_PROFIT_PER_HOUR;
	const version = GameConfig.STARTING_VERSION;

    // Database transaction to create website and update user data
    let connection;

    try {
        // Gets dedicated database connection and starts transaction
        connection = await dbpool.getConnection();
        await connection.beginTransaction();

        // Checks domain against database for duplicates
        const existingWebsite = await connection.query(`
            SELECT siteid
            FROM websites
            WHERE domain = ?
            AND tld = ?
            LIMIT 1
        `, [
            domain,
            tld
        ]);

        if (existingWebsite.length > 0) {
            throw new Error(
                "That domain is already registered."
            );
        }

        // Checks and charges user for the TLD cost, if not enough money, affected rows will be 0 and throw error
        const moneyResult = await connection.query(`
            UPDATE user_data
            SET money = money - ?
            WHERE userid = ?
            AND money >= ?
        `, [
            tldCost,
            userid,
            tldCost
        ]);

        if (moneyResult.affectedRows !== 1) {
            throw new Error(
                "You do not have enough money."
            );
        }

        // Creates website in database
        const websiteResult = await connection.query(`
            INSERT INTO websites (
                userid,
                domain,
                tld,
                site_type,
                version,
                visitors_per_hour,
                profit_per_hour
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            userid,
            domain,
            tld,
            siteType,
            version,
            visitorsPerHour,
            profitPerHour
        ]);

        // Gets user data after website creation to return updated money
        const playerData = await connection.query(`
            SELECT
                money
            FROM user_data
            WHERE userid = ?
        `, [
            userid
        ]);

        // Commits transaction
        await connection.commit();

        // Returns newly created website data
        return {
            siteid: Number(websiteResult.insertId),
            domain,
            tld,
            siteType,
            version,
            visitorsPerHour,
            profitPerHour,

            money: Number(playerData[0].money)
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