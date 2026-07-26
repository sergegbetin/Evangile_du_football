-- Kogoh — PRD compliance: roster photos, payment reference, match end time,
-- storage buckets, and RLS hardening (apply after 002_security_and_integrity.sql)

-- =============================================================================
-- ROSTER MEMBERS: mandatory photo (PRD §"photo obligatoire, au minimum pour joueurs")
-- =============================================================================

ALTER TABLE roster_members
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- =============================================================================
-- MATCHES: exact end time for accurate 24h claim-deadline enforcement
-- =============================================================================

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;

-- =============================================================================
-- PAYMENTS: explicit reference field (PRD entity "Paiement: ..., référence, ...")
-- =============================================================================

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS reference TEXT NOT NULL DEFAULT '';

ALTER TABLE payments
  ALTER COLUMN reference DROP DEFAULT;

-- =============================================================================
-- ROSTER TIME-LOCK: enforce the 24h-before-first-match lock at the DB level,
-- mirroring src/lib/tournament-rules.ts#isRosterLocked. Defined before the
-- storage policies below, which depend on is_roster_editable().
-- =============================================================================

CREATE OR REPLACE FUNCTION get_team_first_match_at(team_uuid UUID)
RETURNS TIMESTAMPTZ AS $$
  SELECT MIN(scheduled_at) FROM matches
  WHERE (home_team_id = team_uuid OR away_team_id = team_uuid)
    AND status NOT IN ('cancelled');
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_roster_editable(team_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  team_status_val team_status;
  first_match_at TIMESTAMPTZ;
BEGIN
  SELECT status INTO team_status_val FROM teams WHERE id = team_uuid;

  IF team_status_val IS NULL OR team_status_val NOT IN ('draft', 'rejected') THEN
    RETURN FALSE;
  END IF;

  first_match_at := get_team_first_match_at(team_uuid);

  IF first_match_at IS NULL THEN
    RETURN TRUE;
  END IF;

  RETURN NOW() < (first_match_at - INTERVAL '24 hours');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

DROP POLICY IF EXISTS "Coaches manage own team roster" ON roster_members;
CREATE POLICY "Coaches manage own team roster"
  ON roster_members FOR INSERT
  WITH CHECK (owns_team(team_id) AND is_roster_editable(team_id));

DROP POLICY IF EXISTS "Coaches update own team roster" ON roster_members;
CREATE POLICY "Coaches update own team roster"
  ON roster_members FOR UPDATE
  USING (owns_team(team_id) AND is_roster_editable(team_id));

DROP POLICY IF EXISTS "Coaches delete from own team roster" ON roster_members;
CREATE POLICY "Coaches delete from own team roster"
  ON roster_members FOR DELETE
  USING (owns_team(team_id) AND is_roster_editable(team_id));

-- =============================================================================
-- STORAGE BUCKETS: roster photos + public documents
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'roster-photos',
  'roster-photos',
  TRUE,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  TRUE,
  10485760, -- 10 MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Roster photos: public read, coaches upload/manage only for their own team's
-- folder (path prefix = team_id) while the roster is still editable.
DROP POLICY IF EXISTS "Public read roster photos" ON storage.objects;
CREATE POLICY "Public read roster photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'roster-photos');

DROP POLICY IF EXISTS "Coaches upload own team roster photos" ON storage.objects;
CREATE POLICY "Coaches upload own team roster photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'roster-photos'
    AND owns_team((storage.foldername(name))[1]::uuid)
    AND is_roster_editable((storage.foldername(name))[1]::uuid)
  );

DROP POLICY IF EXISTS "Coaches manage own team roster photos" ON storage.objects;
CREATE POLICY "Coaches manage own team roster photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'roster-photos'
    AND (owns_team((storage.foldername(name))[1]::uuid) OR is_committee_or_admin())
  );

-- Documents: public read, committee-only write.
DROP POLICY IF EXISTS "Public read documents" ON storage.objects;
CREATE POLICY "Public read documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Committee upload documents" ON storage.objects;
CREATE POLICY "Committee upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND is_committee_or_admin());

DROP POLICY IF EXISTS "Committee delete documents" ON storage.objects;
CREATE POLICY "Committee delete documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND is_committee_or_admin());

-- =============================================================================
-- CLAIMS: processing (decisions) is a committee-only action in the app
-- (requireCommittee in src/lib/actions/claims.ts) — tighten RLS to match,
-- referees/discipline keep read-only visibility via "View claims for own
-- team or staff".
-- =============================================================================

DROP POLICY IF EXISTS "Staff process claims" ON claims;
CREATE POLICY "Committee process claims"
  ON claims FOR UPDATE
  USING (is_committee_or_admin());
