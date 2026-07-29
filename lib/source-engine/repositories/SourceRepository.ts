export type SourceForCheck = {
  id: number;
  url: string;
};

export type SourceAvailability = {
  available: boolean;
  checkedAt: Date;
  message: string | null;
};

export interface SourceRepository {
  findById(id: number): Promise<SourceForCheck | null>;

  markAvailable(
    sourceId: number,
    checkedAt: Date,
  ): Promise<void>;

  markUnavailable(
    sourceId: number,
    checkedAt: Date,
    message: string,
  ): Promise<void>;
}