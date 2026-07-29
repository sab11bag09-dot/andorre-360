import { FetchHttpClient } from "./http/FetchHttpClient";
import type { HttpClient } from "./http/HttpClient";
import {
  PrismaSourceRepository,
} from "./repositories/PrismaSourceRepository";
import type { SourceRepository } from "./repositories/SourceRepository";

const SOURCE_CHECK_TIMEOUT_MS = 10_000;
const MAX_ERROR_MESSAGE_LENGTH = 1_000;

export type SourceCheckResult = {
  success: boolean;
  status?: number;
  responseTimeMs: number;
  message: string;
};

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message.slice(0, MAX_ERROR_MESSAGE_LENGTH);
  }

  return "Une erreur inconnue est survenue.";
}

export async function checkSource(
  sourceId: number,
  repository: SourceRepository = new PrismaSourceRepository(),
  httpClient: HttpClient = new FetchHttpClient(),
): Promise<SourceCheckResult> {
  if (!Number.isInteger(sourceId) || sourceId < 1) {
    throw new Error("Identifiant de source invalide.");
  }

  const source = await repository.findById(sourceId);

  if (!source) {
    throw new Error("Source introuvable.");
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, SOURCE_CHECK_TIMEOUT_MS);

  const startedAt = performance.now();

  try {
    const response = await httpClient.get({
      url: source.url,
      signal: controller.signal,
    });

    const responseTimeMs = Math.round(performance.now() - startedAt);
    const checkedAt = new Date();

    if (!response.ok) {
      const message = `La source a répondu avec le statut HTTP ${response.status}.`;

      await repository.markUnavailable(
        source.id,
        checkedAt,
        message,
      );

      return {
        success: false,
        status: response.status,
        responseTimeMs,
        message,
      };
    }

    await repository.markAvailable(
      source.id,
      checkedAt,
    );

    return {
      success: true,
      status: response.status,
      responseTimeMs,
      message: `Source accessible en ${responseTimeMs} ms.`,
    };
  } catch (error) {
    const responseTimeMs = Math.round(performance.now() - startedAt);
    const checkedAt = new Date();

    const message =
      error instanceof Error && error.name === "AbortError"
        ? `La source n'a pas répondu dans le délai de ${
            SOURCE_CHECK_TIMEOUT_MS / 1000
          } secondes.`
        : normalizeErrorMessage(error);

    await repository.markUnavailable(
      source.id,
      checkedAt,
      message,
    );

    return {
      success: false,
      responseTimeMs,
      message,
    };
  } finally {
    clearTimeout(timeout);
  }
}