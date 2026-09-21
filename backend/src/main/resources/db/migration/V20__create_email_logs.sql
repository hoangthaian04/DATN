-- US-17/US-20: retain the delivery history needed by the HR email log.
-- BIGINT is kept consistent with the current PostgreSQL schema and Java IDs.
CREATE TABLE IF NOT EXISTS email_logs (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    application_id BIGINT REFERENCES applications(id) ON DELETE SET NULL,
    recipient_email VARCHAR(255) NOT NULL,
    template_code VARCHAR(80) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS'
        CHECK (status IN ('SUCCESS', 'FAILED')),
    error_message TEXT,
    attempt_count INT NOT NULL DEFAULT 1 CHECK (attempt_count > 0),
    sent_at TIMESTAMP,
    retried_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_logs_company_created
    ON email_logs(company_id, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_company_status
    ON email_logs(company_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_application
    ON email_logs(application_id, created_at DESC);
