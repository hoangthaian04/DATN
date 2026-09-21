-- US-12/US-13: optional application window for a Job.
ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS start_date DATE,
    ADD COLUMN IF NOT EXISTS end_date DATE;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM jobs
        WHERE start_date IS NOT NULL AND end_date IS NOT NULL AND end_date < start_date
    ) THEN
        RAISE EXCEPTION 'Cannot add job application window constraint: end_date is before start_date';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_jobs_application_window'
    ) THEN
        ALTER TABLE jobs ADD CONSTRAINT ck_jobs_application_window
            CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date);
    END IF;
END $$;
