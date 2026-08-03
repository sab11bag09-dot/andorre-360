import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  transaction,
  transactionFindUnique,
  transactionCreate,
  transactionUpdateMany,
  editorialEventCreate,
} = vi.hoisted(() => ({
  transaction: vi.fn(),
  transactionFindUnique: vi.fn(),
  transactionCreate: vi.fn(),
  transactionUpdateMany: vi.fn(),
  editorialEventCreate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { $transaction: transaction },
}));

import { generateAuditedArticleTranslations } from "./auditedTranslationGeneration";
import type { GenerateArticleTranslationsDependencies } from "./generateArticleTranslations";

const actor = {
  id: "admin-1",
  email: "admin@example.com",
};

function makeDependencies() {
  const findById = vi.fn().mockResolvedValue({
    id: 7,
    title: "Titre français",
    description: "Chapô français",
    content: "Contenu français",
  });
  const findByArticleAndLocale = vi.fn().mockResolvedValue(null);
  const translateArticle = vi.fn(
    async (input: {
      locale: "CA" | "ES";
      title: string;
      description: string;
      content: string;
    }) => ({
      locale: input.locale,
      title: `[${input.locale}] ${input.title}`,
      description: `[${input.locale}] ${input.description}`,
      content: `[${input.locale}] ${input.content}`,
    }),
  );

  const dependencies: GenerateArticleTranslationsDependencies = {
    articleRepository: { findById },
    translationRepository: {
      findByArticleAndLocale,
      createDraft: vi.fn(),
      updateDraft: vi.fn(),
    },
    editorialGenerator: { translateArticle },
  };

  return { dependencies, translateArticle };
}

describe("génération de traductions auditée", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(
      async (callback: (client: unknown) => unknown) =>
        callback({
          articleTranslation: {
            findUnique: transactionFindUnique,
            create: transactionCreate,
            updateMany: transactionUpdateMany,
          },
          editorialEvent: { create: editorialEventCreate },
        }),
    );
    transactionFindUnique.mockResolvedValue(null);
    transactionCreate.mockImplementation(
      async ({ data }: { data: { locale: "CA" | "ES" } }) => ({
        id: data.locale === "CA" ? 101 : 102,
      }),
    );
    transactionUpdateMany.mockResolvedValue({ count: 1 });
    editorialEventCreate.mockResolvedValue({ id: 1 });
  });

  it("prépare les textes avant la transaction puis trace chaque création", async () => {
    const { dependencies, translateArticle } = makeDependencies();

    await expect(
      generateAuditedArticleTranslations(7, actor, dependencies),
    ).resolves.toEqual({
      articleId: 7,
      translations: [
        { locale: "CA", translationId: 101, action: "created" },
        { locale: "ES", translationId: 102, action: "created" },
      ],
    });

    expect(translateArticle).toHaveBeenCalledTimes(2);
    expect(
      translateArticle.mock.invocationCallOrder.at(-1),
    ).toBeLessThan(transaction.mock.invocationCallOrder[0]);
    expect(editorialEventCreate).toHaveBeenCalledTimes(2);
    expect(editorialEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "TRANSLATION_GENERATED",
        articleId: 7,
        translationId: 101,
        actorId: "admin-1",
        actorEmail: "admin@example.com",
        fromStatus: undefined,
        toStatus: "AI_DRAFT",
        details: JSON.stringify({
          locale: "CA",
          operation: "created",
        }),
      }),
    });
  });

  it("n’ouvre aucune transaction si le générateur échoue", async () => {
    const { dependencies, translateArticle } = makeDependencies();
    translateArticle.mockRejectedValueOnce(
      new Error("Générateur indisponible"),
    );

    await expect(
      generateAuditedArticleTranslations(7, actor, dependencies),
    ).rejects.toThrow("Générateur indisponible");

    expect(transaction).not.toHaveBeenCalled();
    expect(editorialEventCreate).not.toHaveBeenCalled();
  });

  it("préserve une traduction verrouillée avant la persistance", async () => {
    const { dependencies } = makeDependencies();
    transactionFindUnique.mockImplementation(
      async ({ where }: { where: Record<string, unknown> }) => {
        if ("articleId_locale" in where) {
          const reference = where.articleId_locale as {
            locale: "CA" | "ES";
          };

          return {
            id: reference.locale === "CA" ? 21 : 22,
            status: "REVIEW",
            publishedAt: null,
          };
        }

        return null;
      },
    );

    const result = await generateAuditedArticleTranslations(
      7,
      actor,
      dependencies,
    );

    expect(result.translations).toEqual([
      { locale: "CA", translationId: 21, action: "skipped" },
      { locale: "ES", translationId: 22, action: "skipped" },
    ]);
    expect(transactionCreate).not.toHaveBeenCalled();
    expect(transactionUpdateMany).not.toHaveBeenCalled();
    expect(editorialEventCreate).not.toHaveBeenCalled();
  });
});
