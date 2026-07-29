import type {
  Observation,
  Source,
} from "@/lib/generated/prisma/client";

import type { ObservationInput } from "../collectors/Collector";

export type ObservationWithSource = Observation & {
  source: Source;
};

export interface ObservationRepository {
  findById(
    id: number,
  ): Promise<ObservationWithSource | null>;

  findUnprocessed(): Promise<Observation[]>;

  markProcessed(
    id: number,
    articleId: number,
  ): Promise<void>;

  saveMany(
    sourceId: number,
    observations: ObservationInput[],
  ): Promise<number>;
}