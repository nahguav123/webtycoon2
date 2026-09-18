/*
PURPOSE: Charges for and updates website hosting - renewal or new plan.
INPUT: Authenticated userid, siteid, hosting plan and whether this is a renewal.
OUTPUT: Updated website hosting state.
*/

import { dbpool } from "../db";
import { GameConfig } from "../config";

// Needs working on
export async function websiteHosting(userid, siteid, plan, renewal = false) {
    const hosting = GameConfig.HOSTING_PLANS[plan];
    if (!hosting) throw new Error("Invalid hosting plan.");

    const connection = await dbpool.getConnection();

    try {
        await connection.beginTransaction();

        const rows = await connection.query(`
            SELECT hosting_plan, hosting_expires_at
            FROM websites
            WHERE userid = ? AND siteid = ?
            LIMIT 1
        `, [userid, siteid]);

        const website = rows[0];
        if (!website) throw new Error("Website not found.");

        const selectedPlan = renewal ? website.hosting_plan : plan;
        const selectedHosting = GameConfig.HOSTING_PLANS[selectedPlan];

        if (!selectedHosting) {
            throw new Error("Invalid hosting plan.");
        }

        const charge = Number(selectedHosting.cost || 0);

        if (charge > 0) {
            const moneyResult = await connection.query(`
                UPDATE user_data
                SET money = money - ?
                WHERE userid = ? AND money >= ?
            `, [charge, userid, charge]);

            if (moneyResult.affectedRows !== 1) {
                throw new Error("You do not have enough money.");
            }
        }

        const existingExpiry = website.hosting_expires_at
            ? new Date(website.hosting_expires_at).getTime()
            : 0;

        const base = Math.max(
            Date.now(),
            Number.isFinite(existingExpiry) ? existingExpiry : 0
        );

        const expires = new Date(
            base + Number(selectedHosting.hours) * 60 * 60 * 1000
        );

        const result = await connection.query(`
            UPDATE websites
            SET hosting_plan = ?, hosting_expires_at = ?
            WHERE userid = ? AND siteid = ?
        `, [selectedPlan, expires, userid, siteid]);

        if (result.affectedRows !== 1) {
            throw new Error("Failed to update hosting.");
        }

        const moneyRows = await connection.query(`
            SELECT money
            FROM user_data
            WHERE userid = ?
            LIMIT 1
        `, [userid]);

        await connection.commit();

        return {
            plan: selectedPlan,
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
