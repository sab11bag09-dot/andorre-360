import { Source } from "@/lib/generated/prisma/client";

import type { CollectionDateSummary } from "../collectionDates";

export interface CollectionSourceRepository {
  findById(id: number): Promise<Source | null>;
  /** Collecte réussie avec au moins une observation. */
  markCollectionSucceeded(
    id: number,
    checkedAt: Date,
    dates?: CollectionDateSummary,
  ): Promise<void>;
  markCollectionFailed(
    id: number,
    checkedAt: Date,
    message: string,
  ): Promise<void>;
  /**
   * Collecte réussie mais vide. Si l’implémentation ne la distingue pas,
   * `markCollectionSucceeded` est appelée à la place.
   */
  markCollectionEmpty?(
    id: number,
    checkedAt: Date,
  ): Promise<void>;
}
