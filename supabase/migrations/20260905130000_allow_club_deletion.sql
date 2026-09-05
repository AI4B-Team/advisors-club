-- A club could never be deleted — by its owner, by a platform admin, or even
-- by service_role.
--
-- `clubs` is deleted, the `club_memberships.club_id` foreign key cascades, and
-- `guard_last_owner` sees the owner's membership being removed while no other
-- active owner remains. It raises, and the whole delete rolls back. The
-- "Owners delete their club" policy from 20260823180241 was therefore dead:
-- every delete failed with "A club must keep at least one active owner".
--
-- The guard exists to stop a club from being stranded without an owner. A club
-- that is itself being deleted cannot be stranded, so the guard now stands down
-- once its club row is gone. During the cascade the parent row is already
-- removed when the child trigger fires, which is exactly that condition.

create or replace function public.guard_last_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- The club is going away with this statement; there is nothing left to own.
  if tg_op = 'DELETE'
     and not exists (select 1 from public.clubs where id = old.club_id) then
    return old;
  end if;

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
