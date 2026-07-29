import type { ObservationInput } from "../collectors/Collector";

export interface ObservationRepository {
  saveMany(
    sourceId: number,
    observations: ObservationInput[],
  ): Promise<number>;
}