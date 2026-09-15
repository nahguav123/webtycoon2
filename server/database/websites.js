/*
PURPOSE: Reads and creates player websites in the database.

INPUT: User ID, site ID and website creation data.
OUTPUT: Websites list, Single website details.
FUNCTIONS: getWebsitesListDB(), getWebsiteDataDB(), getWebsiteByDomainDB().
DATA: websites table.
*/


import { dbpool } from "./connection.js";
import { GameConfig } from "../game/config.js";


// TIDY UP ALL THIS LATER, IT'S A MESS
function addMilliseconds(dateValue, hours) {
    if (!dateValue) return null;
    return new Date(new Date(dateValue).getTime() + hours * 60 * 60 * 1000);
}

function millisecondsRemaining(dateValue) {
    if (!dateValue) return 0;
    return Math.max(0, new Date(dateValue).getTime() - Date.now());
}

function buildDevelopment(row) {
    const target = GameConfig.DEV_TARGET_BASE;
    let assignments = {};
    try { assignments = row.dev_assignments ? JSON.parse(row.dev_assignments) : {}; } catch { assignments = {}; }
    const makeTrack = (track, points) => {
        const assigned = Boolean(assignments?.[track]);
        const rate = assigned ? Number(GameConfig.WORKERS[track].pointsPerHour || 0) : 0;
        return { points: Number(points || 0), target: Number(target[track]), ratePerHour: rate, effectiveRatePerHour: rate, assigned, workerName: GameConfig.WORKERS[track].name };
    };
    return {
        design: makeTrack("design", row.dev_design_points),
        frontend: makeTrack("frontend", row.dev_frontend_points),
        backend: makeTrack("backend", row.dev_backend_points),
    };
}

function buildAdvertising(value) {
    let enabled = [];
    try { enabled = value ? JSON.parse(value) : []; } catch { enabled = []; }
    const enabledIds = new Set(Array.isArray(enabled) ? enabled.map(Number) : []);
    return GameConfig.ADVERTISING_OPTIONS.map(option => ({ ...option, enabled: enabledIds.has(Number(option.id)) }));
}

function shapeWebsite(row) {
    const hostingPlan = row.hosting_plan || GameConfig.DEFAULT_HOSTING_PLAN;
    const hosting = GameConfig.HOSTING_PLANS[hostingPlan] || GameConfig.HOSTING_PLANS[GameConfig.DEFAULT_HOSTING_PLAN];
    const dev = buildDevelopment(row);
    const overallProgress = Math.round((tracksAverage(dev)) * 100) / 100;
    const target = Math.max(dev.design.target, dev.frontend.target, dev.backend.target);
    const readyToPublish = dev.design.points >= dev.design.target && dev.frontend.points >= dev.frontend.target && dev.backend.points >= dev.backend.target;
    return {
        siteid: Number(row.siteid),
        domain: row.domain,
        tld: row.tld,
        siteType: row.siteType,
        createdAt: row.createdAt,
        version: Number(row.version),
        visitorsPerHour: Number(row.visitorsPerHour || 0),
        profitPerHour: Number(row.profitPerHour || 0),
        hostingOption: hostingPlan,
        hostingRemainingMs: millisecondsRemaining(row.hosting_expires_at),
        domainRemainingMs: millisecondsRemaining(row.domain_expires_at),
        dev,
        overallProgress: target ? overallProgress : 0,
        readyToPublish,
        advertising: buildAdvertising(row.advertising),
    };
}

