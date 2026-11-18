import { existsSync, readFileSync, readdirSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { PrismaClient } from "@/lib/generated/prisma/client";

import { planArticleOrchestration } from "./planArticleOrchestration";

const databasePath = join(
  tmpdir(),
  `andorre-360-article-orchestrator-${process.pid}-${crypto.randomUUID()}.db`,
);
const client = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: `file:${databasePath}` }),
});

const NOW = new Date("2026-11-18T12:00:00.000Z");
const CONTENT = "Le Comú d’Andorra la Vella présente son budget. ".repeat(10);
const openConfig = { enabled: true, emergencyStop: false, sourceIds: [] as number[] };

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

beforeEach(async () => {
  await client.observation.deleteMany();
  await client.source.deleteMany();

  const source = await client.source.create({
    data: {
      name: "Comú d’Andorra la Vella",
      url: "https://www.andorralavella.ad/",
      publicationMode: "AUTO",
      trustLevel: "OFFICIAL",
    },
  });
  sourceId = source.id;
});

async function countWrites() {
  return {
    observations: await client.observation.count(),
    processed: await client.observation.count({ where: { processed: true } }),
    articles: await client.article.count(),
  };
}

describe("planArticleOrchestration", () => {
  it("plans from the database without writing anything", async () => {
    await client.observation.createMany({
      data: [
        {
          sourceId,
          title: "Le Comú présente son budget 2027",
          url: "https://www.andorralavella.ad/budget-2027",
          publishedAt: hoursAgo(3),
          content: CONTENT,
          collectedAt: hoursAgo(2),
        },
        {
          sourceId,
          title: "Une date future mal interprétée",
          url: "https://www.andorralavella.ad/futur",
          publishedAt: new Date("2027-02-11T00:00:00.000Z"),
          content: CONTENT,
          collectedAt: hoursAgo(2),
        },
      ],
    });
    const before = await countWrites();

    const plan = await planArticleOrchestration(client, {
      now: NOW,
      runtimeConfig: { ...openConfig, sourceIds: [sourceId] },
    });

    expect(plan.loadedObservationCount).toBe(2);
    expect(plan.selectedObservationIds).toHaveLength(1);
    expect(plan.executionBlockedReasons).toEqual([]);
    expect(
      plan.decisions.find((decision) => decision.status === "skipped")?.reasons,
    ).toEqual(["published_at_in_future"]);
    expect(await countWrites()).toEqual(before);
  });

  it("uses recently processed observations to avoid a second article on the same subject", async () => {
    await client.observation.createMany({
      data: [
        {
          sourceId,
          title: "Le Comú présente son budget 2027",
          url: "https://www.andorralavella.ad/budget-2027",
          publishedAt: hoursAgo(30),
          content: CONTENT,
          processed: true,
          processedAt: hoursAgo(29),
          collectedAt: hoursAgo(30),
        },
        {
          sourceId,
          title: "Le Comú présente son budget 2027 !",
          url: "https://www.andorralavella.ad/budget-2027-bis",
          publishedAt: hoursAgo(2),
          content: CONTENT,
          collectedAt: hoursAgo(1),
        },
      ],
    });

    const plan = await planArticleOrchestration(client, {
      now: NOW,
      runtimeConfig: { ...openConfig, sourceIds: [sourceId] },
    });

    expect(plan.selectedObservationIds).toEqual([]);
    expect(plan.decisions.map((decision) => decision.reasons)).toContainEqual([
      "duplicate_of_processed_observation",
    ]);
  });

  it("reports why a real run would stay blocked by the configuration", async () => {
    const plan = await planArticleOrchestration(client, {
      now: NOW,
      runtimeConfig: { enabled: false, emergencyStop: true, sourceIds: [] },
    });

    expect(plan.executionBlockedReasons).toEqual([
      "emergency_stop",
      "feature_disabled",
      "no_allowlisted_source",
    ]);
  });
});
