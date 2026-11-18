import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireAdmin,
  planArticleOrchestration,
  executeArticleOrchestration,
  findMany,
  revalidatePath,
} = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  planArticleOrchestration: vi.fn(),
  executeArticleOrchestration: vi.fn(),
  findMany: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/admin/requireAdmin", () => ({ requireAdmin }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/prisma", () => ({ prisma: { observation: { findMany } } }));
vi.mock("@/lib/article-orchestrator/planArticleOrchestration", () => ({
  planArticleOrchestration,
}));
vi.mock(
  "@/lib/article-orchestrator/executeArticleOrchestration",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("@/lib/article-orchestrator/executeArticleOrchestration")
    >()),
    executeArticleOrchestration,
  }),
);

import {
  launchArticleOrchestration,
  previewArticleOrchestration,
} from "./article-orchestration";

const admin = { id: "admin-1", email: "admin@example.com" };

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  requireAdmin.mockResolvedValue(admin);
  findMany.mockImplementation(async ({ where }: { where: { id: { in: number[] } } }) =>
    where.id.in.map((id) => ({
      id,
      title: `Titre ${id}`,
      url: `https://www.govern.ad/${id}`,
      publishedAt: new Date("2026-11-18T10:00:00.000Z"),
      source: { name: "Govern d’Andorra" },
    })),
  );
});

describe("previewArticleOrchestration", () => {
  it("requires an active administrator before reading anything", async () => {
    requireAdmin.mockRejectedValue(new Error("Accès refusé"));

    await expect(previewArticleOrchestration()).rejects.toThrow("Accès refusé");
    expect(planArticleOrchestration).not.toHaveBeenCalled();
  });

  it("shows the selection, the reasons and the orchestrator switch as a blocker", async () => {
    vi.stubEnv("AI_ARTICLE_ORCHESTRATOR_ENABLED", "false");
    planArticleOrchestration.mockResolvedValue({
      generatedAt: new Date("2026-11-18T12:00:00.000Z"),
      loadedObservationCount: 3,
      policy: { maxSelected: 5 },
      selectedObservationIds: [1],
      executionBlockedReasons: ["feature_disabled"],
      decisions: [
        { observationId: 1, sourceId: 10, status: "selected", reasons: [] },
        { observationId: 2, sourceId: 10, status: "skipped", reasons: ["already_processed"] },
        { observationId: 3, sourceId: 10, status: "skipped", reasons: ["published_at_in_future"] },
      ],
    });

    const result = await previewArticleOrchestration();

    if (!result.success) throw new Error(result.message);
    expect(result.selected.map(({ observationId, title }) => [observationId, title])).toEqual([
      [1, "Titre 1"],
    ]);
    expect(result.skippedCount).toBe(2);
    expect(result.routineSkippedCount).toBe(1);
    expect(result.detailedSkipped.map(({ observationId }) => observationId)).toEqual([3]);
    expect(result.skippedByReason).toEqual({
      already_processed: 1,
      published_at_in_future: 1,
    });
    expect(result.blockedReasons).toEqual(["feature_disabled", "orchestrator_disabled"]);
    expect(executeArticleOrchestration).not.toHaveBeenCalled();
  });

  it("does not leak internal errors", async () => {
    planArticleOrchestration.mockRejectedValue(new Error("SQLITE_BUSY /chemin/secret"));

    const result = await previewArticleOrchestration();

    expect(result).toEqual({
      success: false,
      code: "PREVIEW_FAILED",
      message: "L’aperçu de l’orchestrateur n’a pas pu être calculé.",
    });
  });
});

describe("launchArticleOrchestration", () => {
  it("requires an active administrator before generating anything", async () => {
    requireAdmin.mockRejectedValue(new Error("Accès refusé"));

    await expect(launchArticleOrchestration([1])).rejects.toThrow("Accès refusé");
    expect(executeArticleOrchestration).not.toHaveBeenCalled();
  });

  it.each([
    [[]],
    [[0]],
    [[1, 1]],
    [[1.5]],
    [[1, 2, 3, 4, 5, 6]],
    ["1" as unknown as number[]],
  ])("rejects an invalid reviewed selection %j", async (ids) => {
    const result = await launchArticleOrchestration(ids);

    expect(result).toMatchObject({ success: false, code: "INVALID_REQUEST" });
    expect(executeArticleOrchestration).not.toHaveBeenCalled();
  });

  it("passes the administrator and the reviewed selection to the server-side execution", async () => {
    executeArticleOrchestration.mockResolvedValue({
      status: "COMPLETED",
      runId: "run-1",
      blockedReasons: [],
      items: [
        { observationId: 1, status: "CREATED", articleId: 42 },
        { observationId: 2, status: "FAILED", errorMessage: "OpenAI indisponible" },
      ],
    });

    const result = await launchArticleOrchestration([1, 2]);

    expect(executeArticleOrchestration).toHaveBeenCalledWith(expect.anything(), {
      actor: admin,
      expectedSelectedObservationIds: [1, 2],
    });
    expect(result).toEqual({
      success: true,
      runId: "run-1",
      items: [
        { observationId: 1, title: "Titre 1", status: "CREATED", articleId: 42, errorMessage: null },
        {
          observationId: 2,
          title: "Titre 2",
          status: "FAILED",
          articleId: null,
          errorMessage: "OpenAI indisponible",
        },
      ],
    });
  });

  it.each([
    ["BLOCKED", "BLOCKED"],
    ["ALREADY_RUNNING", "ALREADY_RUNNING"],
    ["PLAN_CHANGED", "PLAN_CHANGED"],
  ])("explains a %s refusal without generating", async (status, code) => {
    executeArticleOrchestration.mockResolvedValue({
      status,
      runId: null,
      blockedReasons: [],
      items: [],
      selectedObservationIds: [],
    });

    const result = await launchArticleOrchestration([1]);

    expect(result).toMatchObject({ success: false, code });
  });

  it("does not leak internal errors", async () => {
    executeArticleOrchestration.mockRejectedValue(new Error("SQLITE_BUSY /chemin/secret"));

    const result = await launchArticleOrchestration([1]);

    expect(result).toMatchObject({ success: false, code: "LAUNCH_FAILED" });
    expect(JSON.stringify(result)).not.toContain("secret");
  });
});
