-- V1.1: coach payment declaration + match status updates helpers

ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS payment_declared_at TIMESTAMPTZ;

COMMENT ON COLUMN teams.payment_declared_at IS
  'Set when the coach signals cash was paid to the committee; cleared when a payment is recorded.';

-- Allow coaches to declare payment without opening full team UPDATE on approved teams.
CREATE OR REPLACE FUNCTION public.declare_team_payment()
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  declared_at TIMESTAMPTZ;
BEGIN
  UPDATE teams
  SET payment_declared_at = NOW(),
      updated_at = NOW()
  WHERE coach_id = auth.uid()
    AND status = 'approved'
  RETURNING payment_declared_at INTO declared_at;

  IF declared_at IS NULL THEN
    RAISE EXCEPTION 'Aucune équipe validée trouvée pour déclarer un paiement';
  END IF;

  RETURN declared_at;
END;
$$;

REVOKE ALL ON FUNCTION public.declare_team_payment() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.declare_team_payment() TO authenticated;
