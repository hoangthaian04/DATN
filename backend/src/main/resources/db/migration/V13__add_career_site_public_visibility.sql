-- US-25/US-33: Career Site must have an explicit public visibility flag.
ALTER TABLE career_sites
    ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;
