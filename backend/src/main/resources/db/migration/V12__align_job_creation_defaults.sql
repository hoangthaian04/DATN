-- US-12/US-14: new Jobs start as INACTIVE and have no configured rounds yet.
-- Existing rows are intentionally not changed.
ALTER TABLE jobs ALTER COLUMN status SET DEFAULT 'INACTIVE';
ALTER TABLE jobs ALTER COLUMN round_count SET DEFAULT 0;
