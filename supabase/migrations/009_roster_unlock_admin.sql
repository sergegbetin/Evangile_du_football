-- Kogoh — Déverrouillage effectif admin + verrou sur prochain match.
-- Apply after 008_roster_unlock_approved.sql
--
-- 1) teams.roster_unlocked_until : le comité peut ouvrir l'effectif temporairement
-- 2) get_team_first_match_at : prochain match non joué (pas un match déjà completed)
-- 3) is_roster_editable : unlock admin OU règle 24h avant prochain match

ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS roster_unlocked_until TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION get_team_first_match_at(team_uuid UUID)
RETURNS TIMESTAMPTZ AS $$
  SELECT MIN(scheduled_at) FROM matches
  WHERE (home_team_id = team_uuid OR away_team_id = team_uuid)
    AND status NOT IN ('cancelled', 'completed')
    AND scheduled_at > NOW();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_roster_editable(team_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  team_status_val team_status;
  unlocked_until TIMESTAMPTZ;
  first_match_at TIMESTAMPTZ;
BEGIN
  SELECT status, roster_unlocked_until
  INTO team_status_val, unlocked_until
  FROM teams
  WHERE id = team_uuid;

  IF team_status_val IS NULL
     OR team_status_val NOT IN ('draft', 'rejected', 'submitted', 'approved') THEN
    RETURN FALSE;
  END IF;

  IF unlocked_until IS NOT NULL AND NOW() < unlocked_until THEN
    RETURN TRUE;
  END IF;

  first_match_at := get_team_first_match_at(team_uuid);

  IF first_match_at IS NULL THEN
    RETURN TRUE;
  END IF;

  RETURN NOW() < (first_match_at - INTERVAL '24 hours');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;
