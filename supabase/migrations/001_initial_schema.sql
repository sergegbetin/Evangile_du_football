-- Kogoh Tournament Platform — Initial Schema
-- Édition Vacances 2026

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role AS ENUM (
  'coach',
  'committee',
  'referee',
  'discipline',
  'super_admin'
);

CREATE TYPE team_status AS ENUM (
  'draft',
  'submitted',
  'approved',
  'rejected'
);

CREATE TYPE member_type AS ENUM (
  'player',
  'coach',
  'assistant_coach',
  'staff'
);

CREATE TYPE payment_type AS ENUM (
  'registration',
  'participation'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'confirmed',
  'cancelled'
);

CREATE TYPE claim_status AS ENUM (
  'received',
  'in_review',
  'decided'
);

CREATE TYPE claim_decision AS ENUM (
  'pending',
  'accepted',
  'rejected'
);

CREATE TYPE match_status AS ENUM (
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
  'postponed'
);

-- =============================================================================
-- TABLES
-- =============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'coach',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  status team_status NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT teams_name_unique UNIQUE (name),
  CONSTRAINT teams_coach_id_unique UNIQUE (coach_id)
);

CREATE TABLE roster_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  member_type member_type NOT NULL DEFAULT 'player',
  jersey_number INTEGER CHECK (jersey_number IS NULL OR (jersey_number >= 1 AND jersey_number <= 99)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT roster_jersey_unique UNIQUE (team_id, jersey_number)
);

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  away_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  venue TEXT NOT NULL DEFAULT 'CEG Godomey',
  round TEXT,
  home_score INTEGER CHECK (home_score IS NULL OR home_score >= 0),
  away_score INTEGER CHECK (away_score IS NULL OR away_score >= 0),
  status match_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT matches_different_teams CHECK (home_team_id <> away_team_id)
);

