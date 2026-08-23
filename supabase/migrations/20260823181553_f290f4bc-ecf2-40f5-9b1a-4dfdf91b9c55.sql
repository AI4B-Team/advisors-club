revoke execute on function public.guard_membership_role() from anon, authenticated, public;
revoke execute on function public.guard_last_owner() from anon, authenticated, public;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.handle_new_club() from anon, authenticated, public;
revoke execute on function public.update_updated_at_column() from anon, authenticated, public;
revoke execute on function public.club_role_rank(public.club_role) from anon, public;