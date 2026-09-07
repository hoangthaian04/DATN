-- V3__init_dashboard_tables.sql
-- Khởi tạo các bảng phục vụ tính năng Dashboard (Jobs, Candidates, Applications, Interviews)

-- 1. Bảng jobs
CREATE TABLE IF NOT EXISTS jobs (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category_id BIGINT,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT,
    benefits TEXT,
    salary_min DECIMAL,
    salary_max DECIMAL,
    currency VARCHAR(10) DEFAULT 'VND',
    location VARCHAR(255),
    working_type VARCHAR(50),
    employment_type VARCHAR(50),
    experience_level VARCHAR(50),
    experience_years_min INT,
    round_count INT DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    published_at TIMESTAMP,
    closed_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (company_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- 2. Bảng candidates
CREATE TABLE IF NOT EXISTS candidates (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (company_id, email)
);

CREATE INDEX IF NOT EXISTS idx_candidates_company_id ON candidates(company_id);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);

-- 3. Bảng applications
CREATE TABLE IF NOT EXISTS applications (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id BIGINT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    current_round_id BIGINT,
    current_step INT DEFAULT 0,
    cv_url TEXT,
    cover_letter TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    source VARCHAR(100) DEFAULT 'CAREER_SITE',
    secure_token VARCHAR(255) UNIQUE,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (job_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_company_id ON applications(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- 4. Bảng interviews
CREATE TABLE IF NOT EXISTS interviews (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    round_id BIGINT,
    scheduled_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    interview_time TIMESTAMP NOT NULL,
    duration INT,
    location VARCHAR(255),
    note TEXT,
    candidate_note TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    secure_token VARCHAR(255) UNIQUE,
    token_expiry_at TIMESTAMP,
    reschedule_time TIMESTAMP,
    reschedule_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interviews_company_id ON interviews(company_id);
CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_time ON interviews(interview_time);
