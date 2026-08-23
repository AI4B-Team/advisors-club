CREATE TABLE public.checkout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_id uuid REFERENCES public.offers(id) ON DELETE SET NULL,
  product_kind text NOT NULL,
  product_id uuid,
  product_key text NOT NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  interval text,
  provider text NOT NULL DEFAULT 'sandbox',
  provider_ref text,
  checkout_url text,
  status text NOT NULL DEFAULT 'pending',
  failure_reason text,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '1 hour'),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.checkout_sessions TO authenticated;
GRANT ALL ON public.checkout_sessions TO service_role;

ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read own checkout sessions"
  ON public.checkout_sessions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_club_admin(club_id));

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.checkout_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX checkout_sessions_provider_ref_idx ON public.checkout_sessions (provider, provider_ref);
CREATE INDEX checkout_sessions_user_idx ON public.checkout_sessions (user_id, created_at DESC);
CREATE INDEX checkout_sessions_club_idx ON public.checkout_sessions (club_id, created_at DESC);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS failure_reason text;
CREATE INDEX IF NOT EXISTS orders_provider_ref_idx ON public.orders (provider, provider_ref);
CREATE INDEX IF NOT EXISTS orders_club_paid_idx ON public.orders (club_id, paid_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS entitlements_active_unique
  ON public.entitlements (club_id, user_id, product_key)
  WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS entitlements_user_idx ON public.entitlements (user_id, club_id);