-- AI provider metadata and synchronous CV analysis history.
-- API secrets are never seeded here; the system default Gemini key is supplied
-- through GEMINI_API_KEY at runtime.

CREATE TABLE IF NOT EXISTS ai_providers (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES companies(id) ON DELETE CASCADE,
    provider_name VARCHAR(100) NOT NULL,
    provider_code VARCHAR(100) NOT NULL,
    api_key_encrypted TEXT,
    model_name VARCHAR(100),
    max_daily_requests INT NOT NULL DEFAULT 100,
    max_reruns_per_candidate INT NOT NULL DEFAULT 3,
    daily_token_budget INT NOT NULL DEFAULT 200000,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_ai_providers_company_code
    ON ai_providers(company_id, provider_code)
    WHERE company_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_ai_providers_system_code
    ON ai_providers(provider_code)
    WHERE company_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_ai_providers_company_status
    ON ai_providers(company_id, status, provider_code);

INSERT INTO ai_providers (
    company_id,
    provider_name,
    provider_code,
    model_name,
    status
)
SELECT NULL, 'Google Gemini', 'GEMINI', 'gemini-2.5-flash', 'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1
    FROM ai_providers
    WHERE company_id IS NULL
      AND provider_code = 'GEMINI'
);

CREATE TABLE IF NOT EXISTS cv_analyses (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    matching_score NUMERIC(5, 2),
    matched_skills TEXT,
    missing_skills TEXT,
    strengths TEXT,
    weaknesses TEXT,
    summary TEXT,
    provider_code VARCHAR(100) NOT NULL,
    provider_source VARCHAR(50) NOT NULL,
    model_name VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_cv_analyses_matching_score
        CHECK (matching_score IS NULL OR (matching_score >= 0 AND matching_score <= 100)),
    CONSTRAINT ck_cv_analyses_status
        CHECK (status IN ('COMPLETED', 'FAILED'))
);

CREATE INDEX IF NOT EXISTS idx_cv_analyses_company_application
    ON cv_analyses(company_id, application_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cv_analyses_latest_success
    ON cv_analyses(application_id, status, created_at DESC);
