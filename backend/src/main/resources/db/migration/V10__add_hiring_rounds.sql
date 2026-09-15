-- US-16: các vòng tuyển dụng được quản lý độc lập cho từng job.
CREATE TABLE hiring_rounds (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    pass_email_template_id BIGINT,
    fail_email_template_id BIGINT,
    test_link TEXT,
    is_final_round BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hiring_rounds_job_active
    ON hiring_rounds(job_id, is_deleted, order_index);
CREATE INDEX idx_applications_current_round_id
    ON applications(current_round_id);
