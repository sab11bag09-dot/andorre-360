import { FetchHttpClient } from "./http/FetchHttpClient";
import type {
  HttpClient,
  HttpResponse,
} from "./http/HttpClient";
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

class SourceCheckTimeoutError extends Error {
  constructor() {
    super(
      `La source n'a pas répondu dans le délai de ${
        SOURCE_CHECK_TIMEOUT_MS / 1000
      } secondes.`,
    );

    this.name = "SourceCheckTimeoutError";
  }
}

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
      .trim()
      .slice(0, MAX_ERROR_MESSAGE_LENGTH);
  }

  return "Une erreur inconnue est survenue.";
}

async function executeHttpCheck(
  url: string,
  httpClient: HttpClient,
): Promise<HttpResponse> {
  const controller = new AbortController();

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(new SourceCheckTimeoutError());
    }, SOURCE_CHECK_TIMEOUT_MS);
  });

  try {
    return await Promise.race([
      httpClient.get({
        url,
        signal: controller.signal,
      }),
      timeoutPromise,
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function getResponseTime(startedAt: number): number {
  return Math.round(Date.now() - startedAt);
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

  const startedAt = Date.now();

  let response: HttpResponse;

  try {
    response = await executeHttpCheck(
      source.url,
      httpClient,
    );
  } catch (error) {
    const responseTimeMs = getResponseTime(startedAt);
    const checkedAt = new Date();
    const isTimeout =
  error instanceof SourceCheckTimeoutError ||
  (error instanceof Error && error.name === "AbortError");

const message = isTimeout
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
  }

  const responseTimeMs = getResponseTime(startedAt);
  const checkedAt = new Date();

  if (!response.ok) {
    const message =
      `La source a répondu avec le statut HTTP ` +
      `${response.status}.`;

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
}