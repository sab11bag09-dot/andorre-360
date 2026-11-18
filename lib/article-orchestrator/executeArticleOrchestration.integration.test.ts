import { existsSync, readFileSync, readdirSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaClient } from "@/lib/generated/prisma/client";

import { executeArticleOrchestration } from "./executeArticleOrchestration";
import { DEFAULT_ARTICLE_ORCHESTRATION_POLICY } from "./selectObservationsForArticles";

// Ces scénarios placent volontairement plusieurs observations d’une même
// source dans le lot : la limite par source est testée séparément.
const MULTI_SOURCE_POLICY = { ...DEFAULT_ARTICLE_ORCHESTRATION_POLICY, maxPerSource: 5 };

const databasePath = join(
  tmpdir(),
  `andorre-360-article-orchestrator-run-${process.pid}-${crypto.randomUUID()}.db`,
);
const client = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: `file:${databasePath}` }),
});

const NOW = new Date("2026-11-18T12:00:00.000Z");
const CONTENT = "Le Govern d’Andorra présente une nouvelle mesure. ".repeat(10);

function hoursAgo(hours: number): Date {
  return new Date(NOW.getTime() - hours * 60 * 60 * 1_000);
}

beforeAll(() => {
  const database = new Database(databasePath);
  const migrationsPath = join(process.cwd(), "prisma", "migrations");
  database.pragma("foreign_keys = ON");

  for (const directory of readdirSync(migrationsPath).sort()) {
    const migrationPath = join(migrationsPath, directory, "migration.sql");
    if (existsSync(migrationPath)) {
      database.exec(readFileSync(migrationPath, "utf8"));
    }
  }

  database.close();
});

afterAll(async () => {
  await client.$disconnect();
  for (const suffix of ["", "-wal", "-shm", "-journal"]) {
    if (existsSync(`${databasePath}${suffix}`)) unlinkSync(`${databasePath}${suffix}`);
  }
});

let sourceId: number;
let observationIds: number[];
let env: Record<string, string | undefined>;

beforeEach(async () => {
  await client.articleOrchestrationItem.deleteMany();
  await client.articleOrchestrationRun.deleteMany();
  await client.observation.deleteMany();
  await client.source.deleteMany();

  const source = await client.source.create({
    data: {
      name: "Govern d’Andorra",
      url: "https://www.govern.ad/",
      publicationMode: "AUTO",
      trustLevel: "OFFICIAL",
    },
  });
  sourceId = source.id;

  observationIds = [];
  for (const [index, title] of [
    "Le Govern présente une aide au logement",
    "Le Govern ouvre une consultation publique",
  ].entries()) {
    const observation = await client.observation.create({
      data: {
        sourceId,
        title,
        url: `https://www.govern.ad/actualitat/${index}`,
        publishedAt: hoursAgo(index + 1),
        content: CONTENT,
        collectedAt: hoursAgo(index + 1),
      },
    });
    observationIds.push(observation.id);
  }

  env = {
    AI_ARTICLE_ORCHESTRATOR_ENABLED: "true",
    AI_AUTO_PUBLICATION_ENABLED: "true",
    AI_AUTO_PUBLICATION_EMERGENCY_STOP: "false",
    AI_AUTO_PUBLICATION_SOURCE_IDS: String(sourceId),
  };
});

function fakeCreateArticle() {
  let nextArticleId = 500;
  return vi.fn<(observationId: number) => Promise<{ articleId: number }>>(
    async () => ({ articleId: nextArticleId++ }),
  );
}

function run(createArticle: (observationId: number) => Promise<{ articleId: number }>) {
  return executeArticleOrchestration(client, {
    now: NOW,
    policy: MULTI_SOURCE_POLICY,
    env,
    createArticle,
    sleep: async () => {},
  });
}

