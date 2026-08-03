export type ScheduledSource = {
  id: number;
  checkIntervalMinutes: number;
  lastCheckedAt: Date | null;
};

export interface ScheduledSourceRepository {
  findActive(): Promise<ScheduledSource[]>;
  claim(
    source: ScheduledSource,
    claimedAt: Date,
  ): Promise<boolean>;
}
