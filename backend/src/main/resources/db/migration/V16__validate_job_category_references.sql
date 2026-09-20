-- The category foreign key was introduced by V11. Keep this validation in a
-- new migration so an already-applied V11 remains checksum-stable.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM jobs j
        LEFT JOIN job_categories c ON c.id = j.category_id
        WHERE j.category_id IS NOT NULL
          AND c.id IS NULL
    ) THEN
        RAISE EXCEPTION
            'Cannot continue migrations: jobs.category_id contains orphan references';
    END IF;
END $$;
