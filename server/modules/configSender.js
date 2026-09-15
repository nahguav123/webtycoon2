/*
PURPOSE: Gets all configuration options ready to be sent to client.

INPUT: tld options and site types.
OUTPUT: tld options and site types.
FUNCTIONS: websiteCreationOptions().
DATA: Website creation options.
*/


import { GameConfig } from "../game/config.js";


// Function to return tld options and site types.
export function websiteCreationOptions() {
	return {
		tlds: GameConfig.TLD_OPTIONS,
		defaultTld: GameConfig.DEFAULT_TLD,
		siteTypes: GameConfig.SITE_TYPES,
		defaultSiteType: GameConfig.DEFAULT_SITE_TYPE,
		hostingPlans: GameConfig.HOSTING_PLANS,
		defaultHostingPlan: GameConfig.DEFAULT_HOSTING_PLAN
    };
}