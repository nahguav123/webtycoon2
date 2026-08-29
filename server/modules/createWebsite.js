/*
PURPOSE: Validates and creates a new website.

INPUT: Authenticated userid, domain, TLD and site type.
OUTPUT: Newly created website.
FUNCTIONS: createWebsite().
DATA: Database data.
*/

import { createWebsiteDB, getWebsiteByDomainDB } from "../database/websites.js";
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

    // Validates website type
    const typeOption = GameConfig.SITE_TYPES[siteType];
    if (!typeOption) {
        throw new Error("Invalid website type.");
    }

    // Checks domain against database for duplicates
    const existingWebsite = await getWebsiteByDomainDB(domain, tld);
    if (existingWebsite) {
        throw new Error(
            "That domain is already registered."
        );
    }

	// Sets starting values from config
	const visitorsPerHour = GameConfig.STARTING_VISITORS_PER_HOUR;
	const profitPerHour = GameConfig.STARTING_PROFIT_PER_HOUR;
	const version = GameConfig.STARTING_VERSION;

    // Creates website
    const website = await createWebsiteDB(
        userid,
        domain,
        tld,
        siteType,
		version,
		visitorsPerHour,
		profitPerHour
    );

    return website;
}