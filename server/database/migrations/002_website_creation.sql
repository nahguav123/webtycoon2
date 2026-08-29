-- Websites that are created need to be unique based on domain and tld and websites needs a sitetype column.
-- Run this once against an existing database.
-- Fresh installs that import webtycoon.sql already have this change.

ALTER TABLE websites
	ADD COLUMN site_type VARCHAR(50) NOT NULL AFTER tld;

ALTER TABLE websites
	ADD UNIQUE KEY unique_domain_tld (domain, tld);