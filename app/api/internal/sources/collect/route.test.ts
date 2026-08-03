import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { collectDueSources } = vi.hoisted(() => ({
  collectDueSources: vi.fn(),
}));

vi.mock("@/lib/source-engine/collectDueSources", () => ({
  collectDueSources,
}));

import { GET, POST } from "./route";

const originalSecret = process.env.SOURCE_COLLECTION_SECRET;
const originalBatchSize = process.env.SOURCE_COLLECTION_BATCH_SIZE;

function request(authorization?: string): Parameters<typeof GET>[0] {
  return new Request("http://localhost/api/internal/sources/collect", {
    headers: authorization ? { authorization } : undefined,
  }) as Parameters<typeof GET>[0];
}

describe("endpoint de collecte planifiée", () => {
  beforeEach(() => {
    collectDueSources.mockReset();
    delete process.env.SOURCE_COLLECTION_SECRET;
    delete process.env.SOURCE_COLLECTION_BATCH_SIZE;
  });

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.SOURCE_COLLECTION_SECRET;
    } else {
      process.env.SOURCE_COLLECTION_SECRET = originalSecret;
    }

    if (originalBatchSize === undefined) {
      delete process.env.SOURCE_COLLECTION_BATCH_SIZE;
    } else {
      process.env.SOURCE_COLLECTION_BATCH_SIZE = originalBatchSize;
    }
  });

  it("refuse de fonctionner sans secret configuré", async () => {
    const response = await GET(request());

    expect(response.status).toBe(503);
    expect(collectDueSources).not.toHaveBeenCalled();
  });

  it("refuse un secret invalide avant toute collecte", async () => {
    process.env.SOURCE_COLLECTION_SECRET = "secret-valide";

    const response = await POST(request("Bearer mauvais-secret"));

    expect(response.status).toBe(401);
    expect(collectDueSources).not.toHaveBeenCalled();
  });

  it("déclenche un lot autorisé avec la limite configurée", async () => {
    process.env.SOURCE_COLLECTION_SECRET = "secret-valide";
    process.env.SOURCE_COLLECTION_BATCH_SIZE = "7";
    collectDueSources.mockResolvedValue({
      attempted: 1,
      succeeded: 1,
      failed: 0,
      collected: 2,
      created: 1,
      failures: [],
    });

    const response = await GET(request("Bearer secret-valide"));

    expect(response.status).toBe(200);
    expect(collectDueSources).toHaveBeenCalledWith({ batchSize: 7 });
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ succeeded: 1, created: 1 }),
    );
  });
});
