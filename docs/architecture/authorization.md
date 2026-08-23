# Authorization

## The model

Authority is never a UI state. It is the product of three server-validated facts,
always scoped to one club:

```
Supabase Auth user  +  active club_memberships row  +  club_role
```

The same person can be an `owner` in one club and a plain `member` in another.
Nothing on the client can add authority.

Roles, weakest to strongest: `member`, `coach`, `moderator`, `admin`, `owner`.
`platform_admin` / `support` (in `user_platform_roles`) are support tooling on
top, not a replacement for membership.

## Layers

| Layer | File | Job |
| --- | --- | --- |
| Capability map | `src/lib/auth/permissions.ts` | Pure `role → capabilities`. No storage, no network. |
| Server resolver | `src/lib/auth/access.functions.ts` | `getClubAccess` reads membership + platform roles through RLS with the caller's own token. |
| Client context | `src/hooks/use-club-access.tsx` | Resolves user → club → role → `Permissions`; exposes `usePermissions()`. |
| Preview switcher | `src/hooks/use-view-mode.tsx` | Admin/Member **preview only**. Refuses admin mode without `club.manage`. |
| Route gate | `RequirePermission` + `ROUTE_CAPABILITY` | Keeps unauthorized people out of admin screens. |
| Database | RLS policies + `guard_membership_role` / `guard_last_owner` | The actual boundary. |

## Rules for new code

1. Gate on capabilities: `const p = usePermissions(); p.canManageApps()`. Never test a role inline, never test `isAdmin` from the view switcher.
2. New admin surface → add its path to `ROUTE_CAPABILITY`; the gate applies automatically.
3. New gated action → add a `Capability`, assign it to roles, done.
4. Access decisions (`CommerceViewer.canBypassPaywall`, apps `Viewer.canManage`) must be fed from `usePermissions()`.
5. Any server function touching club data uses `requireSupabaseAuth` and lets RLS scope it; privileged work re-checks the role server-side.

## Escalation guards

* Self-join is allowed only as `member`, only into a public + published club.
* Only owners may grant `owner` or `admin`.
* Nobody can raise their own rank.
* A club always keeps at least one active owner.
* `user_platform_roles` is writable only by platform admins.

## Prototype mode

Domains still backed by `localStorage` have no club row to authorize against.
`use-club-access` then marks facts `source: "prototype"` and treats the local
operator as an owner so the sandbox keeps working. This affects local demo data
only — every Supabase read/write still goes through RLS, which ignores anything
the client believes about itself. As each domain migrates, its club id becomes
real and the facts flip to `source: "server"` with no UI change.
