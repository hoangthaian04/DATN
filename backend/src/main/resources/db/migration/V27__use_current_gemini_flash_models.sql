-- Move only the system default away from models rejected for this API key.
-- Company-specific provider settings are intentionally left unchanged.
UPDATE ai_providers
SET model_name = 'gemini-3.8-flash',
    updated_at = CURRENT_TIMESTAMP
WHERE company_id IS NULL
  AND provider_code = 'GEMINI'
  AND status = 'ACTIVE'
  AND model_name IN (
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-3-flash-preview',
      'gemini-flash-latest'
  );
