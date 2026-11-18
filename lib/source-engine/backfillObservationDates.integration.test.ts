import { existsSync, readFileSync, readdirSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { PrismaClient } from "@/lib/generated/prisma/client";

import { backfillObservationDates } from "./backfillObservationDates";
import type { HtmlClient } from "./html/HtmlClient";

const databasePath = join(
  tmpdir(),
  `andorre-360-backfill-dates-${process.pid}-${crypto.randomUUID()}.db`,
);
const client = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: `file:${databasePath}` }),
});

const NOW = new Date("2026-11-18T22:00:00.000Z");

function hoursAgo(hours: number): Date {
  return new Date(NOW.getTime() - hours * 60 * 60 * 1_000);
}

function page(publishedTime: string): string {
  return `<meta property="article:published_time" content="${publishedTime}"><p>Contenu</p>`;
}

class FakeHtmlClient implements HtmlClient {
  readonly requested: string[] = [];

  constructor(private readonly pages: Record<string, string | Error>) {}

  async get(url: string): Promise<string> {
    this.requested.push(url);
    const response = this.pages[url];
    if (response instanceof Error) throw response;
    return response ?? "";
  }
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
  sourceId = (
    await client.source.create({
      data: { name: "Bondia", url: "https://www.bondia.ad/", collectionMode: "HTML" },
    })
  ).id;
});

async function createObservation(data: {
  url: string;
  publishedAt?: Date | null;
  processed?: boolean;
  collectedAt?: Date;
}) {
  return client.observation.create({
    data: {
      sourceId,
      title: "Une information",
      url: data.url,
      publishedAt: data.publishedAt ?? null,
      processed: data.processed ?? false,
      collectedAt: data.collectedAt ?? hoursAgo(2),
      content: "Contenu",
    },
  });
}

describe("backfillObservationDates", () => {
  it("fills a missing date from the article page", async () => {
    const observation = await createObservation({ url: "https://www.bondia.ad/a" });
    const htmlClient = new FakeHtmlClient({
      "https://www.bondia.ad/a": page("2026-11-17T21:27:47+01:00"),
    });

    const result = await backfillObservationDates(client, htmlClient, { now: NOW });

    expect(result).toMatchObject({ examined: 1, dated: 1, stillUndated: 0, failed: 0 });
    expect(
      (await client.observation.findUniqueOrThrow({ where: { id: observation.id } })).publishedAt?.toISOString(),
    ).toBe("2026-11-17T20:27:47.000Z");
  });

  it("falls back to a year/month/day date in the address", async () => {
    const observation = await createObservation({
      url: "https://www.bondia.ad/noticies/2026/11/09/8394/a",
    });

    await backfillObservationDates(client, new FakeHtmlClient({}), { now: NOW });

    expect(
      (await client.observation.findUniqueOrThrow({ where: { id: observation.id } })).publishedAt?.toISOString(),
    ).toBe("2026-11-09T00:00:00.000Z");
  });

  it("never touches an observation that already has a date", async () => {
    const existing = new Date("2026-11-10T08:00:00.000Z");
    const observation = await createObservation({
      url: "https://www.bondia.ad/a",
      publishedAt: existing,
    });
    const htmlClient = new FakeHtmlClient({
      "https://www.bondia.ad/a": page("2026-11-17T21:27:47+01:00"),
    });

    const result = await backfillObservationDates(client, htmlClient, { now: NOW });

    expect(result.examined).toBe(0);
    expect(htmlClient.requested).toEqual([]);
    expect(
      (await client.observation.findUniqueOrThrow({ where: { id: observation.id } })).publishedAt,
    ).toEqual(existing);
  });

  it("leaves processed and old observations alone", async () => {
    await createObservation({ url: "https://www.bondia.ad/traitee", processed: true });
    await createObservation({ url: "https://www.bondia.ad/ancienne", collectedAt: hoursAgo(24 * 8) });
    const htmlClient = new FakeHtmlClient({});

    const result = await backfillObservationDates(client, htmlClient, { now: NOW });

    expect(result.examined).toBe(0);
    expect(htmlClient.requested).toEqual([]);
  });

  it("does not write a future date", async () => {
    const observation = await createObservation({ url: "https://www.bondia.ad/a" });
    const htmlClient = new FakeHtmlClient({
      "https://www.bondia.ad/a": page("2999-01-01T00:00:00Z"),
    });

    const result = await backfillObservationDates(client, htmlClient, { now: NOW });

    expect(result).toMatchObject({ dated: 0, stillUndated: 1 });
    expect(
      (await client.observation.findUniqueOrThrow({ where: { id: observation.id } })).publishedAt,
    ).toBeNull();
  });

  it("counts a page that cannot be fetched and keeps going", async () => {
    await createObservation({ url: "https://www.bondia.ad/erreur" });
    await createObservation({ url: "https://www.bondia.ad/ok" });
    const htmlClient = new FakeHtmlClient({
      "https://www.bondia.ad/erreur": new Error("403"),
      "https://www.bondia.ad/ok": page("2026-11-17T10:00:00Z"),
    });

    const result = await backfillObservationDates(client, htmlClient, { now: NOW });

    expect(result).toMatchObject({ examined: 2, dated: 1, failed: 1 });
  });

  it("writes nothing in dry-run mode", async () => {
    const observation = await createObservation({ url: "https://www.bondia.ad/a" });
    const htmlClient = new FakeHtmlClient({
      "https://www.bondia.ad/a": page("2026-11-17T10:00:00Z"),
    });

    const result = await backfillObservationDates(client, htmlClient, { now: NOW, dryRun: true });

    expect(result).toMatchObject({ examined: 1, dated: 1 });
    expect(
      (await client.observation.findUniqueOrThrow({ where: { id: observation.id } })).publishedAt,
    ).toBeNull();
  });
});
