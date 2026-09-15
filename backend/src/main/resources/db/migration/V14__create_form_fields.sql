-- US-15: dynamic application form fields per job.
-- Soft delete keeps historical application answers addressable after a field is removed.
CREATE TABLE IF NOT EXISTS form_fields (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    field_name VARCHAR(255) NOT NULL,
    label VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    options TEXT,
    order_index INT NOT NULL DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_form_fields_type CHECK (field_type IN ('TEXT', 'TEXTAREA', 'URL', 'FILE', 'SELECT'))
);

CREATE INDEX IF NOT EXISTS idx_form_fields_job_visibility_order
    ON form_fields(job_id, company_id, is_deleted, order_index, id);

CREATE UNIQUE INDEX IF NOT EXISTS uk_form_fields_job_field_name_active
    ON form_fields(job_id, field_name)
    WHERE is_deleted = FALSE;
