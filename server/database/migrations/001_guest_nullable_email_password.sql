-- Guests are created with no email and no password (see modules/createGuest.js),
-- so both columns need to allow NULL. Run this once against an existing database.
-- Fresh installs that import webtycoon.sql already have this change.

ALTER TABLE users
    MODIFY email VARCHAR(255) NULL,
    MODIFY password_hash VARCHAR(255) NULL;
