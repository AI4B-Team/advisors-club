// Navigation repository — one document per club (`club_navigation.items`).

import type { DocumentRepository } from "@/lib/data/repository";
import type { NavConfig } from "./store";

export type NavigationRepository = DocumentRepository<NavConfig>;
