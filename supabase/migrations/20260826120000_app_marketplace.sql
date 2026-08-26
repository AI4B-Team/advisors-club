-- =========================================================
-- APP MARKETPLACE
--
-- The App Library ships starting points we wrote. The marketplace is supply
-- CREATORS publish for other creators: one club lists an app, another club
-- installs it, and Advisors Club keeps a percentage of every paid install.
--
-- Unlike every other table in this schema, `app_listings` is deliberately
-- CROSS-CLUB: a listing is written by its author's club and readable by every
-- authenticated creator. Only the author's admins may write it.
-- =========================================================

-- Which listing an installed app came from, and at which version. Used to
-- decide whether an update is waiting for the installing creator.
alter table public.apps add column if not exists listing_id uuid;
alter table public.apps add column if not exists listing_version integer;

create table public.app_listings (
  id uuid primary key default gen_random_uuid(),
  -- The publishing club. Payouts belong to this tenant.
  author_club_id uuid not null references public.clubs(id) on delete cascade,
  -- The app in the author's own club this was published from.
  source_app_id uuid references public.apps(id) on delete set null,
  name text not null,
  description text not null default '',
  details text,
  kind text not null,
  icon text not null default 'wrench',
  category text not null default 'Universal',
  -- What another CREATOR pays to install — not what their members pay.
  pricing jsonb not null default '{"model":"free"}'::jsonb,
  -- live | unlisted | removed. `removed` is a tombstone: existing installs
  -- keep working, nobody new can install.
  status text not null default 'live',
  -- Bumped on every republish. Installs record the version they took.
  version integer not null default 1,
  changelog text,
  schema jsonb not null default '{"fields":[],"outputs":[]}'::jsonb,
  config jsonb not null default '{}'::jsonb,
  installs integer not null default 0,
  rating numeric(2,1),
  rating_count integer not null default 0,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index app_listings_author_idx on public.app_listings(author_club_id);
create index app_listings_live_idx on public.app_listings(status, installs desc);
create index app_listings_category_idx on public.app_listings(category);

-- One row per install. The split is written at purchase time and never
-- recomputed, so changing the platform rate later cannot rewrite history.
create table public.app_installs (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.app_listings(id) on delete cascade,
  -- The installing club.
  club_id uuid not null references public.clubs(id) on delete cascade,
  -- The app created in the installing club.
  app_id uuid references public.apps(id) on delete set null,
  version integer not null default 1,
  gross_cents integer not null default 0,
  platform_fee_cents integer not null default 0,
  author_net_cents integer not null default 0,
  installed_at timestamptz not null default now()
);
create index app_installs_listing_idx on public.app_installs(listing_id, installed_at desc);
create index app_installs_club_idx on public.app_installs(club_id);
create unique index app_installs_once_idx on public.app_installs(listing_id, club_id);

grant select, insert, update, delete on public.app_listings to authenticated;
grant all on public.app_listings to service_role;
alter table public.app_listings enable row level security;

-- Every creator browses the catalog; only live listings are visible to
-- anyone but their author.
create policy "Creators browse live listings" on public.app_listings for select to authenticated
  using (status = 'live' or public.is_club_admin(author_club_id));
create policy "Authors manage their listings" on public.app_listings for all to authenticated
  using (public.is_club_admin(author_club_id)) with check (public.is_club_admin(author_club_id));

grant select, insert, delete on public.app_installs to authenticated;
grant all on public.app_installs to service_role;
alter table public.app_installs enable row level security;

-- An install is visible to the club that made it and to the author being paid
-- for it. Nobody else sees who installed what.
create policy "Installer and author read installs" on public.app_installs for select to authenticated
  using (
    public.is_club_admin(club_id)
    or exists (
      select 1 from public.app_listings l
      where l.id = listing_id and public.is_club_admin(l.author_club_id)
    )
  );
create policy "Admins install into their club" on public.app_installs for insert to authenticated
  with check (public.is_club_admin(club_id));
create policy "Admins uninstall from their club" on public.app_installs for delete to authenticated
  using (public.is_club_admin(club_id));
