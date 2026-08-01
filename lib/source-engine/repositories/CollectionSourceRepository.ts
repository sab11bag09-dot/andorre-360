import { Source } from "@/lib/generated/prisma/client";

export interface CollectionSourceRepository {
  findById(id: number): Promise<Source | null>;
}