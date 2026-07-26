-- Kogoh — Production readiness: PRD fields, security, indexes, RLS performance
-- Apply after 004_coach_team_registration.sql

-- =============================================================================
-- TEAMS: church + contact (PRD §8.2 / CDC §4.3)
-- =============================================================================

ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS church TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT;

UPDATE teams
SET church = COALESCE(church, 'À renseigner')
WHERE church IS NULL;

UPDATE teams
SET contact_phone = COALESCE(contact_phone, '')
WHERE contact_phone IS NULL;

ALTER TABLE teams
  ALTER COLUMN church SET NOT NULL,
  ALTER COLUMN church SET DEFAULT '';

ALTER TABLE teams
  ALTER COLUMN contact_phone SET NOT NULL,
  ALTER COLUMN contact_phone SET DEFAULT '';

-- =============================================================================
-- ROSTER: position / poste (CDC §4.4 Art. 7)
-- =============================================================================

ALTER TABLE roster_members
  ADD COLUMN IF NOT EXISTS position TEXT;

-- =============================================================================
-- DROP leftover junk table
-- =============================================================================

DROP TABLE IF EXISTS public.foot;

-- =============================================================================
-- SECURITY: payment_receipt_seq — internal sequence only (SECURITY DEFINER)
-- =============================================================================

ALTER TABLE payment_receipt_seq ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE payment_receipt_seq FROM anon, authenticated, PUBLIC;
GRANT ALL ON TABLE payment_receipt_seq TO postgres, service_role;

-- =============================================================================
-- FUNCTIONS: immutable search_path + revoke public EXECUTE on helpers
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION generate_payment_receipt_number()
RETURNS TRIGGER AS $$
DECLARE
  current_year INTEGER;
  next_val INTEGER;
BEGIN
  IF NEW.receipt_number IS NOT NULL AND NEW.receipt_number <> '' THEN
    RETURN NEW;
  END IF;

  current_year := EXTRACT(YEAR FROM NOW())::INTEGER;

  INSERT INTO payment_receipt_seq (year, last_value)
  VALUES (current_year, 1)
  ON CONFLICT (year) DO UPDATE
    SET last_value = payment_receipt_seq.last_value + 1
  RETURNING last_value INTO next_val;

  NEW.receipt_number := 'PAY-' || current_year::TEXT || '-' || LPAD(next_val::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION check_roster_limits()
RETURNS TRIGGER AS $$
DECLARE
  total_count INTEGER;
  player_count INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE member_type = 'player')
  INTO total_count, player_count
  FROM roster_members
  WHERE team_id = COALESCE(NEW.team_id, OLD.team_id)
    AND (TG_OP = 'DELETE' OR id <> NEW.id);

  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    total_count := total_count + 1;
    IF NEW.member_type = 'player' THEN
      player_count := player_count + 1;
    END IF;
  END IF;

  IF total_count > 16 THEN
    RAISE EXCEPTION 'Effectif maximum de 16 membres atteint';
  END IF;

  IF player_count > 12 THEN
    RAISE EXCEPTION 'Maximum de 12 joueurs atteint';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- RLS helper functions must be executable by anon+authenticated (policies call them).
-- Trigger-only functions stay locked down.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_payment_receipt_number() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_user_role() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_committee_or_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff_role() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.owns_team(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_team_first_match_at(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_roster_editable(UUID) TO anon, authenticated, service_role;

-- =============================================================================
-- INDEXES: cover foreign keys used in joins / filters
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_matches_home_team_id ON matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_away_team_id ON matches(away_team_id);
CREATE INDEX IF NOT EXISTS idx_claims_submitted_by ON claims(submitted_by);
CREATE INDEX IF NOT EXISTS idx_claims_decided_by ON claims(decided_by);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_payments_recorded_by ON payments(recorded_by);
CREATE INDEX IF NOT EXISTS idx_payments_team_reference ON payments(team_id, reference);

-- =============================================================================
-- RLS PERFORMANCE: wrap auth.uid() in (select ...) to evaluate once per query
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING ((select auth.uid()) = id OR is_staff_role());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING ((select auth.uid()) = id)
  WITH CHECK (
    (select auth.uid()) = id
    AND role = (SELECT role FROM profiles WHERE id = (select auth.uid()))
  );

DROP POLICY IF EXISTS "Anyone can view approved teams" ON teams;
CREATE POLICY "Anyone can view approved teams"
  ON teams FOR SELECT
  USING (
    status = 'approved'
    OR coach_id = (select auth.uid())
    OR is_staff_role()
  );

DROP POLICY IF EXISTS "Coaches can insert own team" ON teams;
CREATE POLICY "Coaches can insert own team"
  ON teams FOR INSERT
  WITH CHECK (coach_id = (select auth.uid()) AND get_user_role() = 'coach');

DROP POLICY IF EXISTS "Coaches can update own team" ON teams;
CREATE POLICY "Coaches can update own team"
  ON teams FOR UPDATE
  USING (
    (coach_id = (select auth.uid()) AND status IN ('draft', 'rejected', 'submitted'))
    OR is_committee_or_admin()
  )
  WITH CHECK (
    is_committee_or_admin()
    OR (
      coach_id = (select auth.uid())
      AND status IN ('draft', 'rejected', 'submitted')
    )
  );

DROP POLICY IF EXISTS "Coaches submit claims" ON claims;
CREATE POLICY "Coaches submit claims"
  ON claims FOR INSERT
  WITH CHECK (owns_team(team_id) AND submitted_by = (select auth.uid()));

DROP POLICY IF EXISTS "Users insert own audit logs" ON audit_logs;
CREATE POLICY "Users insert own audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

-- =============================================================================
-- STORAGE: remove broad SELECT that allows listing all public bucket objects.
-- Public object URLs (/object/public/...) still work without a SELECT policy.
-- =============================================================================

DROP POLICY IF EXISTS "Public read roster photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated read roster photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read documents" ON storage.objects;
