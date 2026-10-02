-- US-36: persist asynchronous matching runs and company-scoped candidate suggestions.
ALTER TABLE email_templates
    DROP CONSTRAINT IF EXISTS email_templates_type_check;

ALTER TABLE email_templates
    ADD CONSTRAINT ck_email_templates_type
        CHECK (type IN ('APPLICATION_RECEIVED', 'PASS', 'FAIL', 'INTERVIEW_INVITE', 'OFFER', 'AI_MATCH_INVITE'));

CREATE TABLE ai_matching_runs (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    requested_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'QUEUED'
        CHECK (status IN ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED')),
    min_score NUMERIC(5, 2) NOT NULL DEFAULT 70.00 CHECK (min_score >= 0 AND min_score <= 100),
    result_limit SMALLINT NOT NULL DEFAULT 10 CHECK (result_limit BETWEEN 1 AND 10),
    force_rerun BOOLEAN NOT NULL DEFAULT FALSE,
    provider_code VARCHAR(100),
    provider_source VARCHAR(50),
    model_name VARCHAR(100),
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    lease_until TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_matching_runs_queue
    ON ai_matching_runs(status, created_at, id);
CREATE INDEX idx_ai_matching_runs_job
    ON ai_matching_runs(company_id, job_id, created_at DESC, id DESC);
CREATE UNIQUE INDEX uq_ai_matching_runs_active_job
    ON ai_matching_runs(company_id, job_id)
    WHERE status IN ('QUEUED', 'PROCESSING');

CREATE TABLE ai_suggestions (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id BIGINT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    source_application_id BIGINT REFERENCES applications(id) ON DELETE SET NULL,
    run_id BIGINT NOT NULL REFERENCES ai_matching_runs(id) ON DELETE CASCADE,
    matching_score NUMERIC(5, 2) NOT NULL CHECK (matching_score >= 0 AND matching_score <= 100),
    matched_skills TEXT NOT NULL DEFAULT '[]',
    strengths TEXT NOT NULL DEFAULT '[]',
    reason TEXT,
    recent_application_at TIMESTAMP NOT NULL,
    contact_status VARCHAR(20) NOT NULL DEFAULT 'NOT_CONTACTED'
        CHECK (contact_status IN ('NOT_CONTACTED', 'CONTACTED')),
    contacted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_ai_suggestions_job_candidate UNIQUE (job_id, candidate_id),
    CONSTRAINT ck_ai_suggestions_contacted_at
        CHECK ((contact_status = 'NOT_CONTACTED' AND contacted_at IS NULL)
            OR (contact_status = 'CONTACTED' AND contacted_at IS NOT NULL))
);

CREATE INDEX idx_ai_suggestions_company_job_score
    ON ai_suggestions(company_id, job_id, matching_score DESC, id);
CREATE INDEX idx_ai_suggestions_candidate
    ON ai_suggestions(company_id, candidate_id, recent_application_at DESC);
