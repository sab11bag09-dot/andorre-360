import { existsSync, readFileSync, readdirSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { PrismaClient } from "@/lib/generated/prisma/client";

import { applyPreparedHomeComposition } from "./applyPreparedHomeComposition";
import type { HomeCompositionResult } from "./homeComposition";
import { loadLockedHomePlacements } from "./loadLockedHomePlacements";

const databasePath = join(
  tmpdir(),
  `andorre-360-apply-home-${process.pid}-${crypto.randomUUID()}.db`,
);

const databaseUrl = `file:${databasePath}`;
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const client = new PrismaClient({ adapter });

const admin = {
  id: "admin-apply-home",
  email: "admin-apply-home@example.com",
};

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

beforeEach(async () => {
  vi.stubEnv("AI_HOME_COMPOSITION_APPLY_ENABLED", "true");
  vi.stubEnv("AI_HOME_COMPOSITION_EMERGENCY_STOP", "false");
  vi.stubEnv("AI_AUTO_PUBLICATION_EMERGENCY_STOP", "false");

  await client.editorialEvent.deleteMany();
  await client.publication.deleteMany();
  await client.homeAutomationRun.deleteMany();
  await client.article.deleteMany();
  await client.user.deleteMany();

  await client.user.create({
    data: {
      id: admin.id,
      firstName: "Admin",
      lastName: "Accueil",
      email: admin.email,
      role: "ADMIN",
    },
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

afterAll(async () => {
  await client.$disconnect();

  for (const suffix of ["", "-journal", "-shm", "-wal"]) {
    const path = `${databasePath}${suffix}`;

    if (existsSync(path)) {
      unlinkSync(path);
    }
  }
});

async function createArticle(
  title: string,
  category = "ACTUALITÉ",
): Promise<number> {
  const article = await client.article.create({
    data: {
      slug: `article-${crypto.randomUUID()}`,
      title,
      category,
      description: "Description",
      content: "Contenu",
      image: "/images/article.jpg",
      author: "ANDORRE 360",
      readingTime: "1 min",
      published: true,
      editorialStatus: "PUBLISHED",
    },
    select: {
      id: true,
    },
  });

  return article.id;
}

describe("application complète d’une composition préparée", () => {
  it("préserve l’humain, remplace l’automatique et trace le run", async () => {
    const humanArticleId = await createArticle("Choix humain");
    const previousAutomaticArticleId = await createArticle(
      "Ancien choix automatique",
    );
    const automaticArticleId = await createArticle(
      "Nouveau choix automatique",
      "POLITIQUE",
    );
    const fallbackArticleId = await createArticle(
      "Choix chronologique",
      "SOCIÉTÉ",
    );

    const humanPublication = await client.publication.create({
      data: {
        articleId: humanArticleId,
        pageKey: "home",
        channel: "site",
        zone: "hero",
        priority: 20,
        active: true,
        origin: "MANUAL",
        locked: true,
      },
    });

    const previousAutomaticPublication = await client.publication.create({
      data: {
        articleId: previousAutomaticArticleId,
        pageKey: "home",
        channel: "site",
        zone: "card",
        priority: 10,
        active: true,
        origin: "AUTOMATED",
        locked: false,
        automationScore: 70,
        automationPolicyVersion: "1.0",
        automationRunId: null,
      },
    });

    const lockedPlacements = await loadLockedHomePlacements({}, client);

    expect(lockedPlacements).toHaveLength(1);
    expect(lockedPlacements[0]).toEqual(
      expect.objectContaining({
        publicationId: humanPublication.id,
        articleId: humanArticleId,
        zone: "hero",
      }),
    );

    const composition: HomeCompositionResult = {
      placements: [
        {
          zone: "hero",
          articleId: humanArticleId,
          sourceId: null,
          category: "ACTUALITÉ",
          score: 0,
          origin: "LOCKED",
        },
        {
          zone: "feature",
          articleId: automaticArticleId,
          sourceId: null,
          category: "POLITIQUE",
          score: 91,
          origin: "AUTOMATED",
        },
        {
          zone: "card",
          articleId: fallbackArticleId,
          sourceId: null,
          category: "SOCIÉTÉ",
          score: 52,
          origin: "FALLBACK",
        },
      ],
      evaluations: [],
      unfilledSlots: {
        hero: 0,
        feature: 0,
        "grand-format": 1,
        card: 3,
        brief: 4,
      },
    };

    const result = await applyPreparedHomeComposition(
      {
        runId: "run-complete-application",
        policyVersion: "1.1",
        actor: admin,
        composition,
        lockedPlacements,
      },
      client,
    );

    expect(result).toEqual({
      createdPublicationIds: [expect.any(Number), expect.any(Number)],
      disabledPublicationIds: [previousAutomaticPublication.id],
      preservedLockedPublicationIds: [humanPublication.id],
      placements: [
        {
          publicationId: expect.any(Number),
          articleId: automaticArticleId,
          zone: "feature",
          score: 91,
          origin: "AUTOMATED",
        },
        {
          publicationId: expect.any(Number),
          articleId: fallbackArticleId,
          zone: "card",
          score: 52,
          origin: "FALLBACK",
        },
      ],
    });

    await expect(
      client.publication.findUnique({
        where: {
          id: humanPublication.id,
        },
        select: {
          active: true,
          origin: true,
          locked: true,
          automationRunId: true,
        },
      }),
    ).resolves.toEqual({
      active: true,
      origin: "MANUAL",
      locked: true,
      automationRunId: null,
    });

    await expect(
      client.publication.findUnique({
        where: {
          id: previousAutomaticPublication.id,
        },
        select: {
          active: true,
          endsAt: true,
        },
      }),
    ).resolves.toEqual({
      active: false,
      endsAt: expect.any(Date),
    });

    const createdPublications = await client.publication.findMany({
      where: {
        automationRunId: "run-complete-application",
      },
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        articleId: true,
        zone: true,
        active: true,
        origin: true,
        locked: true,
        automationScore: true,
        automationPolicyVersion: true,
        automationRunId: true,
      },
    });

    expect(createdPublications).toEqual([
      {
        id: result.createdPublicationIds[0],
        articleId: automaticArticleId,
        zone: "feature",
        active: true,
        origin: "AUTOMATED",
        locked: false,
        automationScore: 91,
        automationPolicyVersion: "1.1",
        automationRunId: "run-complete-application",
      },
      {
        id: result.createdPublicationIds[1],
        articleId: fallbackArticleId,
        zone: "card",
        active: true,
        origin: "FALLBACK",
        locked: false,
        automationScore: 52,
        automationPolicyVersion: "1.1",
        automationRunId: "run-complete-application",
      },
    ]);

    const run = await client.homeAutomationRun.findUniqueOrThrow({
      where: {
        id: "run-complete-application",
      },
    });

    expect(run).toEqual(
      expect.objectContaining({
        id: "run-complete-application",
        policyVersion: "1.1",
        status: "APPLIED",
        actorId: admin.id,
        actorEmail: admin.email,
        appliedAt: expect.any(Date),
        result: expect.any(String),
      }),
    );

    expect(JSON.parse(run.snapshot)).toEqual({
      publications: [
        expect.objectContaining({
          publicationId: previousAutomaticPublication.id,
          articleId: previousAutomaticArticleId,
          pageKey: "home",
          channel: "site",
          zone: "card",
          priority: 10,
          active: true,
          origin: "AUTOMATED",
          locked: false,
          automationScore: 70,
          automationPolicyVersion: "1.0",
          automationRunId: null,
          updatedAt: expect.any(String),
        }),
      ],
    });

    expect(JSON.parse(run.result!)).toEqual(result);

    const event = await client.editorialEvent.findFirstOrThrow({
      where: {
        action: "HOME_COMPOSITION_APPLIED",
      },
    });

    expect(event).toEqual(
      expect.objectContaining({
        articleId: null,
        actorId: admin.id,
        actorEmail: admin.email,
        details: expect.any(String),
      }),
    );

    expect(JSON.parse(event.details!)).toEqual({
      runId: "run-complete-application",
      policyVersion: "1.1",
      appliedAt: run.appliedAt!.toISOString(),
      ...result,
    });
  });
});
