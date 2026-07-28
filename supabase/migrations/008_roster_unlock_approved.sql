-- Kogoh — Déverrouillage de l'effectif des équipes approved.
-- Apply after 007_payment_declaration.sql
--
-- Décision comité : une équipe approved reste éditable jusqu'à 24h avant son
-- premier match (verrou temporel uniquement). Aligne la fonction RLS
-- is_roster_editable() sur src/lib/tournament-rules.ts#isRosterLocked.

CREATE OR REPLACE FUNCTION is_roster_editable(team_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  team_status_val team_status;
  first_match_at TIMESTAMPTZ;
BEGIN
  SELECT status INTO team_status_val FROM teams WHERE id = team_uuid;

  IF team_status_val IS NULL
     OR team_status_val NOT IN ('draft', 'rejected', 'submitted', 'approved') THEN
    RETURN FALSE;
  END IF;

  first_match_at := get_team_first_match_at(team_uuid);

  IF first_match_at IS NULL THEN
    RETURN TRUE;
  END IF;

  RETURN NOW() < (first_match_at - INTERVAL '24 hours');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;
