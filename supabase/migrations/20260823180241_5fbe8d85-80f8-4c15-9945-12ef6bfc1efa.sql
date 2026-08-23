-- =========================================================
-- ADVISORS CLUB — production data foundation
-- =========================================================

-- ---------- enums ----------
create type public.platform_role as enum ('platform_admin','support','user');
create type public.club_role as enum ('owner','admin','moderator','coach','member');
create type public.membership_status as enum ('invited','pending','active','paused','cancelled','banned');
create type public.content_status as enum ('draft','published','archived');
create type public.opportunity_status as enum ('new','reviewing','approved','building','completed','dismissed');
create type public.relationship_status as enum ('draft','suggested','approved','rejected');
create type public.reco_status as enum ('suggested','approved','rejected','applied','removed');
create type public.build_plan_status as enum ('draft','approved','building','completed','failed');
create type public.club_visibility as enum ('public','unlisted','private');

-- ---------- shared updated_at trigger already exists: public.update_updated_at_column() ----------

-- =========================================================
-- CLUBS + MEMBERSHIPS (tenancy root)
-- =========================================================
create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text,
  category text,
  cover_url text,
  owner_id uuid not null references auth.users(id) on delete restrict,
  visibility public.club_visibility not null default 'private',
  status public.content_status not null default 'draft',
  price_cents integer not null default 0,
  currency text not null default 'usd',
  tags text[] not null default '{}',
  branding jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  is_demo boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index clubs_owner_idx on public.clubs(owner_id);

create table public.club_memberships (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.club_role not null default 'member',
  plan text,
  status public.membership_status not null default 'active',
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (club_id, user_id)
);
create index club_memberships_user_idx on public.club_memberships(user_id);
create index club_memberships_club_idx on public.club_memberships(club_id);

create table public.user_platform_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.platform_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