function tracksAverage(dev) {
    const values = Object.values(dev).map(item => Math.min(1, Number(item.points) / Math.max(1, Number(item.target))));
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}





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
            profit_per_hour AS profitPerHour,
            hosting_plan,
            hosting_expires_at,
            domain_expires_at,
            dev_design_points,
            dev_frontend_points,
            dev_backend_points,
            advertising
        FROM websites
        WHERE userid = ?
        AND siteid = ?
    `, [userid, siteid]);

    return rows[0] ? shapeWebsite(rows[0]) : null;
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

//TIDY UP ALL THIS LATER, IT'S A MESS - MOVE TO MODULES INSTEAD FOR EACH TASK
export async function updateWebsiteHostingDB(userid, siteid, plan) {
    const hosting = GameConfig.HOSTING_PLANS[plan];
    if (!hosting) throw new Error("Invalid hosting plan.");
    const rows = await dbpool.query(`SELECT hosting_expires_at FROM websites WHERE userid = ? AND siteid = ?`, [userid, siteid]);
    if (!rows[0]) throw new Error("Website not found.");
    const now = Date.now();
    const existing = rows[0].hosting_expires_at ? new Date(rows[0].hosting_expires_at).getTime() : 0;
    const base = Math.max(now, existing);
    const expires = new Date(base + hosting.hours * 3600000);
    const result = await dbpool.query(`
        UPDATE websites SET hosting_plan = ?, hosting_expires_at = ?
        WHERE userid = ? AND siteid = ?
    `, [plan, expires, userid, siteid]);
    if (result.affectedRows !== 1) throw new Error("Failed to update hosting.");
}

export async function updateWebsiteDomainDB(userid, siteid, domain, tld) {
    if (!domain || !/^[a-zA-Z0-9-]{3,16}$/.test(domain)) throw new Error("Invalid domain name.");
    if (!GameConfig.TLD_OPTIONS[tld]) throw new Error("Invalid domain extension.");
    const duplicate = await dbpool.query(`SELECT siteid FROM websites WHERE domain = ? AND tld = ? AND siteid <> ? LIMIT 1`, [domain, tld, siteid]);
    if (duplicate.length) throw new Error("That domain is already registered.");
    const result = await dbpool.query(`
        UPDATE websites SET domain = ?, tld = ?, domain_expires_at = ?
        WHERE userid = ? AND siteid = ?
    `, [domain, tld, addMilliseconds(new Date(), GameConfig.DOMAIN_DURATION_HOURS), userid, siteid]);
    if (result.affectedRows !== 1) throw new Error("Website not found.");
}

export async function setWebsiteAdvertisingDB(userid, siteid, optionId, enabled) {
    const option = GameConfig.ADVERTISING_OPTIONS.find(item => Number(item.id) === Number(optionId));
    if (!option) throw new Error("Invalid advertising option.");
    const rows = await dbpool.query(`SELECT advertising FROM websites WHERE userid = ? AND siteid = ?`, [userid, siteid]);
    if (!rows[0]) throw new Error("Website not found.");
    let ids = [];
    try { ids = rows[0].advertising ? JSON.parse(rows[0].advertising) : []; } catch { ids = []; }
    ids = Array.isArray(ids) ? ids.map(Number) : [];
    const set = new Set(ids);
    if (enabled) set.add(Number(optionId)); else set.delete(Number(optionId));
    await dbpool.query(`UPDATE websites SET advertising = ? WHERE userid = ? AND siteid = ?`, [JSON.stringify([...set]), userid, siteid]);
}

export async function setWebsiteDevAssignmentDB(userid, siteid, track, assigned) {
    if (!GameConfig.WORKERS[track]) throw new Error("Invalid development track.");
    const rows = await dbpool.query(`SELECT dev_assignments FROM websites WHERE userid = ? AND siteid = ?`, [userid, siteid]);
    if (!rows[0]) throw new Error("Website not found.");
    let assignments = {};
    try { assignments = rows[0].dev_assignments ? JSON.parse(rows[0].dev_assignments) : {}; } catch { assignments = {}; }
    assignments[track] = Boolean(assigned);
    await dbpool.query(`UPDATE websites SET dev_assignments = ? WHERE userid = ? AND siteid = ?`, [JSON.stringify(assignments), userid, siteid]);
}

export async function publishWebsiteVersionDB(userid, siteid) {
    const website = await getWebsiteDataDB(userid, siteid);
    if (!website) throw new Error("Website not found.");
    if (!website.readyToPublish) throw new Error("All development tracks must be complete before publishing.");
    const result = await dbpool.query(`
        UPDATE websites SET version = version + 1, visitors_per_hour = ROUND(visitors_per_hour * ?),
            dev_design_points = 0, dev_frontend_points = 0, dev_backend_points = 0
        WHERE userid = ? AND siteid = ?
    `, [GameConfig.PUBLISH_VISITORS_PER_HOUR_GAIN, userid, siteid]);
    if (result.affectedRows !== 1) throw new Error("Failed to publish version.");
}