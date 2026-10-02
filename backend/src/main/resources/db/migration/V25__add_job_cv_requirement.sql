ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS requires_cv BOOLEAN;

UPDATE jobs
SET requires_cv = TRUE
WHERE requires_cv IS NULL;

ALTER TABLE jobs
    ALTER COLUMN requires_cv SET DEFAULT TRUE,
    ALTER COLUMN requires_cv SET NOT NULL;