CREATE TABLE payment_receipt_seq (
  year INTEGER PRIMARY KEY,
  last_value INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  payment_type payment_type NOT NULL,
  amount_fcfa INTEGER NOT NULL CHECK (amount_fcfa > 0),
  status payment_status NOT NULL DEFAULT 'pending',
  receipt_number TEXT NOT NULL UNIQUE,
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  recorded_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  match_id UUID REFERENCES matches(id) ON DELETE RESTRICT,
  submitted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status claim_status NOT NULL DEFAULT 'received',
  decision claim_decision NOT NULL DEFAULT 'pending',
  decision_notes TEXT,
  decided_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_teams_coach_id ON teams(coach_id);
CREATE INDEX idx_teams_status ON teams(status);
CREATE INDEX idx_roster_members_team_id ON roster_members(team_id);
CREATE INDEX idx_matches_scheduled_at ON matches(scheduled_at);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_payments_team_id ON payments(team_id);
CREATE INDEX idx_claims_team_id ON claims(team_id);
CREATE INDEX idx_claims_match_id ON claims(match_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_documents_is_public ON documents(is_public);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER roster_members_updated_at
  BEFORE UPDATE ON roster_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate receipt number PAY-2026-XXXXXX
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_receipt_number
  BEFORE INSERT ON payments
  FOR EACH ROW EXECUTE FUNCTION generate_payment_receipt_number();

-- Create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    'coach'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Roster limits: max 16 members, max 12 players
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER roster_limits_check
  BEFORE INSERT OR UPDATE ON roster_members
  FOR EACH ROW EXECUTE FUNCTION check_roster_limits();

-- =============================================================================
-- HELPER FUNCTIONS FOR RLS
-- =============================================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_committee_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('committee', 'super_admin')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_staff_role()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('committee', 'referee', 'discipline', 'super_admin')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION owns_team(team_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_uuid AND coach_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE roster_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_staff_role());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Staff can update any profile role"
  ON profiles FOR UPDATE
  USING (is_committee_or_admin());

-- Teams
CREATE POLICY "Anyone can view approved teams"
  ON teams FOR SELECT
  USING (
    status = 'approved'
    OR coach_id = auth.uid()
    OR is_staff_role()
  );

CREATE POLICY "Coaches can insert own team"
  ON teams FOR INSERT
  WITH CHECK (coach_id = auth.uid() AND get_user_role() = 'coach');

CREATE POLICY "Coaches can update own draft/rejected team"
  ON teams FOR UPDATE
  USING (
    (coach_id = auth.uid() AND status IN ('draft', 'rejected'))
    OR is_committee_or_admin()
  );

CREATE POLICY "Committee can delete teams"
  ON teams FOR DELETE
  USING (is_committee_or_admin());

-- Roster members
CREATE POLICY "View roster for accessible teams"
  ON roster_members FOR SELECT
  USING (
    owns_team(team_id)
    OR EXISTS (SELECT 1 FROM teams WHERE id = team_id AND status = 'approved')
    OR is_staff_role()
  );

CREATE POLICY "Coaches manage own team roster"
  ON roster_members FOR INSERT
  WITH CHECK (
    owns_team(team_id)
    AND EXISTS (SELECT 1 FROM teams WHERE id = team_id AND status IN ('draft', 'rejected'))
  );

CREATE POLICY "Coaches update own team roster"
  ON roster_members FOR UPDATE
  USING (
    owns_team(team_id)
    AND EXISTS (SELECT 1 FROM teams WHERE id = team_id AND status IN ('draft', 'rejected'))
  );

CREATE POLICY "Coaches delete from own team roster"
  ON roster_members FOR DELETE
  USING (
    owns_team(team_id)
    AND EXISTS (SELECT 1 FROM teams WHERE id = team_id AND status IN ('draft', 'rejected'))
  );

-- Matches (public read for scheduled/completed)
CREATE POLICY "Anyone can view matches"
  ON matches FOR SELECT
  USING (TRUE);

CREATE POLICY "Committee manages matches"
  ON matches FOR INSERT
  WITH CHECK (is_committee_or_admin());

CREATE POLICY "Committee updates matches"
  ON matches FOR UPDATE
  USING (is_committee_or_admin());

CREATE POLICY "Committee deletes matches"
  ON matches FOR DELETE
  USING (is_committee_or_admin());

-- Payments (manual by committee only for write)
CREATE POLICY "Coaches view own team payments"
  ON payments FOR SELECT
  USING (owns_team(team_id) OR is_committee_or_admin());

CREATE POLICY "Committee records payments"
  ON payments FOR INSERT
  WITH CHECK (is_committee_or_admin());

CREATE POLICY "Committee updates payments"
  ON payments FOR UPDATE
  USING (is_committee_or_admin());

-- Claims
CREATE POLICY "View claims for own team or staff"
  ON claims FOR SELECT
  USING (owns_team(team_id) OR is_staff_role());

CREATE POLICY "Coaches submit claims"
  ON claims FOR INSERT
  WITH CHECK (owns_team(team_id) AND submitted_by = auth.uid());

CREATE POLICY "Staff process claims"
  ON claims FOR UPDATE
  USING (is_staff_role());

-- Documents
CREATE POLICY "Public documents visible to all"
  ON documents FOR SELECT
  USING (is_public = TRUE OR is_staff_role());

CREATE POLICY "Committee manages documents"
  ON documents FOR INSERT
  WITH CHECK (is_committee_or_admin());

CREATE POLICY "Committee updates documents"
  ON documents FOR UPDATE
  USING (is_committee_or_admin());

CREATE POLICY "Committee deletes documents"
  ON documents FOR DELETE
  USING (is_committee_or_admin());

-- Audit logs (staff read, system insert via service role)
CREATE POLICY "Staff view audit logs"
  ON audit_logs FOR SELECT
  USING (is_staff_role());

CREATE POLICY "Users insert own audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
