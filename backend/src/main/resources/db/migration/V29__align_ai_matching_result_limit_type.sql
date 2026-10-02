-- Keep the persisted request limit aligned with AiMatchingRunEntity's Integer field.
-- This is a widening conversion from SMALLINT and preserves existing values.
ALTER TABLE ai_matching_runs
    ALTER COLUMN result_limit TYPE INTEGER
    USING result_limit::INTEGER;