-- ---------- security definer helpers ----------
create or replace function public.has_platform_role(_user_id uuid, _role public.platform_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_platform_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_platform_role(auth.uid(), 'platform_admin')
$$;

create or replace function public.club_role_of(_club_id uuid, _user_id uuid)
returns public.club_role language sql stable security definer set search_path = public as $$
  select role from public.club_memberships
  where club_id = _club_id and user_id = _user_id and status = 'active'
  limit 1
$$;

create or replace function public.is_club_member(_club_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.club_role_of(_club_id, auth.uid()) is not null
$$;

create or replace function public.is_club_staff(_club_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.club_role_of(_club_id, auth.uid())
         in ('owner','admin','moderator','coach')
$$;

create or replace function public.is_club_admin(_club_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.club_role_of(_club_id, auth.uid()) in ('owner','admin')
$$;

create or replace function public.is_club_owner(_club_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.club_role_of(_club_id, auth.uid()) = 'owner'
$$;

create or replace function public.is_public_club(_club_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.clubs
    where id = _club_id and visibility = 'public' and status = 'published')
$$;

-- owner is automatically an owner-membership
create or replace function public.handle_new_club()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.club_memberships (club_id, user_id, role, status)
  values (new.id, new.owner_id, 'owner', 'active')
  on conflict (club_id, user_id) do update set role = 'owner', status = 'active';
  return new;
end;
$$;
create trigger on_club_created after insert on public.clubs
  for each row execute function public.handle_new_club();

grant select, insert, update, delete on public.clubs to authenticated;
grant select on public.clubs to anon;
grant all on public.clubs to service_role;
alter table public.clubs enable row level security;
create policy "Public clubs are readable" on public.clubs for select to anon, authenticated
  using (visibility = 'public' and status = 'published');
create policy "Members read their clubs" on public.clubs for select to authenticated
  using (public.is_club_member(id) or public.is_platform_admin());
create policy "Users create clubs they own" on public.clubs for insert to authenticated
  with check (owner_id = auth.uid());
create policy "Owners update their club" on public.clubs for update to authenticated
  using (public.is_club_owner(id) or public.is_platform_admin())
  with check (public.is_club_owner(id) or public.is_platform_admin());
create policy "Owners delete their club" on public.clubs for delete to authenticated
  using (public.is_club_owner(id));

grant select, insert, update, delete on public.club_memberships to authenticated;
grant all on public.club_memberships to service_role;
alter table public.club_memberships enable row level security;
create policy "Read own membership" on public.club_memberships for select to authenticated
  using (user_id = auth.uid());
create policy "Read memberships of my clubs" on public.club_memberships for select to authenticated
  using (public.is_club_member(club_id) or public.is_platform_admin());
create policy "Owners and admins manage memberships" on public.club_memberships for insert to authenticated
  with check (public.is_club_admin(club_id));
create policy "Owners and admins update memberships" on public.club_memberships for update to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));
create policy "Owners remove memberships" on public.club_memberships for delete to authenticated
  using (public.is_club_owner(club_id) or user_id = auth.uid());

grant select on public.user_platform_roles to authenticated;
grant all on public.user_platform_roles to service_role;
alter table public.user_platform_roles enable row level security;
create policy "Read own platform roles" on public.user_platform_roles for select to authenticated
  using (user_id = auth.uid() or public.is_platform_admin());

-- =========================================================
-- NAVIGATION
-- =========================================================
create table public.club_navigation (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null unique references public.clubs(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.club_navigation to authenticated;
grant select on public.club_navigation to anon;
grant all on public.club_navigation to service_role;
alter table public.club_navigation enable row level security;
create policy "Members read navigation" on public.club_navigation for select to anon, authenticated
  using (public.is_club_member(club_id) or public.is_public_club(club_id));
create policy "Admins manage navigation" on public.club_navigation for all to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));

-- =========================================================
-- COMMUNITY
-- =========================================================
create table public.community_spaces (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  kind text not null default 'feed',
  position integer not null default 0,
  access jsonb not null default '{"mode":"free"}'::jsonb,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (club_id, slug)
);

create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  space_id uuid references public.community_spaces(id) on delete set null,
  author_id uuid references auth.users(id) on delete set null,
  title text,
  body text not null default '',
  kind text not null default 'post',
  attachments jsonb not null default '[]'::jsonb,
  pinned boolean not null default false,
  status public.content_status not null default 'published',
  metrics jsonb not null default '{}'::jsonb,
  published_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index community_posts_club_idx on public.community_posts(club_id, created_at desc);

create table public.community_comments (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  post_id uuid references public.community_posts(id) on delete cascade,
  lesson_id uuid,
  parent_id uuid references public.community_comments(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  body text not null default '',
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index community_comments_post_idx on public.community_comments(post_id, created_at);

grant select, insert, update, delete on public.community_spaces to authenticated;
grant all on public.community_spaces to service_role;
alter table public.community_spaces enable row level security;
create policy "Members read spaces" on public.community_spaces for select to authenticated
  using (public.is_club_member(club_id) or public.is_platform_admin());
create policy "Admins manage spaces" on public.community_spaces for all to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));

grant select, insert, update, delete on public.community_posts to authenticated;
grant all on public.community_posts to service_role;
alter table public.community_posts enable row level security;
create policy "Members read posts" on public.community_posts for select to authenticated
  using ((public.is_club_member(club_id) and (status = 'published' or author_id = auth.uid()))
         or public.is_club_staff(club_id) or public.is_platform_admin());
create policy "Members write posts" on public.community_posts for insert to authenticated
  with check (public.is_club_member(club_id) and author_id = auth.uid());
create policy "Authors and moderators update posts" on public.community_posts for update to authenticated
  using (author_id = auth.uid() or public.is_club_staff(club_id))
  with check (author_id = auth.uid() or public.is_club_staff(club_id));
create policy "Authors and moderators delete posts" on public.community_posts for delete to authenticated
  using (author_id = auth.uid() or public.is_club_staff(club_id));

grant select, insert, update, delete on public.community_comments to authenticated;
grant all on public.community_comments to service_role;
alter table public.community_comments enable row level security;
create policy "Members read comments" on public.community_comments for select to authenticated
  using (public.is_club_member(club_id) or public.is_platform_admin());
create policy "Members write comments" on public.community_comments for insert to authenticated
  with check (public.is_club_member(club_id) and author_id = auth.uid());
create policy "Authors and moderators update comments" on public.community_comments for update to authenticated
  using (author_id = auth.uid() or public.is_club_staff(club_id))
  with check (author_id = auth.uid() or public.is_club_staff(club_id));
create policy "Authors and moderators delete comments" on public.community_comments for delete to authenticated
  using (author_id = auth.uid() or public.is_club_staff(club_id));

-- =========================================================
-- COURSES
-- =========================================================
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  title text not null,
  blurb text not null default '',
  cover_url text,
  instructor text,
  course_type text not null default 'self-paced',
  status public.content_status not null default 'draft',
  locked boolean not null default false,
  drip_start_date date,
  access jsonb not null default '{"mode":"free"}'::jsonb,
  price_cents integer not null default 0,
  position integer not null default 0,
  stats jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index courses_club_idx on public.courses(club_id);

create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  published boolean not null default true,
  locked boolean not null default false,
  drip_days integer,
  quiz jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index course_modules_course_idx on public.course_modules(course_id, position);

create table public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null,
  duration text,
  body text not null default '',
  media_type text not null default 'none',
  media_url text,
  transcript text,
  published boolean not null default true,
  locked boolean not null default false,
  drip_days integer,
  comments_on boolean not null default false,
  featured boolean not null default false,
  quiz jsonb,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index course_lessons_module_idx on public.course_lessons(module_id, position);

create table public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active',
  progress numeric not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, user_id)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  seconds_watched integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, user_id)
);

