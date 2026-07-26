-- Seed poules 2026 — 8 équipes + 4 matchs (calendrier officiel)
-- Exécuter sur kogoh-prod (SQL Editor ou MCP). Idempotent sur les noms d'équipe / rounds.
-- Crée des comptes coach placeholder (auth) si absents ; mots de passe non utilisés en prod
-- (les vrais coachs s'inscrivent ensuite et le comité peut réattribuer / merger).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TEMP TABLE pool_seed (
  slug text PRIMARY KEY,
  email text NOT NULL,
  full_name text NOT NULL,
  team_name text NOT NULL,
  church text NOT NULL,
  pool char(1) NOT NULL
);

INSERT INTO pool_seed (slug, email, full_name, team_name, church, pool) VALUES
  ('canaan', 'coach-canaan@placeholder.kogoh.bj', 'Coach Canaan FC', 'Canaan FC', 'Église Pentecôte de la Foi Calavi centre', 'A'),
  ('eaw', 'coach-eaw@placeholder.kogoh.bj', 'Coach EAW FC', 'EAW FC', 'Église Apostolique Womey', 'A'),
  ('dekoungbe', 'coach-dekoungbe@placeholder.kogoh.bj', 'Coach EPF Dekoungbé FC', 'EPF Dekoungbé FC', 'Église Pentecôte de la Foi de Dekoungbé', 'A'),
  ('kindonou', 'coach-kindonou@placeholder.kogoh.bj', 'Coach Kindonou', 'Kindonou', 'Église Pentecôte de la Foi de Kindonou', 'A'),
  ('cua', 'coach-cua@placeholder.kogoh.bj', 'Coach CUA FC', 'CUA FC', 'Église Apostolique Centre Universitaire', 'B'),
  ('fidjrosse', 'coach-fidjrosse@placeholder.kogoh.bj', 'Coach EPF Fidjrossè', 'EPF Fidjrossè', 'Église Pentecôte de la Foi de Fidjrossè', 'B'),
  ('tu', 'coach-tu@placeholder.kogoh.bj', 'Coach TU FC', 'TU FC', 'À préciser', 'B'),
  ('gbegamey', 'coach-gbegamey@placeholder.kogoh.bj', 'Coach Gbegamey', 'Gbegamey', 'Église Pentecôte de la Foi de Gbegamey', 'B');

DO $$
DECLARE
  r record;
  new_id uuid;
BEGIN
  FOR r IN SELECT * FROM pool_seed LOOP
    SELECT id INTO new_id FROM auth.users WHERE email = r.email;
    IF new_id IS NULL THEN
      new_id := gen_random_uuid();
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_id,
        'authenticated',
        'authenticated',
        r.email,
        crypt('TempCoach2026!', gen_salt('bf')),
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', r.full_name, 'phone', '01 62 93 91 66', 'role', 'coach'),
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
      );

      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        new_id,
        jsonb_build_object('sub', new_id::text, 'email', r.email),
        'email',
        new_id::text,
        NOW(),
        NOW(),
        NOW()
      );
    END IF;

    UPDATE public.profiles
    SET
      full_name = r.full_name,
      phone = '01 62 93 91 66',
      role = 'coach'
    WHERE id = new_id;

    INSERT INTO public.teams (
      name,
      coach_id,
      status,
      church,
      contact_phone,
      submitted_at,
      approved_at
    )
    VALUES (
      r.team_name,
      new_id,
      'approved',
      r.church,
      '01 62 93 91 66',
      NOW(),
      NOW()
    )
    ON CONFLICT (name) DO UPDATE
    SET
      status = 'approved',
      church = EXCLUDED.church,
      contact_phone = EXCLUDED.contact_phone,
      approved_at = COALESCE(public.teams.approved_at, NOW()),
      submitted_at = COALESCE(public.teams.submitted_at, NOW());
  END LOOP;
END $$;

-- Matchs (heure locale Bénin UTC+1)
INSERT INTO public.matches (
  home_team_id,
  away_team_id,
  scheduled_at,
  venue,
  round,
  status,
  home_score,
  away_score,
  ended_at
)
SELECT
  h.id,
  a.id,
  '2026-07-26T16:00:00+01:00'::timestamptz,
  'Quartier Latin',
  'Phase de poules J1',
  'completed',
  1,
  0,
  '2026-07-26T18:00:00+01:00'::timestamptz
FROM public.teams h, public.teams a
WHERE h.name = 'EAW FC' AND a.name = 'Canaan FC'
  AND NOT EXISTS (
    SELECT 1 FROM public.matches m WHERE m.round = 'Phase de poules J1'
  );

INSERT INTO public.matches (
  home_team_id,
  away_team_id,
  scheduled_at,
  venue,
  round,
  status
)
SELECT
  h.id,
  a.id,
  '2026-08-02T16:00:00+01:00'::timestamptz,
  'À confirmer',
  'Phase de poules J2',
  'scheduled'
FROM public.teams h, public.teams a
WHERE h.name = 'CUA FC' AND a.name = 'TU FC'
  AND NOT EXISTS (
    SELECT 1 FROM public.matches m WHERE m.round = 'Phase de poules J2'
  );

INSERT INTO public.matches (
  home_team_id,
  away_team_id,
  scheduled_at,
  venue,
  round,
  status
)
SELECT
  h.id,
  a.id,
  '2026-08-09T16:00:00+01:00'::timestamptz,
  'À confirmer',
  'Phase de poules J3',
  'scheduled'
FROM public.teams h, public.teams a
WHERE h.name = 'EPF Dekoungbé FC' AND a.name = 'Kindonou'
  AND NOT EXISTS (
    SELECT 1 FROM public.matches m WHERE m.round = 'Phase de poules J3'
  );

INSERT INTO public.matches (
  home_team_id,
  away_team_id,
  scheduled_at,
  venue,
  round,
  status
)
SELECT
  h.id,
  a.id,
  '2026-08-16T16:00:00+01:00'::timestamptz,
  'À confirmer',
  'Phase de poules J4',
  'scheduled'
FROM public.teams h, public.teams a
WHERE h.name = 'EPF Fidjrossè' AND a.name = 'Gbegamey'
  AND NOT EXISTS (
    SELECT 1 FROM public.matches m WHERE m.round = 'Phase de poules J4'
  );
