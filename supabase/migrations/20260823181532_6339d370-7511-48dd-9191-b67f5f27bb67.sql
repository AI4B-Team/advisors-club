-- Self-service join: a signed-in user may create their OWN membership in a
-- public, published club, and only ever as a plain active member.
create policy "Members can join public clubs"
on public.club_memberships
for insert
to authenticated
with check (
  user_id = auth.uid()
  and role = 'member'
  and status = 'active'
  and public.is_public_club(club_id)
);

-- Role-escalation guard. RLS says "an admin may write membership rows";
-- this trigger says which roles they may write, and stops self-promotion.
create or replace function public.guard_membership_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  actor_role public.club_role;
begin
  if actor is null or public.is_platform_admin() then
    return new;
  end if;

  actor_role := public.club_role_of(new.club_id, actor);

  -- Staff roles are owner-granted only.
  if new.role in ('owner','admin')
     and coalesce(actor_role, 'member') <> 'owner' then
    raise exception 'Only a club owner can grant the % role', new.role
      using errcode = '42501';
  end if;

  -- Nobody raises their own rank.
  if new.user_id = actor then
    if tg_op = 'UPDATE' and new.role <> old.role
       and public.club_role_rank(new.role) > public.club_role_rank(old.role) then
      raise exception 'You cannot change your own role'
        using errcode = '42501';
    end if;
    if tg_op = 'INSERT' and new.role <> 'member' and actor_role is null then
      raise exception 'You cannot join a club as %', new.role
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

-- Rank helper mirrors the CLUB_ROLE_RANK table in the app.
create or replace function public.club_role_rank(_role public.club_role)
returns integer
language sql
immutable
set search_path = public
as $$
  select case _role
    when 'owner' then 50
    when 'admin' then 40
    when 'moderator' then 30
    when 'coach' then 20
    else 10
  end
$$;

drop trigger if exists guard_membership_role on public.club_memberships;
create trigger guard_membership_role
before insert or update on public.club_memberships
for each row execute function public.guard_membership_role();

-- A club must never be left without an owner.
create or replace function public.guard_last_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role = 'owner' and old.status = 'active'
     and (tg_op = 'DELETE' or new.role <> 'owner' or new.status <> 'active') then
    if (select count(*) from public.club_memberships
        where club_id = old.club_id and role = 'owner'
          and status = 'active' and id <> old.id) = 0 then
      raise exception 'A club must keep at least one active owner'
        using errcode = '42501';
    end if;
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists guard_last_owner on public.club_memberships;
create trigger guard_last_owner
before update or delete on public.club_memberships
for each row execute function public.guard_last_owner();

-- Platform roles are support tooling: only platform admins may change them.
create policy "Platform admins manage platform roles"
on public.user_platform_roles
for all
to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

grant select on public.user_platform_roles to authenticated;
grant all on public.user_platform_roles to service_role;