grant select, insert, update, delete on public.courses to authenticated;
grant all on public.courses to service_role;
alter table public.courses enable row level security;
create policy "Members read courses" on public.courses for select to authenticated
  using ((public.is_club_member(club_id) and status = 'published')
         or public.is_club_staff(club_id) or public.is_platform_admin());
create policy "Admins manage courses" on public.courses for all to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));

grant select, insert, update, delete on public.course_modules to authenticated;
grant all on public.course_modules to service_role;
alter table public.course_modules enable row level security;
create policy "Members read modules" on public.course_modules for select to authenticated
  using ((public.is_club_member(club_id) and published) or public.is_club_staff(club_id));
create policy "Admins manage modules" on public.course_modules for all to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));

grant select, insert, update, delete on public.course_lessons to authenticated;
grant all on public.course_lessons to service_role;
alter table public.course_lessons enable row level security;
create policy "Members read lessons" on public.course_lessons for select to authenticated
  using ((public.is_club_member(club_id) and published) or public.is_club_staff(club_id));
create policy "Admins manage lessons" on public.course_lessons for all to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));

grant select, insert, update, delete on public.course_enrollments to authenticated;
grant all on public.course_enrollments to service_role;
alter table public.course_enrollments enable row level security;
create policy "Read own enrollments" on public.course_enrollments for select to authenticated
  using (user_id = auth.uid() or public.is_club_staff(club_id));
create policy "Enroll self" on public.course_enrollments for insert to authenticated
  with check (user_id = auth.uid() and public.is_club_member(club_id));
create policy "Update own enrollment" on public.course_enrollments for update to authenticated
  using (user_id = auth.uid() or public.is_club_admin(club_id))
  with check (user_id = auth.uid() or public.is_club_admin(club_id));
create policy "Admins remove enrollments" on public.course_enrollments for delete to authenticated
  using (public.is_club_admin(club_id));

grant select, insert, update, delete on public.lesson_progress to authenticated;
grant all on public.lesson_progress to service_role;
alter table public.lesson_progress enable row level security;
create policy "Read own progress" on public.lesson_progress for select to authenticated
  using (user_id = auth.uid() or public.is_club_staff(club_id));
create policy "Write own progress" on public.lesson_progress for insert to authenticated
  with check (user_id = auth.uid() and public.is_club_member(club_id));
create policy "Update own progress" on public.lesson_progress for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =========================================================
-- RESOURCES + EVENTS
-- =========================================================
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  lesson_id uuid references public.course_lessons(id) on delete cascade,
  title text not null,
  type text not null default 'link',
  url text,
  description text,
  file_path text,
  access jsonb not null default '{"mode":"free"}'::jsonb,
  status public.content_status not null default 'published',
  source text not null default 'manual',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index resources_club_idx on public.resources(club_id);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  title text not null,
  description text,
  kind text not null default 'call',
  starts_at timestamptz not null,
  ends_at timestamptz,
  timezone text,
  location text,
  join_url text,
  replay_url text,
  access jsonb not null default '{"mode":"free"}'::jsonb,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index events_club_idx on public.events(club_id, starts_at);

grant select, insert, update, delete on public.resources to authenticated;
grant all on public.resources to service_role;
alter table public.resources enable row level security;
create policy "Members read resources" on public.resources for select to authenticated
  using ((public.is_club_member(club_id) and status = 'published') or public.is_club_staff(club_id));
