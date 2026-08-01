import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { HttpClient } from "./http/HttpClient";
import type {
  SourceForCheck,
  SourceRepository,
} from "./repositories/SourceRepository";
import { checkSource } from "./checkSource";

function createRepository(
  source: SourceForCheck | null = {
    id: 1,
    url: "https://example.com/feed.xml",
  },
) {
  return {
    findById: vi.fn(async () => source),
    markAvailable: vi.fn(async () => undefined),
    markUnavailable: vi.fn(async () => undefined),
  } satisfies SourceRepository;
}

function createHttpClient(
  response: {
    ok: boolean;
    status: number;
  } = {
    ok: true,
    status: 200,
  },
) {
  return {
    get: vi.fn(async () => response),
  } satisfies HttpClient;
}

describe("checkSource", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("rejette un identifiant invalide", async () => {
    const repository = createRepository();
    const httpClient = createHttpClient();

    await expect(
      checkSource(0, repository, httpClient),
    ).rejects.toThrow("Identifiant de source invalide.");

    expect(repository.findById).not.toHaveBeenCalled();
    expect(httpClient.get).not.toHaveBeenCalled();
  });

  it("rejette une source introuvable", async () => {
    const repository = createRepository(null);
    const httpClient = createHttpClient();

    await expect(
      checkSource(1, repository, httpClient),
    ).rejects.toThrow("Source introuvable.");

    expect(repository.findById).toHaveBeenCalledWith(1);
    expect(repository.markAvailable).not.toHaveBeenCalled();
    expect(repository.markUnavailable).not.toHaveBeenCalled();
    expect(httpClient.get).not.toHaveBeenCalled();
  });

  it("marque la source comme disponible après une réponse HTTP 200", async () => {
    const repository = createRepository();
    const httpClient = createHttpClient({
      ok: true,
      status: 200,
    });

    const result = await checkSource(
      1,
      repository,
      httpClient,
    );

    expect(httpClient.get).toHaveBeenCalledWith({
      url: "https://example.com/feed.xml",
      signal: expect.any(AbortSignal),
    });

    expect(repository.markAvailable).toHaveBeenCalledWith(
      1,
      expect.any(Date),
    );

    expect(
      repository.markUnavailable,
    ).not.toHaveBeenCalled();

    expect(result).toMatchObject({
      success: true,
      status: 200,
    });

    expect(result.responseTimeMs).toBeGreaterThanOrEqual(0);
    expect(result.message).toMatch(
      /^Source accessible en \d+ ms\.$/,
    );
  });

  it("marque la source comme indisponible après une réponse HTTP 404", async () => {
    const repository = createRepository();
    const httpClient = createHttpClient({
      ok: false,
      status: 404,
    });

    const result = await checkSource(
      1,
      repository,
      httpClient,
    );

    const expectedMessage =
      "La source a répondu avec le statut HTTP 404.";

    expect(repository.markUnavailable).toHaveBeenCalledWith(
      1,
      expect.any(Date),
      expectedMessage,
    );

    expect(repository.markAvailable).not.toHaveBeenCalled();

    expect(result).toMatchObject({
      success: false,
      status: 404,
      message: expectedMessage,
    });

    expect(result.responseTimeMs).toBeGreaterThanOrEqual(0);
  });

  it("marque la source comme indisponible après une erreur réseau", async () => {
    const repository = createRepository();

    const httpClient = {
      get: vi.fn(async () => {
        throw new Error("Connexion refusée.");
      }),
    } satisfies HttpClient;

    const result = await checkSource(
      1,
      repository,
      httpClient,
    );

    expect(repository.markUnavailable).toHaveBeenCalledWith(
      1,
      expect.any(Date),
      "Connexion refusée.",
    );

    expect(repository.markAvailable).not.toHaveBeenCalled();

    expect(result).toMatchObject({
      success: false,
      message: "Connexion refusée.",
    });

    expect(result.status).toBeUndefined();
  });

  it("interrompt la vérification après un délai de 10 secondes", async () => {
    vi.useFakeTimers();

    const repository = createRepository();

    const httpClient = {
      get: vi.fn(
        ({ signal }: Parameters<HttpClient["get"]>[0]) =>
          new Promise<never>((_, reject) => {
            signal.addEventListener(
              "abort",
              () => {
                const error = new Error(
                  "La requête a été interrompue.",
                );

                error.name = "AbortError";
                reject(error);
              },
              {
                once: true,
              },
            );
          }),
      ),
    } satisfies HttpClient;

    const checkPromise = checkSource(
      1,
      repository,
      httpClient,
    );

    await vi.advanceTimersByTimeAsync(10_000);

    const result = await checkPromise;

    const expectedMessage =
      "La source n'a pas répondu dans le délai de 10 secondes.";

    expect(repository.markUnavailable).toHaveBeenCalledWith(
      1,
      expect.any(Date),
      expectedMessage,
    );

    expect(repository.markAvailable).not.toHaveBeenCalled();

    expect(result).toMatchObject({
      success: false,
      message: expectedMessage,
    });

    expect(result.status).toBeUndefined();
  });
});