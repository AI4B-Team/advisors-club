// The active club.
//
// The prototype used a hardcoded `WORKSPACE_ID = "default"`. Production uses a
// real club UUID. This module is the ONLY place that answers "which club am I
// looking at?" so no repository ever invents a tenant id.

import { supabase } from "@/integrations/supabase/client";
import { supabaseClubsRepository } from "./supabase-repository";
import type { ClubRecord, ClubRole } from "./types";

const KEY = "ac:active-club";
const EVT = "ac:active-club:change";

/**
 * Prototype tenant id. Still returned while a domain is localStorage-backed so
 * existing keys keep resolving. Never written to Supabase.
 */
export const LOCAL_CLUB_ID = "default";

let cached: ClubRecord | null = null;
let cachedRole: ClubRole | null = null;

export function activeClubId(): string {
  if (typeof window === "undefined") return LOCAL_CLUB_ID;
  return window.localStorage.getItem(KEY) ?? LOCAL_CLUB_ID;
}

export function setActiveClubId(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, id);
  cached = null;
  cachedRole = null;
  window.dispatchEvent(new Event(EVT));
}

export function subscribeActiveClub(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVT, fn);
  return () => window.removeEventListener(EVT, fn);
}

/** True once a real club UUID has been selected. */
export function hasRealClub(): boolean {
  return activeClubId() !== LOCAL_CLUB_ID;
}

export function activeClub(): ClubRecord | null {
  return cached;
}

export function activeClubRole(): ClubRole | null {
  return cachedRole;
}

/**
 * Resolves the active club from Supabase: the stored id when it is still
 * valid, otherwise the first club the signed-in user belongs to.
 */
export async function resolveActiveClub(): Promise<ClubRecord | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const stored = activeClubId();
  let club = hasRealClub() ? await supabaseClubsRepository.getById(stored) : null;
  if (!club) {
    const mine = await supabaseClubsRepository.listMine();
    club = mine[0] ?? null;
    if (club) setActiveClubId(club.id);
  }
  cached = club;
  cachedRole = club ? await supabaseClubsRepository.myRole(club.id) : null;
  return club;
}

/** Throws rather than silently writing tenant-less rows. */
export function requireClubId(): string {
  const id = activeClubId();
  if (id === LOCAL_CLUB_ID) {
    throw new Error("No club selected — cannot write club-scoped data yet.");
  }
  return id;
}
