-- =========================================================
-- MARKETPLACE PAYOUTS
--
-- Every sale before this one was a club selling to its own member: the club
-- that took the money and the club the buyer belongs to were the same row, so
-- neither the session nor the order needed to say who gets paid.
--
-- A marketplace install is not that. Creator A's club buys, creator B's club
-- is paid, and Advisors Club keeps a share. So checkout carries a PAYEE and a
-- PLATFORM FEE, both written server-side and both frozen onto the order — a
-- later change to the platform rate must never restate what someone earned.
-- =========================================================

alter table public.checkout_sessions
  add column if not exists payee_club_id uuid references public.clubs(id) on delete set null,
  add column if not exists platform_fee_cents integer not null default 0;

alter table public.orders
  add column if not exists payee_club_id uuid references public.clubs(id) on delete set null,
  add column if not exists platform_fee_cents integer not null default 0;

-- Backfill: in every sale so far the club that sold it was also the payee.
update public.orders set payee_club_id = club_id where payee_club_id is null;

create index if not exists orders_payee_idx on public.orders(payee_club_id, paid_at desc);
create index if not exists checkout_sessions_payee_idx on public.checkout_sessions(payee_club_id);

-- The selling creator has to be able to see what they earned, and those orders
-- live in the BUYER's club — so admin-of-club_id no longer covers it.
drop policy if exists "Read own orders" on public.orders;
create policy "Read own orders" on public.orders for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_club_admin(club_id)
    or (payee_club_id is not null and public.is_club_admin(payee_club_id))
  );

drop policy if exists "Read own checkout sessions" on public.checkout_sessions;
create policy "Read own checkout sessions" on public.checkout_sessions for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_club_admin(club_id)
    or (payee_club_id is not null and public.is_club_admin(payee_club_id))
  );

-- An install row is written by fulfilment (service role) once payment clears,
-- never by the browser. Creators still delete their own installs.
drop policy if exists "Admins install into their club" on public.app_installs;

-- Which order paid for an install, so a refund can find its way back to it.
alter table public.app_installs
  add column if not exists order_id uuid references public.orders(id) on delete set null,
  add column if not exists revoked_at timestamptz;
create index if not exists app_installs_order_idx on public.app_installs(order_id);