create policy "Admins manage resources" on public.resources for all to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));

grant select, insert, update, delete on public.events to authenticated;
grant all on public.events to service_role;
alter table public.events enable row level security;
create policy "Members read events" on public.events for select to authenticated
  using ((public.is_club_member(club_id) and status = 'published') or public.is_club_staff(club_id));
create policy "Admins manage events" on public.events for all to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));

-- =========================================================
-- APPS
-- =========================================================
create table public.apps (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  name text not null,
  description text not null default '',
  kind text not null,
  icon text not null default 'wrench',
  status public.content_status not null default 'draft',
  listed boolean not null default true,
  source text not null default 'blank',
  template_id text,
  prompt text,
  context_refs jsonb not null default '[]'::jsonb,
  schema jsonb not null default '{"fields":[],"outputs":[]}'::jsonb,
  config jsonb not null default '{}'::jsonb,
  access jsonb not null default '{"mode":"free"}'::jsonb,
  pricing jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index apps_club_idx on public.apps(club_id);

create table public.app_runs (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  app_id uuid not null references public.apps(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  inputs jsonb not null default '{}'::jsonb,
  outputs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index app_runs_app_idx on public.app_runs(app_id, created_at desc);

grant select, insert, update, delete on public.apps to authenticated;
grant all on public.apps to service_role;
alter table public.apps enable row level security;
create policy "Members read apps" on public.apps for select to authenticated
  using ((public.is_club_member(club_id) and status = 'published') or public.is_club_staff(club_id));
create policy "Admins manage apps" on public.apps for all to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));

grant select, insert on public.app_runs to authenticated;
grant all on public.app_runs to service_role;
alter table public.app_runs enable row level security;
create policy "Read own app runs" on public.app_runs for select to authenticated
  using (user_id = auth.uid() or public.is_club_staff(club_id));
create policy "Record own app runs" on public.app_runs for insert to authenticated
  with check (user_id = auth.uid() and public.is_club_member(club_id));

-- =========================================================
-- COACHING
-- =========================================================
create table public.coaching_programs (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  name text not null,
  description text,
  status public.content_status not null default 'draft',
  access jsonb not null default '{"mode":"free"}'::jsonb,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.coaching_enrollments (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  program_id uuid references public.coaching_programs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  coach_id uuid references auth.users(id) on delete set null,
  stage text,
  status text not null default 'active',
  intake jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index coaching_enrollments_club_idx on public.coaching_enrollments(club_id);

create table public.coaching_sessions (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  enrollment_id uuid references public.coaching_enrollments(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  coach_id uuid references auth.users(id) on delete set null,
  title text,
  scheduled_at timestamptz,
  duration_minutes integer,
  agenda text,
  notes text,
  resources jsonb not null default '[]'::jsonb,
  follow_up text,
  follow_up_done boolean not null default false,
  status text not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.coaching_goals (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  enrollment_id uuid references public.coaching_enrollments(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  metric_label text,
  target numeric,
  current numeric not null default 0,
  unit text,
  due_date date,
  status text not null default 'on-track',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.coaching_tasks (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  goal_id uuid references public.coaching_goals(id) on delete set null,
  enrollment_id uuid references public.coaching_enrollments(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  due_date date,
  week_of date,
  kind text not null default 'task',
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.coaching_notes (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  enrollment_id uuid references public.coaching_enrollments(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.coaching_programs to authenticated;
grant all on public.coaching_programs to service_role;
alter table public.coaching_programs enable row level security;
create policy "Members read programs" on public.coaching_programs for select to authenticated
  using ((public.is_club_member(club_id) and status = 'published') or public.is_club_staff(club_id));
create policy "Admins manage programs" on public.coaching_programs for all to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));

grant select, insert, update, delete on public.coaching_enrollments to authenticated;
grant all on public.coaching_enrollments to service_role;
alter table public.coaching_enrollments enable row level security;
create policy "Read own coaching enrollment" on public.coaching_enrollments for select to authenticated
  using (user_id = auth.uid() or coach_id = auth.uid() or public.is_club_staff(club_id));
create policy "Staff manage coaching enrollments" on public.coaching_enrollments for all to authenticated
  using (public.is_club_staff(club_id)) with check (public.is_club_staff(club_id));

grant select, insert, update, delete on public.coaching_sessions to authenticated;
grant all on public.coaching_sessions to service_role;
alter table public.coaching_sessions enable row level security;
create policy "Read own sessions" on public.coaching_sessions for select to authenticated
  using (user_id = auth.uid() or coach_id = auth.uid() or public.is_club_staff(club_id));
create policy "Staff manage sessions" on public.coaching_sessions for all to authenticated
  using (public.is_club_staff(club_id)) with check (public.is_club_staff(club_id));

grant select, insert, update, delete on public.coaching_goals to authenticated;
grant all on public.coaching_goals to service_role;
alter table public.coaching_goals enable row level security;
create policy "Read own goals" on public.coaching_goals for select to authenticated
  using (user_id = auth.uid() or public.is_club_staff(club_id));
create policy "Staff manage goals" on public.coaching_goals for all to authenticated
  using (public.is_club_staff(club_id)) with check (public.is_club_staff(club_id));

grant select, insert, update, delete on public.coaching_tasks to authenticated;
grant all on public.coaching_tasks to service_role;
alter table public.coaching_tasks enable row level security;
create policy "Read own tasks" on public.coaching_tasks for select to authenticated
  using (user_id = auth.uid() or public.is_club_staff(club_id));
create policy "Members complete own tasks" on public.coaching_tasks for update to authenticated
  using (user_id = auth.uid() or public.is_club_staff(club_id))
  with check (user_id = auth.uid() or public.is_club_staff(club_id));
create policy "Staff create tasks" on public.coaching_tasks for insert to authenticated
  with check (public.is_club_staff(club_id));
create policy "Staff delete tasks" on public.coaching_tasks for delete to authenticated
  using (public.is_club_staff(club_id));

grant select, insert, update, delete on public.coaching_notes to authenticated;
grant all on public.coaching_notes to service_role;
alter table public.coaching_notes enable row level security;
create policy "Staff read notes" on public.coaching_notes for select to authenticated
  using (public.is_club_staff(club_id));
create policy "Staff manage notes" on public.coaching_notes for all to authenticated
  using (public.is_club_staff(club_id)) with check (public.is_club_staff(club_id));

-- =========================================================
-- SELL PAGES
-- =========================================================
create table public.sell_pages (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  slug text not null,
  surface text not null default 'landing',
  title text not null default '',
  blocks jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (club_id, slug)
);
grant select, insert, update, delete on public.sell_pages to authenticated;
grant select on public.sell_pages to anon;
grant all on public.sell_pages to service_role;
alter table public.sell_pages enable row level security;
create policy "Published pages are public" on public.sell_pages for select to anon, authenticated
  using (status = 'published');
create policy "Admins manage sell pages" on public.sell_pages for all to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));

-- =========================================================
-- COMMERCE
-- =========================================================
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  product_kind text not null,
  product_id uuid,
  name text not null default '',
  price_cents integer not null default 0,
  compare_at_cents integer,
  currency text not null default 'usd',
  interval text,
  cta_label text,
  benefit text,
  purchase_description text,
  includes jsonb not null default '[]'::jsonb,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index offers_club_idx on public.offers(club_id, product_kind, product_id);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  total_cents integer not null default 0,
  currency text not null default 'usd',
  provider text,
  provider_ref text,
  paid_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  club_id uuid not null references public.clubs(id) on delete cascade,
  offer_id uuid references public.offers(id) on delete set null,
  product_kind text not null,
  product_id uuid,
  quantity integer not null default 1,
  unit_amount_cents integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_kind text not null,
  product_id uuid,
  product_key text not null,
  source text not null default 'grant',
  order_id uuid references public.orders(id) on delete set null,
  amount_cents integer,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (club_id, user_id, product_key)
);
create index entitlements_user_idx on public.entitlements(user_id);

grant select, insert, update, delete on public.offers to authenticated;
grant select on public.offers to anon;
grant all on public.offers to service_role;
alter table public.offers enable row level security;
create policy "Offers are readable" on public.offers for select to anon, authenticated
  using (status = 'published' or public.is_club_staff(club_id));
create policy "Admins manage offers" on public.offers for all to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));

grant select on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "Read own orders" on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_club_admin(club_id));

grant select on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "Read own order items" on public.order_items for select to authenticated
  using (public.is_club_admin(club_id)
         or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

grant select on public.entitlements to authenticated;
grant all on public.entitlements to service_role;
alter table public.entitlements enable row level security;
create policy "Read own entitlements" on public.entitlements for select to authenticated
  using (user_id = auth.uid() or public.is_club_admin(club_id));
create policy "Admins grant entitlements" on public.entitlements for all to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));

-- =========================================================
-- AIVA INTELLIGENCE
-- =========================================================
create table public.aiva_activity (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  type text not null,
  status text not null default 'informational',
  title text not null,
  body text,
  detail jsonb not null default '{}'::jsonb,
  entity_refs jsonb not null default '[]'::jsonb,
  is_demo boolean not null default false,
  seen_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index aiva_activity_club_idx on public.aiva_activity(club_id, created_at desc);

create table public.aiva_opportunities (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  kind text not null,
  topic text not null,
  noticed text,
  why text,
  insight text,
  signal text,
  action text,
  build_href text,
  suggested_title text,
  suggested_summary text,
  build_from jsonb not null default '[]'::jsonb,
  can_do jsonb not null default '[]'::jsonb,
  monetization jsonb not null default '[]'::jsonb,
  connections jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  audience integer not null default 0,
  window_days integer not null default 30,
  confidence numeric not null default 0,
  impact numeric not null default 0,
  is_demo boolean not null default false,
  status public.opportunity_status not null default 'new',
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index aiva_opportunities_club_idx on public.aiva_opportunities(club_id, status);

create table public.aiva_recommendations (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  source_node_id text not null,
  source_title text,
  target_node_id text not null,
  target_title text,
  type text not null,
  placement text not null default 'after-content',
  reason text,
  confidence numeric not null default 0,
  status public.reco_status not null default 'suggested',
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index aiva_recos_club_idx on public.aiva_recommendations(club_id, status);

create table public.aiva_signals (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  kind text not null,
  user_id uuid references auth.users(id) on delete set null,
  topics text[] not null default '{}',
  text text,
  node_id text,
  is_demo boolean not null default false,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index aiva_signals_club_idx on public.aiva_signals(club_id, occurred_at desc);

create table public.content_relationships (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  from_node_id text not null,
  to_node_id text not null,
  kind text not null,
  intent text not null default 'helpful',
  commerce_mode text not null default 'free',
  reason text,
  confidence numeric not null default 0,
  source text not null default 'aiva',
  status public.relationship_status not null default 'suggested',
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index content_relationships_club_idx on public.content_relationships(club_id, status);

create table public.aiva_build_plans (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  kind text not null default 'onboarding',
  intro text,
  cta text,
  return_to text,
  return_label text,
  status public.build_plan_status not null default 'draft',
  phase text not null default 'plan',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.aiva_build_plan_items (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  plan_id uuid not null references public.aiva_build_plans(id) on delete cascade,
  label text not null,
  category text not null,
  description text,
  required boolean not null default false,
  recommended boolean not null default false,
  selected boolean not null default true,
  building_text text,
  done_text text,
  builder text,
  builder_input jsonb not null default '{}'::jsonb,
  edit_to text,
  origin text not null default 'aiva',
  status text not null default 'pending',
  result jsonb,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.aiva_activity to authenticated;
grant all on public.aiva_activity to service_role;
alter table public.aiva_activity enable row level security;
create policy "Staff read aiva activity" on public.aiva_activity for select to authenticated
  using (public.is_club_staff(club_id));
create policy "Admins manage aiva activity" on public.aiva_activity for all to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));

grant select, insert, update, delete on public.aiva_opportunities to authenticated;
grant all on public.aiva_opportunities to service_role;
alter table public.aiva_opportunities enable row level security;
create policy "Admins read opportunities" on public.aiva_opportunities for select to authenticated
  using (public.is_club_admin(club_id));
create policy "Admins manage opportunities" on public.aiva_opportunities for all to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));

grant select, insert, update, delete on public.aiva_recommendations to authenticated;
grant all on public.aiva_recommendations to service_role;
alter table public.aiva_recommendations enable row level security;
create policy "Members read applied recommendations" on public.aiva_recommendations for select to authenticated
  using ((public.is_club_member(club_id) and status = 'applied') or public.is_club_admin(club_id));
create policy "Admins manage recommendations" on public.aiva_recommendations for all to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));

grant select, insert on public.aiva_signals to authenticated;
grant all on public.aiva_signals to service_role;
alter table public.aiva_signals enable row level security;
create policy "Admins read signals" on public.aiva_signals for select to authenticated
  using (public.is_club_admin(club_id));
create policy "Members record own signals" on public.aiva_signals for insert to authenticated
  with check (public.is_club_member(club_id) and (user_id = auth.uid() or user_id is null));

grant select, insert, update, delete on public.content_relationships to authenticated;
grant all on public.content_relationships to service_role;
alter table public.content_relationships enable row level security;
create policy "Members read approved relationships" on public.content_relationships for select to authenticated
  using ((public.is_club_member(club_id) and status = 'approved') or public.is_club_admin(club_id));
create policy "Admins manage relationships" on public.content_relationships for all to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));

grant select, insert, update, delete on public.aiva_build_plans to authenticated;
grant all on public.aiva_build_plans to service_role;
alter table public.aiva_build_plans enable row level security;
create policy "Admins manage build plans" on public.aiva_build_plans for all to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));

