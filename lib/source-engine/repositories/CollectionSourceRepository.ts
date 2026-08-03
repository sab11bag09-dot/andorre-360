import { Source } from "@/lib/generated/prisma/client";

export interface CollectionSourceRepository {
  findById(id: number): Promise<Source | null>;
  markCollectionSucceeded(
    id: number,
    checkedAt: Date,
  ): Promise<void>;
  markCollectionFailed(
    id: number,
    checkedAt: Date,
    message: string,
  ): Promise<void>;
}
