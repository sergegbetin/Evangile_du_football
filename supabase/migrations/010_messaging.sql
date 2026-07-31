-- Kogoh — Messagerie comité ↔ coachs (V1)
-- Fils par équipe + annonces globales (broadcast). Pas de DM coach↔coach.

DO $$ BEGIN
  CREATE TYPE message_thread_kind AS ENUM ('team', 'broadcast');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind message_thread_kind NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT message_threads_team_kind_check CHECK (
    (kind = 'team' AND team_id IS NOT NULL)
    OR (kind = 'broadcast' AND team_id IS NULL)
  )
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  body TEXT NOT NULL CHECK (char_length(trim(body)) > 0 AND char_length(body) <= 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS message_threads_team_id_idx ON message_threads(team_id);
CREATE INDEX IF NOT EXISTS message_threads_last_message_at_idx ON message_threads(last_message_at DESC);
CREATE INDEX IF NOT EXISTS messages_thread_id_created_at_idx ON messages(thread_id, created_at);

DROP TRIGGER IF EXISTS message_threads_updated_at ON message_threads;
CREATE TRIGGER message_threads_updated_at
  BEFORE UPDATE ON message_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION can_access_message_thread(thread_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM message_threads t
    WHERE t.id = thread_uuid
      AND (
        is_committee_or_admin()
        OR t.kind = 'broadcast'
        OR (t.kind = 'team' AND owns_team(t.team_id))
      )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION bump_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE message_threads
  SET last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS messages_bump_thread ON messages;
CREATE TRIGGER messages_bump_thread
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION bump_thread_last_message();

ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Committee and coaches view accessible threads" ON message_threads;
CREATE POLICY "Committee and coaches view accessible threads"
  ON message_threads FOR SELECT
  TO authenticated
  USING (
    is_committee_or_admin()
    OR kind = 'broadcast'
    OR (kind = 'team' AND owns_team(team_id))
  );

DROP POLICY IF EXISTS "Committee create threads" ON message_threads;
CREATE POLICY "Committee create threads"
  ON message_threads FOR INSERT
  TO authenticated
  WITH CHECK (
    is_committee_or_admin()
    AND created_by = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS "Coaches create team threads for own team" ON message_threads;
CREATE POLICY "Coaches create team threads for own team"
  ON message_threads FOR INSERT
  TO authenticated
  WITH CHECK (
    kind = 'team'
    AND team_id IS NOT NULL
    AND owns_team(team_id)
    AND created_by = (SELECT auth.uid())
    AND get_user_role() = 'coach'
  );

DROP POLICY IF EXISTS "Accessible users read messages" ON messages;
CREATE POLICY "Accessible users read messages"
  ON messages FOR SELECT
  TO authenticated
  USING (can_access_message_thread(thread_id));

DROP POLICY IF EXISTS "Accessible users send messages" ON messages;
CREATE POLICY "Accessible users send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND can_access_message_thread(thread_id)
  );

GRANT SELECT, INSERT ON TABLE public.message_threads TO authenticated;
GRANT SELECT, INSERT ON TABLE public.messages TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_message_thread(UUID) TO authenticated;