grant select, insert, update, delete on public.aiva_build_plan_items to authenticated;
grant all on public.aiva_build_plan_items to service_role;
alter table public.aiva_build_plan_items enable row level security;
create policy "Admins manage build plan items" on public.aiva_build_plan_items for all to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));

-- =========================================================
-- PERSONA + KNOWLEDGE + VOICE
-- =========================================================
create table public.ai_personas (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null unique references public.clubs(id) on delete cascade,
  enabled boolean not null default false,
  identity_mode text not null default 'expert',
  expert_name text,
  name text,
  title text,
  avatar_url text,
  description text,
  greeting text,
  tone text,
  personality text,
  instructions text,
  expertise text[] not null default '{}',
  should_answer text[] not null default '{}',
  should_not_answer text[] not null default '{}',
  sources jsonb not null default '{}'::jsonb,
  member_context jsonb not null default '{}'::jsonb,
  actions jsonb not null default '{}'::jsonb,
  recommend_products boolean not null default true,
  recommend_allow text[] not null default '{}',
  escalation jsonb not null default '{}'::jsonb,
  configured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  persona_id uuid references public.ai_personas(id) on delete cascade,
  kind text not null default 'upload',
  title text not null,
  body text,
  url text,
  file_path text,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.voice_profiles (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  name text not null default 'Default Voice',
  active boolean not null default true,
  samples jsonb not null default '[]'::jsonb,
  traits jsonb not null default '{}'::jsonb,
  analysis jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.ai_personas to authenticated;
grant all on public.ai_personas to service_role;
alter table public.ai_personas enable row level security;
create policy "Members read persona" on public.ai_personas for select to authenticated
  using (public.is_club_member(club_id));
create policy "Admins manage persona" on public.ai_personas for all to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));

