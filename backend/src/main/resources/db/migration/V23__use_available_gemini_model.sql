-- Keep the system provider aligned with the model configured for the local/runtime key.
-- V22 seeded gemini-2.5-flash, which may be listed by the key but is not available
-- for generateContent in the current Gemini project. The stable alias below is
-- resolved by Gemini to the currently available Flash model.
UPDATE ai_providers
SET model_name = 'gemini-flash-latest',
    updated_at = CURRENT_TIMESTAMP
WHERE company_id IS NULL
  AND provider_code = 'GEMINI'
  AND status = 'ACTIVE'
  AND model_name = 'gemini-2.5-flash';
