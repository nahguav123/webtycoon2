/*
PURPOSE: Charges for and updates a website domain.
INPUT: Authenticated userid, siteid, domain, tld and whether this is a renewal.
OUTPUT: Updated website domain state.
*/

import { dbpool } from "../database/connection.js";
import { GameConfig } from "../game/config.js";


// Needs working on
export async function websiteDomain(
    userid,
    siteid,
    domain,
    tld,
    renewal = false
) {
    domain = typeof domain === "string"
        ? domain.trim().toLowerCase()
        : "";

    tld = typeof tld === "string"
        ? tld.trim().toLowerCase()
        : "";

    if (!/^[a-z0-9-]{3,16}$/.test(domain)) {
        throw new Error("Invalid domain name.");
    }

    if (!GameConfig.TLD_OPTIONS[tld]) {
        throw new Error("Invalid domain extension.");
    }

    const connection = await dbpool.getConnection();

    try {
        await connection.beginTransaction();

        const rows = await connection.query(`
            SELECT domain, tld, domain_expires_at
            FROM websites
            WHERE userid = ? AND siteid = ?
            LIMIT 1
        `, [userid, siteid]);

        const website = rows[0];

        if (!website) {
            throw new Error("Website not found.");
        }

        const selectedDomain = renewal
            ? website.domain
            : domain;

        const selectedTld = renewal
            ? website.tld
            : tld;

        const selectedTldOption =
            GameConfig.TLD_OPTIONS[selectedTld];

        if (!selectedTldOption) {
            throw new Error("Invalid domain extension.");
        }

        const duplicate = await connection.query(`
            SELECT siteid
            FROM websites
            WHERE domain = ?
              AND tld = ?
              AND siteid <> ?
            LIMIT 1
        `, [
            selectedDomain,
            selectedTld,
            siteid
        ]);

        if (duplicate.length) {
            throw new Error("That domain is already registered.");
        }

        const charge = Number(selectedTldOption.cost || 0);

        if (charge > 0) {
            const moneyResult = await connection.query(`
                UPDATE user_data
                SET money = money - ?
                WHERE userid = ?
                  AND money >= ?
            `, [
                charge,
                userid,
                charge
            ]);

            if (moneyResult.affectedRows !== 1) {
                throw new Error("You do not have enough money.");
            }
        }

        const existingExpiry = website.domain_expires_at
            ? new Date(website.domain_expires_at).getTime()
            : 0;

        const base = renewal
            ? Math.max(
                Date.now(),
                Number.isFinite(existingExpiry)
                    ? existingExpiry
                    : 0
            )
            : Date.now();

        const expires = new Date(
            base +
            GameConfig.DOMAIN_DURATION_HOURS *
            60 *
            60 *
            1000
        );

        const result = await connection.query(`
            UPDATE websites
            SET domain = ?,
                tld = ?,
                domain_expires_at = ?
            WHERE userid = ?
              AND siteid = ?
        `, [
            selectedDomain,
            selectedTld,
            expires,
            userid,
            siteid
        ]);

        if (result.affectedRows !== 1) {
            throw new Error("Failed to update domain.");
        }

        const moneyRows = await connection.query(`
            SELECT money
            FROM user_data
            WHERE userid = ?
            LIMIT 1
        `, [userid]);

        await connection.commit();

        return {
            domain: selectedDomain,
            tld: selectedTld,
            expiresAt: expires,
            money: Number(moneyRows[0]?.money ?? 0),
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}