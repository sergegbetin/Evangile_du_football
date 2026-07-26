-- Kogoh — Security hardening & data integrity (apply after 001_initial_schema.sql)

-- =============================================================================
-- SIGNUP: prevent role escalation via auth metadata
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    'coach'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================================================
-- TEAMS: one team per coach (idempotent — 001 may already define this constraint)
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'teams_coach_id_unique'
  ) THEN
    ALTER TABLE teams ADD CONSTRAINT teams_coach_id_unique UNIQUE (coach_id);
  END IF;
END $$;

-- =============================================================================
-- CLAIMS: link to match for 24h deadline enforcement
-- =============================================================================

ALTER TABLE claims
  ADD COLUMN IF NOT EXISTS match_id UUID REFERENCES matches(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_claims_match_id ON claims(match_id);

-- =============================================================================
-- AUDIT LOGS: users may only insert rows attributed to themselves
-- =============================================================================

DROP POLICY IF EXISTS "Authenticated users insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users insert own audit logs" ON audit_logs;

CREATE POLICY "Users insert own audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
