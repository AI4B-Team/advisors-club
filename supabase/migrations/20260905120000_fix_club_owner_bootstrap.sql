-- Club creation was impossible for every signed-in user.
--
-- Two defects stacked on top of each other, both reachable from the app's only
-- club-creation path (`supabaseClubsRepository.create`):
--
--   1. `handle_new_club` (20260823180241) gives the creator their owner
--      membership from an AFTER INSERT trigger. The role-escalation guard added
--      later (`guard_membership_role`, 20260823181532) refuses any owner grant
--      from an actor who is not already an owner of that club — and the creator
--      never is, because that membership is the very row being inserted. Every
--      `insert into clubs` therefore died with
--      "Only a club owner can grant the owner role".
--
--   2. `clubs` had no SELECT policy an owner could satisfy at INSERT time.
--      "Members read their clubs" needs `is_club_member(id)`, but the owner
--      membership is created by an AFTER trigger, which fires only once the
--      statement — including its RETURNING projection — has been evaluated.
--      Any `insert ... returning` (what the repository does via
--      `.select("*").single()`) therefore died with
--      "new row violates row-level security policy for table clubs".
--
-- Both fixes stay inside the documented authority model: only the club's own
-- owner of record is affected, and only for the club they own.

-- ---------------------------------------------------------------------------
-- 1. Let a club's owner of record take that club's FIRST owner membership.
-- ---------------------------------------------------------------------------
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

  -- Club bootstrap. `handle_new_club` inserts exactly one row on the creator's
  -- behalf: themselves, as owner, into the club they own, while that club still
  -- has no active owner. That is the only membership row this branch admits, so
  -- it cannot be used to grant a role to anyone else, to raise anyone's rank in
  -- an established club, or to seize a club that already has an active owner.
  if tg_op = 'INSERT'
     and new.role = 'owner'
     and new.status = 'active'
     and new.user_id = actor
     and exists (
       select 1 from public.clubs c
       where c.id = new.club_id and c.owner_id = actor
     )
     and not exists (
       select 1 from public.club_memberships m
       where m.club_id = new.club_id
         and m.role = 'owner'
         and m.status = 'active'
     )
  then
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

-- ---------------------------------------------------------------------------
-- 2. A club's owner of record can read that club.
-- ---------------------------------------------------------------------------
-- Strictly narrower than the rights they already hold: "Owners update their
-- club" and "Owners delete their club" are both live. Without this, an owner
-- cannot even read back the club they just created.
drop policy if exists "Owners read their club" on public.clubs;
create policy "Owners read their club" on public.clubs for select to authenticated
  using (owner_id = auth.uid());