grant select, insert, update, delete on public.knowledge_sources to authenticated;
grant all on public.knowledge_sources to service_role;
alter table public.knowledge_sources enable row level security;
create policy "Staff read knowledge" on public.knowledge_sources for select to authenticated
  using (public.is_club_staff(club_id));
create policy "Admins manage knowledge" on public.knowledge_sources for all to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));

grant select, insert, update, delete on public.voice_profiles to authenticated;
grant all on public.voice_profiles to service_role;
alter table public.voice_profiles enable row level security;
create policy "Staff read voice" on public.voice_profiles for select to authenticated
  using (public.is_club_staff(club_id));
create policy "Admins manage voice" on public.voice_profiles for all to authenticated
  using (public.is_club_admin(club_id)) with check (public.is_club_admin(club_id));

-- =========================================================
-- updated_at triggers
-- =========================================================
do $$
declare t text;
begin
  foreach t in array array[
    'clubs','club_memberships','club_navigation','community_spaces','community_posts',
    'community_comments','courses','course_modules','course_lessons','course_enrollments',
    'lesson_progress','resources','events','apps','coaching_programs','coaching_enrollments',
    'coaching_sessions','coaching_goals','coaching_tasks','coaching_notes','sell_pages',
    'offers','orders','entitlements','aiva_activity','aiva_opportunities','aiva_recommendations',
    'content_relationships','aiva_build_plans','aiva_build_plan_items','ai_personas',
    'knowledge_sources','voice_profiles'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.update_updated_at_column()', t);
  end loop;
end $$;