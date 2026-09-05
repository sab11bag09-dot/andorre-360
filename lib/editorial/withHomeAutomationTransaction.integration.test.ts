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

import { withHomeAutomationTransaction } from "./withHomeAutomationTransaction";

const databasePath = join(
  tmpdir(),
  `andorre-360-home-automation-${process.pid}-${crypto.randomUUID()}.db`,
);

const databaseUrl = `file:${databasePath}`;
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const client = new PrismaClient({ adapter });

const admin = {
  id: "admin-home-automation",
  email: "admin-home-automation@example.com",
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

async function createArticle(): Promise<number> {
  const article = await client.article.create({
    data: {
      slug: `article-${crypto.randomUUID()}`,
      title: "Article automatique",
      category: "ACTUALITÉ",
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

function makeInput(runId: string) {
  return {
    runId,
    policyVersion: "1.1",
    snapshot: JSON.stringify({ publications: [] }),
    actor: admin,
    simulatedLockedPlacements: [],
  };
}

describe("transaction réelle d’automatisation avec SQLite isolé", () => {
  it("annule le run et les publications si le travail échoue", async () => {
    const articleId = await createArticle();
    const error = new Error("Échec volontaire pendant l’application.");

    await expect(
      withHomeAutomationTransaction(
        makeInput("run-rollback"),
        async (transaction) => {
          await transaction.publication.create({
            data: {
              articleId,
              pageKey: "home",
              channel: "site",
              zone: "hero",
              priority: 20,
              active: true,
              origin: "AUTOMATED",
              locked: false,
              automationScore: 90,
              automationPolicyVersion: "1.1",
              automationRunId: "run-rollback",
            },
          });

          throw error;
        },
        client,
      ),
    ).rejects.toBe(error);

    await expect(
      client.homeAutomationRun.count({
        where: {
          id: "run-rollback",
        },
      }),
    ).resolves.toBe(0);

    await expect(
      client.publication.count({
        where: {
          automationRunId: "run-rollback",
        },
      }),
    ).resolves.toBe(0);
  });

  it("valide ensemble le run et les publications en cas de succès", async () => {
    const articleId = await createArticle();

    await expect(
      withHomeAutomationTransaction(
        makeInput("run-success"),
        async (transaction) => {
          const publication = await transaction.publication.create({
            data: {
              articleId,
              pageKey: "home",
              channel: "site",
              zone: "hero",
              priority: 20,
              active: true,
              origin: "AUTOMATED",
              locked: false,
              automationScore: 90,
              automationPolicyVersion: "1.1",
              automationRunId: "run-success",
            },
            select: {
              id: true,
            },
          });

          return {
            createdPublicationIds: [publication.id],
          };
        },
        client,
      ),
    ).resolves.toEqual({
      createdPublicationIds: [expect.any(Number)],
    });

    await expect(
      client.homeAutomationRun.findUnique({
        where: {
          id: "run-success",
        },
        select: {
          status: true,
          appliedAt: true,
        },
      }),
    ).resolves.toEqual({
      status: "APPLIED",
      appliedAt: expect.any(Date),
    });

    await expect(
      client.publication.count({
        where: {
          automationRunId: "run-success",
          active: true,
        },
      }),
    ).resolves.toBe(1);
  });

  it("empêche une deuxième application du même run", async () => {
    const articleId = await createArticle();

    await withHomeAutomationTransaction(
      makeInput("run-unique"),
      async (transaction) => {
        await transaction.publication.create({
          data: {
            articleId,
            pageKey: "home",
            channel: "site",
            zone: "hero",
            priority: 20,
            active: true,
            origin: "AUTOMATED",
            locked: false,
            automationScore: 90,
            automationPolicyVersion: "1.1",
            automationRunId: "run-unique",
          },
        });

        return {
          createdPublicationIds: [],
        };
      },
      client,
    );

    await expect(
      withHomeAutomationTransaction(
        makeInput("run-unique"),
        async () => ({
          createdPublicationIds: [],
        }),
        client,
      ),
    ).rejects.toThrow("Le run run-unique existe déjà");

    await expect(
      client.homeAutomationRun.count({
        where: {
          id: "run-unique",
        },
      }),
    ).resolves.toBe(1);
  });
});
