ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS industry VARCHAR(255);
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS company_size VARCHAR(255);
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS business_type VARCHAR(255);
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE career_sites ADD COLUMN IF NOT EXISTS logo_url TEXT;
UPDATE career_sites SET logo_url = (SELECT p.logo_url FROM company_profiles p WHERE p.company_id = career_sites.company_id);
-- Promote only the original registering HR, retaining other members as HR.
UPDATE users SET role = 'HR_ADMIN' WHERE role = 'HR'
AND id IN (SELECT MIN(id) FROM users WHERE role = 'HR' GROUP BY company_id);
UPDATE users SET status = 'PENDING' WHERE status = 'ACTIVE' AND company_id IN
(SELECT id FROM companies WHERE status IN ('PENDING','REJECTED'));
CREATE TABLE IF NOT EXISTS audit_logs (
 id BIGSERIAL PRIMARY KEY,
 company_id BIGINT REFERENCES companies(id) ON DELETE SET NULL,
 actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
 actor_role VARCHAR(50),
 action VARCHAR(100) NOT NULL,
 target_type VARCHAR(100) NOT NULL,
 target_id BIGINT,
 metadata TEXT,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company ON audit_logs(company_id);
