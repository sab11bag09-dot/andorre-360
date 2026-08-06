import {
  existsSync,
  readFileSync,
  readdirSync,
  unlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const databasePath = join(
  tmpdir(),
  `andorre-360-multilingual-${process.pid}-${crypto.randomUUID()}.db`,
);

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { PrismaClient } from "@/lib/generated/prisma/client";

import { generateArticleTranslations } from "./generateArticleTranslations";
import type {
  PreparedTranslation,
  TranslateArticleInput,
} from "./generators/EditorialGenerator";
import {
  publishArticleTranslation,
  transitionArticleTranslation,
} from "./manageArticleTranslation";
import { PrismaArticleRepository } from "./repositories/PrismaArticleRepository";
import { PrismaArticleTranslationRepository } from "./repositories/PrismaArticleTranslationRepository";
import { PrismaPublicArticleTranslationRepository } from "./repositories/PrismaPublicArticleTranslationRepository";

const databaseUrl = `file:${databasePath}`;
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const client = new PrismaClient({ adapter });
const articleRepository = new PrismaArticleRepository(client);
const translationRepository = new PrismaArticleTranslationRepository(client);
const publicRepository = new PrismaPublicArticleTranslationRepository(client);

const translateArticle = vi.fn(
  async (input: TranslateArticleInput): Promise<PreparedTranslation> => ({
    locale: input.locale,
    title: `[${input.locale}] ${input.title}`,
    description: `[${input.locale}] ${input.description}`,
    content: `[${input.locale}] ${input.content}`,
  }),
);

const generationDependencies = {
  articleRepository,
  translationRepository,
  editorialGenerator: { translateArticle },
};

const managementDependencies = {
  translationRepository,
  now: () => new Date("2026-08-01T12:00:00.000Z"),
};

async function createArticle(title = "Article français"): Promise<number> {
  const article = await client.article.create({
    data: {
      slug: crypto.randomUUID(),
      title,
      category: "Actualité",
      description: "Chapô français",
      content: "Contenu français",
      image: "",
      author: "ANDORRE 360",
      readingTime: "1 min",
      published: true,
      editorialStatus: "PUBLISHED",
    },
    select: { id: true },
  });

  return article.id;
}

async function createTranslation(
  articleId: number,
  locale: "CA" | "ES",
  status:
    | "DRAFT"
    | "AI_DRAFT"
    | "REVIEW"
    | "APPROVED"
    | "PUBLISHED"
    | "ARCHIVED" = "AI_DRAFT",
  slug = `${locale.toLowerCase()}-${crypto.randomUUID()}`,
) {
  return client.articleTranslation.create({
    data: {
      articleId,
      locale,
      title: `Titre ${locale}`,
      slug,
      description: `Description ${locale}`,
      content: `Contenu ${locale}`,
      status,
      generatedAt: new Date("2026-08-01T10:00:00.000Z"),
      approvedAt:
        status === "APPROVED" || status === "PUBLISHED"
          ? new Date("2026-08-01T11:00:00.000Z")
          : null,
      publishedAt:
        status === "PUBLISHED" || status === "ARCHIVED"
          ? new Date("2026-08-01T12:00:00.000Z")
          : null,
    },
  });
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

beforeEach(async () => {
  translateArticle.mockClear();
  await client.article.deleteMany();
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

describe("pipeline multilingue avec SQLite isolé", () => {
  it("garantit l’unicité de articleId et locale", async () => {
    const articleId = await createArticle();
    await createTranslation(articleId, "CA", "AI_DRAFT", "slug-ca-1");

    await expect(
      createTranslation(articleId, "CA", "AI_DRAFT", "slug-ca-2"),
    ).rejects.toMatchObject({ code: "P2002" });
  });

  it("garantit l’unicité du slug par langue", async () => {
    const firstArticleId = await createArticle("Premier article");
    const secondArticleId = await createArticle("Deuxième article");

    await createTranslation(firstArticleId, "CA", "AI_DRAFT", "mateix-slug");

    await expect(
      createTranslation(secondArticleId, "CA", "AI_DRAFT", "mateix-slug"),
    ).rejects.toMatchObject({ code: "P2002" });

    await expect(
      createTranslation(secondArticleId, "ES", "AI_DRAFT", "mateix-slug"),
    ).resolves.toMatchObject({ locale: "ES" });
  });

  it("supprime les traductions en cascade avec l’article", async () => {
    const articleId = await createArticle();
    await createTranslation(articleId, "CA");
    await createTranslation(articleId, "ES");

    await client.article.delete({ where: { id: articleId } });

    await expect(
      client.articleTranslation.count({ where: { articleId } }),
    ).resolves.toBe(0);
  });

  it("crée FR et CA puis les régénère sans doublon", async () => {
    const articleId = await createArticle();

    await generateArticleTranslations(articleId, generationDependencies);
    await generateArticleTranslations(articleId, generationDependencies);

    const translations = await client.articleTranslation.findMany({
      where: { articleId },
      orderBy: { locale: "asc" },
    });

    expect(translations).toHaveLength(2);
    expect(translations.map(({ locale }) => locale).sort()).toEqual(["CA", "FR"]);
    expect(translations.every(({ status }) => status === "AI_DRAFT")).toBe(true);
  });

  it("résiste à deux générations simultanées sans créer de doublon", async () => {
    const articleId = await createArticle();

    const results = await Promise.allSettled([
      generateArticleTranslations(articleId, generationDependencies),
      generateArticleTranslations(articleId, generationDependencies),
    ]);

    expect(results.every(({ status }) => status === "fulfilled")).toBe(true);
    await expect(
      client.articleTranslation.count({ where: { articleId } }),
    ).resolves.toBe(2);
  });

  it("détecte une modification concurrente du statut", async () => {
    const articleId = await createArticle();
    await createTranslation(articleId, "CA");

    const results = await Promise.allSettled([
      transitionArticleTranslation(
        { articleId, locale: "CA", nextStatus: "REVIEW" },
        managementDependencies,
      ),
      transitionArticleTranslation(
        { articleId, locale: "CA", nextStatus: "REVIEW" },
        managementDependencies,
      ),
    ]);

    expect(results.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
    expect(results.filter(({ status }) => status === "rejected")).toHaveLength(1);
  });

  it.each(["REVIEW", "APPROVED", "PUBLISHED"] as const)(
    "protège une traduction %s contre la régénération",
    async (status) => {
      const articleId = await createArticle();
      const translation = await createTranslation(articleId, "CA", status);

      await generateArticleTranslations(articleId, generationDependencies);

      const persisted = await client.articleTranslation.findUniqueOrThrow({
        where: { id: translation.id },
      });

      expect(persisted.status).toBe(status);
      expect(persisted.content).toBe("Contenu CA");
      expect(translateArticle).toHaveBeenCalledTimes(1);
      expect(translateArticle).toHaveBeenCalledWith(
        expect.objectContaining({ locale: "FR" }),
      );
    },
  );

  it("limite la publication au statut APPROVED", async () => {
    const articleId = await createArticle();
    const translation = await createTranslation(articleId, "CA");

    await expect(
      publishArticleTranslation(
        { articleId, locale: "CA" },
        managementDependencies,
      ),
    ).rejects.toThrow("doit être approuvée");

    await client.articleTranslation.update({
      where: { id: translation.id },
      data: { status: "APPROVED" },
    });

    await expect(
      publishArticleTranslation(
        { articleId, locale: "CA" },
        managementDependencies,
      ),
    ).resolves.toMatchObject({ status: "PUBLISHED" });
  });

  it.each(["DRAFT", "AI_DRAFT", "REVIEW", "APPROVED", "ARCHIVED"] as const)(
    "rend une traduction %s invisible publiquement",
    async (status) => {
      const articleId = await createArticle();
      const slug = `invisible-${status.toLowerCase()}`;
      await createTranslation(articleId, "CA", status, slug);

      await expect(
        publicRepository.findPublishedByLocaleAndSlug("CA", slug),
      ).resolves.toBeNull();
    },
  );

  it("rend une traduction publiée visible publiquement", async () => {
    const articleId = await createArticle();
    const slug = "visible-published";
    await createTranslation(articleId, "CA", "PUBLISHED", slug);

    await expect(
      publicRepository.findPublishedByLocaleAndSlug("CA", slug),
    ).resolves.toMatchObject({ articleId, locale: "CA", slug });
  });
});
