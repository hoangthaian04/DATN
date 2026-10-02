-- V24 pinned the system provider to the preview model after a temporary model
-- availability check. Keep the active system provider on the stable Flash model
-- and let the runtime client use the configured fallback model when necessary.
UPDATE ai_providers
SET model_name = 'gemini-2.5-flash',
    updated_at = CURRENT_TIMESTAMP
WHERE company_id IS NULL
  AND provider_code = 'GEMINI'
  AND status = 'ACTIVE'
  AND model_name IN ('gemini-3-flash-preview', 'gemini-flash-latest', 'gemini-2.5-flash');
