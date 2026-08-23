// Supabase implementation of the navigation repository.

import { supabase } from "@/integrations/supabase/client";
import { RepositoryError } from "@/lib/data/repository";
import type { NavItem } from "./config";
import type { NavConfig } from "./store";
import type { NavigationRepository } from "./repository";

export const supabaseNavigationRepository: NavigationRepository = {
  async read(clubId) {
    const { data, error } = await supabase
      .from("club_navigation").select("items").eq("club_id", clubId).maybeSingle();
    if (error) throw new RepositoryError("Could not load navigation", error);
    if (!data) return null;
    const items = (data.items as unknown as NavItem[]) ?? [];
    return items.length ? { items } : null;
  },

  async write(clubId, value) {
    const { error } = await supabase
      .from("club_navigation")
      .upsert({ club_id: clubId, items: value.items as never }, { onConflict: "club_id" });
    if (error) throw new RepositoryError("Could not save navigation", error);
    return value;
  },
};
