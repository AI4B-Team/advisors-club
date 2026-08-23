// The shape every domain repository implements.
//
// Stores (the seam the UI already calls) stay SYNCHRONOUS. Repositories are
// ASYNCHRONOUS. `src/lib/data/cache.ts` bridges the two: it hydrates the
// synchronous cache from the repository and writes mutations through.

/** A collection of club-scoped records with stable string ids. */
export interface CollectionRepository<T extends { id: string }, TNew = Partial<T>> {
  list(clubId: string): Promise<T[]>;
  get(clubId: string, id: string): Promise<T | null>;
  create(clubId: string, input: TNew): Promise<T>;
  update(clubId: string, id: string, patch: Partial<T>): Promise<T | null>;
  remove(clubId: string, id: string): Promise<void>;
}

/** A single per-club document (navigation, persona settings, branding…). */
export interface DocumentRepository<T> {
  read(clubId: string): Promise<T | null>;
  write(clubId: string, value: T): Promise<T>;
}

export class RepositoryError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "RepositoryError";
  }
}
