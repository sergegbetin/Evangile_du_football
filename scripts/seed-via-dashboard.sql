-- Kogoh — Seed demo data WITHOUT service_role key
-- Use this if you cannot copy the secret key from the dashboard.
--
-- STEP 1 (Dashboard UI, not SQL):
--   Authentication → Users → Add user (×3)
--   | Email            | Password     |
--   | coach@kogoh.bj   | Coach2026!   |
--   | coach2@kogoh.bj  | Coach2026!   |
--   | comite@kogoh.bj  | Comite2026!  |
--   Check "Auto confirm user" for each.
--
-- STEP 2: Run this file in SQL Editor.

UPDATE profiles SET role = 'committee', full_name = 'Secrétariat Kogoh', phone = '01 62 93 91 66'
WHERE email = 'comite@kogoh.bj';

UPDATE profiles SET full_name = 'Jean Kouassi', phone = '01 62 93 91 66'
WHERE email = 'coach@kogoh.bj';

UPDATE profiles SET full_name = 'Marie Adébayor', phone = '01 28 43 81 80'
WHERE email = 'coach2@kogoh.bj';

INSERT INTO teams (name, coach_id, status, church, contact_phone, submitted_at, approved_at)
SELECT 'Disciples FC', p.id, 'approved', 'Église Évangélique de Godomey', '01 62 93 91 66', NOW(), NOW()
FROM profiles p WHERE p.email = 'coach@kogoh.bj'
ON CONFLICT (name) DO NOTHING;

INSERT INTO teams (name, coach_id, status, church, contact_phone, submitted_at)
SELECT 'Aigles de Godomey', p.id, 'submitted', 'Assemblée de Godomey', '01 28 43 81 80', NOW()
FROM profiles p WHERE p.email = 'coach2@kogoh.bj'
ON CONFLICT (name) DO NOTHING;

INSERT INTO matches (home_team_id, away_team_id, scheduled_at, venue, round, status)
SELECT t1.id, t2.id, '2026-07-26T15:00:00+00', 'CEG Godomey', 'Match d''ouverture', 'scheduled'
FROM teams t1, teams t2
WHERE t1.name = 'Disciples FC' AND t2.name = 'Aigles de Godomey'
  AND NOT EXISTS (
    SELECT 1 FROM matches WHERE round = 'Match d''ouverture'
  );

INSERT INTO documents (title, description, file_url, category, is_public)
SELECT
  'Règlement officiel : Édition Vacances 2026',
  'Règlement intérieur du tournoi (football à 6, 8 équipes max).',
  '/reglement.pdf',
  'reglement',
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM documents WHERE title = 'Règlement officiel : Édition Vacances 2026'
);
