CREATE TABLE email_templates (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    template_name VARCHAR(120) NOT NULL,
    type VARCHAR(40) NOT NULL CHECK (type IN ('APPLICATION_RECEIVED', 'PASS', 'FAIL', 'INTERVIEW_INVITE', 'OFFER')),
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    variables TEXT NOT NULL DEFAULT '[]',
    template_scope VARCHAR(10) NOT NULL DEFAULT 'CUSTOM' CHECK (template_scope IN ('SYSTEM', 'CUSTOM')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_templates_company_type ON email_templates(company_id, is_deleted, type);
CREATE UNIQUE INDEX uq_email_templates_company_name_active
    ON email_templates(company_id, LOWER(TRIM(template_name))) WHERE is_deleted = FALSE;

ALTER TABLE hiring_rounds
    ADD CONSTRAINT fk_hiring_rounds_pass_email_template
    FOREIGN KEY (pass_email_template_id) REFERENCES email_templates(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE hiring_rounds
    ADD CONSTRAINT fk_hiring_rounds_fail_email_template
    FOREIGN KEY (fail_email_template_id) REFERENCES email_templates(id) ON DELETE RESTRICT NOT VALID;
