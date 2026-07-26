-- Coach team registration: fix RLS submit transition + roster while pending review

DROP POLICY IF EXISTS "Coaches can update own draft/rejected team" ON teams;

CREATE POLICY "Coaches can update own team"
  ON teams FOR UPDATE
  USING (
    (coach_id = auth.uid() AND status IN ('draft', 'rejected', 'submitted'))
    OR is_committee_or_admin()
  )
  WITH CHECK (
    is_committee_or_admin()
    OR (
      coach_id = auth.uid()
      AND status IN ('draft', 'rejected', 'submitted')
    )
  );

CREATE OR REPLACE FUNCTION is_roster_editable(team_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  team_status_val team_status;
  first_match_at TIMESTAMPTZ;
BEGIN
  SELECT status INTO team_status_val FROM teams WHERE id = team_uuid;

  IF team_status_val IS NULL OR team_status_val NOT IN ('draft', 'rejected', 'submitted') THEN
    RETURN FALSE;
  END IF;

  first_match_at := get_team_first_match_at(team_uuid);

  IF first_match_at IS NULL THEN
    RETURN TRUE;
  END IF;

  RETURN NOW() < (first_match_at - INTERVAL '24 hours');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;
