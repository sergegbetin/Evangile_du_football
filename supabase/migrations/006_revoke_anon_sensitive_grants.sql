-- Revoke anon privileges on private tables (RLS is not enough for GraphQL discovery).
-- Authenticated keeps access; policies still filter rows.

REVOKE ALL ON TABLE public.audit_logs FROM anon;
REVOKE ALL ON TABLE public.payments FROM anon;
REVOKE ALL ON TABLE public.claims FROM anon;
REVOKE ALL ON TABLE public.profiles FROM anon;
REVOKE ALL ON TABLE public.payment_receipt_seq FROM anon;

GRANT SELECT ON TABLE public.audit_logs TO authenticated;
GRANT SELECT, INSERT ON TABLE public.payments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.claims TO authenticated;
GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;
