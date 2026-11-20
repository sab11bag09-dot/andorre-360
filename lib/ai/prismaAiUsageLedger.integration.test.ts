import { existsSync, readFileSync, readdirSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { PrismaClient } from "@/lib/generated/prisma/client";

import { createPrismaAiUsageLedger } from "./prismaAiUsageLedger";

const databasePath = join(
  tmpdir(),
  `andorre-360-ai-usage-${process.pid}-${crypto.randomUUID()}.db`,
);
const client = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: `file:${databasePath}` }),
});

beforeAll(() => {
  const database = new Database(databasePath);
  const migrationsPath = join(process.cwd(), "prisma", "migrations");

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

beforeEach(async () => {
  await client.aiUsage.deleteMany();
});

describe("createPrismaAiUsageLedger", () => {
  it("enregistre chaque appel et additionne les jetons depuis une date", async () => {
    const ledger = createPrismaAiUsageLedger(client);

    await client.aiUsage.create({
      data: {
        provider: "openai",
        model: "test-model",
        operation: "article_fact_sheet",
        inputTokens: 900,
        outputTokens: 100,
        totalTokens: 1_000,
        createdAt: new Date("2026-11-18T12:00:00.000Z"),
      },
    });
    await ledger.record({
      provider: "openai",
      model: "test-model",
      operation: "article_from_facts",
      inputTokens: 1_500,
      outputTokens: 500,
    });

    expect(await ledger.tokensUsedSince(new Date("2026-11-19T00:00:00.000Z"))).toBe(2_000);
    expect(await ledger.tokensUsedSince(new Date("2026-11-01T00:00:00.000Z"))).toBe(3_000);
    expect(await client.aiUsage.findFirstOrThrow({ where: { operation: "article_from_facts" } })).toMatchObject({
      totalTokens: 2_000,
    });
  });

  it("compte zéro jeton quand rien n’a été consommé", async () => {
    expect(await createPrismaAiUsageLedger(client).tokensUsedSince(new Date(0))).toBe(0);
  });
});