describe("executeArticleOrchestration", () => {
  it("does nothing without the dedicated orchestrator switch", async () => {
    delete env.AI_ARTICLE_ORCHESTRATOR_ENABLED;
    const createArticle = fakeCreateArticle();

    const result = await run(createArticle);

    expect(result.status).toBe("BLOCKED");
    expect(result.blockedReasons).toContain("orchestrator_disabled");
    expect(createArticle).not.toHaveBeenCalled();
    expect(await client.articleOrchestrationItem.count()).toBe(0);
    expect(
      await client.articleOrchestrationRun.findFirstOrThrow(),
    ).toMatchObject({ status: "BLOCKED", activeLock: null });
  });

  it("does nothing while the auto-publication emergency stop is active", async () => {
    env.AI_AUTO_PUBLICATION_EMERGENCY_STOP = "true";
    const createArticle = fakeCreateArticle();

    const result = await run(createArticle);

    expect(result.status).toBe("BLOCKED");
    expect(result.blockedReasons).toContain("emergency_stop");
    expect(createArticle).not.toHaveBeenCalled();
  });

  it("creates one article per selected observation and records the run", async () => {
    const createArticle = fakeCreateArticle();

    const result = await run(createArticle);

    if (result.status !== "COMPLETED") throw new Error(result.status);
    expect(createArticle.mock.calls.map(([id]) => id)).toEqual(observationIds);
    expect(result.items).toEqual([
      { observationId: observationIds[0], status: "CREATED", articleId: 500 },
      { observationId: observationIds[1], status: "CREATED", articleId: 501 },
    ]);

    const stored = await client.articleOrchestrationRun.findUniqueOrThrow({
      where: { id: result.runId },
      include: { items: true },
    });
    expect(stored.status).toBe("COMPLETED");
    expect(stored.activeLock).toBeNull();
    expect(stored.finishedAt).not.toBeNull();
    expect(stored.items.map((item) => item.status)).toEqual(["CREATED", "CREATED"]);
  });

  it("never generates twice for the same observation when relaunched", async () => {
    // Le faux générateur ne marque pas l’observation comme traitée :
    // seule la réservation durable doit empêcher la seconde génération.
    const createArticle = fakeCreateArticle();

    await run(createArticle);
    const second = await run(createArticle);

    expect(createArticle).toHaveBeenCalledTimes(2);
    expect(second.status).toBe("COMPLETED");
    expect(second.items).toEqual([]);
  });

  it("isolates a failure and never retries it automatically", async () => {
    const createArticle = vi.fn(async (observationId: number) => {
      if (observationId === observationIds[0]) {
        throw new Error("OpenAI indisponible");
      }
      return { articleId: 900 };
    });

    const first = await run(createArticle);
    const second = await run(createArticle);

    expect(first.status).toBe("COMPLETED");
    expect(first.items).toEqual([
      {
        observationId: observationIds[0],
        status: "FAILED",
        errorMessage: "OpenAI indisponible",
      },
      { observationId: observationIds[1], status: "CREATED", articleId: 900 },
    ]);
    expect(createArticle).toHaveBeenCalledTimes(2);
    expect(second.items).toEqual([]);
    expect(
      await client.articleOrchestrationItem.findUniqueOrThrow({
        where: { observationId: observationIds[0] },
      }),
    ).toMatchObject({ status: "FAILED", errorMessage: "OpenAI indisponible" });
  });

  it("does not let a failed observation occupy the batch forever", async () => {
    const createArticle = vi.fn(async (observationId: number) => {
      if (observationId === observationIds[0]) throw new Error("échec");
      return { articleId: 901 };
    });
    const policy = { ...MULTI_SOURCE_POLICY, maxSelected: 1 };
    const runWithPolicy = () =>
      executeArticleOrchestration(client, {
        now: NOW,
        env,
        policy,
        createArticle,
        sleep: async () => {},
      });

    await runWithPolicy();
    const second = await runWithPolicy();

    expect(second.items).toEqual([
      { observationId: observationIds[1], status: "CREATED", articleId: 901 },
    ]);
  });

  it("refuses to start while another run holds the lock", async () => {
    await client.articleOrchestrationRun.create({
      data: { id: "running", activeLock: "active", policy: "{}", plan: "{}" },
    });
    const createArticle = fakeCreateArticle();

    const result = await run(createArticle);

    expect(result.status).toBe("ALREADY_RUNNING");
    expect(createArticle).not.toHaveBeenCalled();
    expect(await client.articleOrchestrationItem.count()).toBe(0);
  });

  it("stops before the next observation when the emergency stop is raised mid-run", async () => {
    const createArticle = vi.fn(async () => {
      env.AI_AUTO_PUBLICATION_EMERGENCY_STOP = "true";
      return { articleId: 700 };
    });

    const result = await run(createArticle);

    expect(createArticle).toHaveBeenCalledTimes(1);
    expect(result.status).toBe("COMPLETED");
    expect(result.items).toEqual([
      { observationId: observationIds[0], status: "CREATED", articleId: 700 },
      { observationId: observationIds[1], status: "STOPPED" },
    ]);
    expect(await client.articleOrchestrationItem.count()).toBe(1);
  });

  it("records the administrator who launched the run", async () => {
    const result = await executeArticleOrchestration(client, {
      now: NOW,
      policy: MULTI_SOURCE_POLICY,
      env,
      createArticle: fakeCreateArticle(),
      sleep: async () => {},
      actor: { id: "admin-1", email: "admin@example.com" },
    });

    if (result.status !== "COMPLETED") throw new Error(result.status);
    expect(
      await client.articleOrchestrationRun.findUniqueOrThrow({
        where: { id: result.runId },
      }),
    ).toMatchObject({ actorId: "admin-1", actorEmail: "admin@example.com" });
  });

  it("refuses to generate when the selection differs from the reviewed preview", async () => {
    const createArticle = fakeCreateArticle();

    const result = await executeArticleOrchestration(client, {
      now: NOW,
      policy: MULTI_SOURCE_POLICY,
      env,
      createArticle,
      sleep: async () => {},
      expectedSelectedObservationIds: [observationIds[0]],
    });

    expect(result.status).toBe("PLAN_CHANGED");
    expect(createArticle).not.toHaveBeenCalled();
    expect(await client.articleOrchestrationRun.count()).toBe(0);
    expect(await client.articleOrchestrationItem.count()).toBe(0);
  });

  it("generates when the selection matches the reviewed preview, in any order", async () => {
    const createArticle = fakeCreateArticle();

    const result = await executeArticleOrchestration(client, {
      now: NOW,
      policy: MULTI_SOURCE_POLICY,
      env,
      createArticle,
      sleep: async () => {},
      expectedSelectedObservationIds: [...observationIds].reverse(),
    });

    expect(result.status).toBe("COMPLETED");
    expect(createArticle).toHaveBeenCalledTimes(2);
  });

  it("waits between two generations", async () => {
    const sleep = vi.fn(async () => {});

    await executeArticleOrchestration(client, {
      now: NOW,
      policy: MULTI_SOURCE_POLICY,
      env,
      createArticle: fakeCreateArticle(),
      sleep,
      delayBetweenArticlesMs: 2_000,
    });

    expect(sleep).toHaveBeenCalledTimes(1);
    expect(sleep).toHaveBeenCalledWith(2_000);
  });
});
