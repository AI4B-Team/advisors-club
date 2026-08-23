// Apps repository — interface + the localStorage implementation that backs
// today's store. The store keeps its existing synchronous API; only the
// implementation behind this interface changes when the domain flips.

import type { CollectionRepository } from "@/lib/data/repository";
import type { App } from "./types";
import type { NewApp } from "./store";

export type AppsRepository = CollectionRepository<App, NewApp>;
