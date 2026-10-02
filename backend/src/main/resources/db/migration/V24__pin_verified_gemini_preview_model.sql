-- V23 moved the seeded provider to gemini-flash-latest, but that alias was
-- temporarily overloaded for the configured project. Pin the model that was
-- verified with the current key and the application's structured-output schema.
UPDATE ai_providers
SET model_name = 'gemini-3-flash-preview',
    updated_at = CURRENT_TIMESTAMP
WHERE company_id IS NULL
  AND provider_code = 'GEMINI'
  AND status = 'ACTIVE'
  AND model_name IN ('gemini-2.5-flash', 'gemini-flash-latest');
