import {
  collectSource,
  type CollectionResult,
} from "./collectSource";
import { PrismaScheduledSourceRepository } from "./repositories/PrismaScheduledSourceRepository";
import type {
  ScheduledSource,
  ScheduledSourceRepository,
} from "./repositories/ScheduledSourceRepository";

const DEFAULT_BATCH_SIZE = 10;
const MAX_BATCH_SIZE = 50;
const MAX_ERROR_MESSAGE_LENGTH = 500;

export type ScheduledCollectionResult = {
  attempted: number;
  succeeded: number;
  failed: number;
  collected: number;
  created: number;
  failures: Array<{ sourceId: number; message: string }>;
};

type CollectOneSource = (
  sourceId: number,
) => Promise<CollectionResult>;

function isDue(source: ScheduledSource, now: Date): boolean {
  if (!source.lastCheckedAt) {
    return true;
  }

  const intervalMs = source.checkIntervalMinutes * 60_000;

  return source.lastCheckedAt.getTime() <= now.getTime() - intervalMs;
}

function normalizeBatchSize(value: number): number {
  if (!Number.isInteger(value) || value < 1) {
    return DEFAULT_BATCH_SIZE;
  }

  return Math.min(value, MAX_BATCH_SIZE);
}

function normalizeError(error: unknown): string {
  const message =
    error instanceof Error ? error.message.trim() : "Erreur inconnue";

  return (message || "Erreur inconnue").slice(
    0,
    MAX_ERROR_MESSAGE_LENGTH,
  );
}

export async function collectDueSources(
  options: {
    now?: Date;
    batchSize?: number;
  } = {},
  repository: ScheduledSourceRepository =
    new PrismaScheduledSourceRepository(),
  collectOne: CollectOneSource = collectSource,
): Promise<ScheduledCollectionResult> {
  const now = options.now ?? new Date();
  const batchSize = normalizeBatchSize(
    options.batchSize ?? DEFAULT_BATCH_SIZE,
  );
  const candidates = (await repository.findActive()).filter((source) =>
    isDue(source, now),
  );

  const result: ScheduledCollectionResult = {
    attempted: 0,
    succeeded: 0,
    failed: 0,
    collected: 0,
    created: 0,
    failures: [],
  };

  for (const source of candidates) {
    if (result.attempted >= batchSize) {
      break;
    }

    const claimed = await repository.claim(source, now);

    if (!claimed) {
      continue;
    }

    result.attempted += 1;

    try {
      const collection = await collectOne(source.id);

      result.succeeded += 1;
      result.collected += collection.collected;
      result.created += collection.created;
    } catch (error) {
      result.failed += 1;
      result.failures.push({
        sourceId: source.id,
        message: normalizeError(error),
      });
    }
  }

  return result;
}
