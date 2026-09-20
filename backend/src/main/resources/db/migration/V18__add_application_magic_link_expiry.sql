ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS token_expiry_at TIMESTAMP;

UPDATE applications
SET token_expiry_at = applied_at + INTERVAL '30 days'
WHERE secure_token IS NOT NULL
  AND token_expiry_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_applications_secure_token
    ON applications(secure_token);
