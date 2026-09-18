-- US-26: allow a new application only after the previous application was rejected,
-- while preserving all application history.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM applications
        WHERE status = 'ACTIVE'
        GROUP BY job_id, candidate_id
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Cannot create active application index: duplicate ACTIVE applications exist';
    END IF;
END $$;

-- V3 created an unconditional unique constraint. Drop it by its stable PostgreSQL
-- generated name before replacing it with the business rule below.
ALTER TABLE applications
    DROP CONSTRAINT IF EXISTS applications_job_id_candidate_id_key;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM applications a
        LEFT JOIN hiring_rounds r ON r.id = a.current_round_id
        WHERE a.current_round_id IS NOT NULL AND r.id IS NULL
    ) THEN
        RAISE EXCEPTION 'Cannot add current round foreign key: orphan application round references exist';
    END IF;
END $$;

ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS consent_accepted BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS consent_accepted_at TIMESTAMP;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_applications_current_round_id'
    ) THEN
        ALTER TABLE applications
            ADD CONSTRAINT fk_applications_current_round_id
            FOREIGN KEY (current_round_id) REFERENCES hiring_rounds(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uk_applications_active_job_candidate
    ON applications(job_id, candidate_id)
    WHERE status = 'ACTIVE';

CREATE TABLE IF NOT EXISTS application_answers (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    form_field_id BIGINT NOT NULL REFERENCES form_fields(id) ON DELETE RESTRICT,
    answer_value TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_application_answers_application_field UNIQUE (application_id, form_field_id)
);

CREATE INDEX IF NOT EXISTS idx_application_answers_application_id
    ON application_answers(application_id);
CREATE INDEX IF NOT EXISTS idx_application_answers_form_field_id
    ON application_answers(form_field_id);
