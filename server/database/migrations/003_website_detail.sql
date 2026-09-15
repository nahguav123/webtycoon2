-- SiteDetail persistent state. Run once on an existing Web Tycoon database.
ALTER TABLE websites
    ADD COLUMN hosting_plan VARCHAR(100) NOT NULL DEFAULT 'Shared Hosting 1',
    ADD COLUMN hosting_expires_at DATETIME NULL,
    ADD COLUMN domain_expires_at DATETIME NULL,
    ADD COLUMN dev_design_points INT UNSIGNED NOT NULL DEFAULT 0,
    ADD COLUMN dev_frontend_points INT UNSIGNED NOT NULL DEFAULT 0,
    ADD COLUMN dev_backend_points INT UNSIGNED NOT NULL DEFAULT 0,
    ADD COLUMN dev_assignments LONGTEXT NULL,
    ADD COLUMN advertising LONGTEXT NULL;

UPDATE websites
SET hosting_expires_at = DATE_ADD(created_at, INTERVAL 24 HOUR)
WHERE hosting_expires_at IS NULL;

UPDATE websites
SET domain_expires_at = DATE_ADD(created_at, INTERVAL 72 HOUR)
WHERE domain_expires_at IS NULL;

UPDATE websites
SET dev_assignments = '{}'
WHERE dev_assignments IS NULL;

UPDATE websites
SET advertising = '[]'
WHERE advertising IS NULL;
