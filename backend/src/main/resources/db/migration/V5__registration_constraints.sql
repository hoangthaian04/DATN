-- Fail explicitly if old data contains duplicate non-null tax codes; do not delete registrations.
CREATE UNIQUE INDEX uk_companies_tax_code ON companies(tax_code);
UPDATE applications SET status='ACTIVE' WHERE status='NEW';
ALTER TABLE applications ALTER COLUMN status SET DEFAULT 'ACTIVE';
