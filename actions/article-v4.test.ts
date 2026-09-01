import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireAdmin,
  findUnique,
  translationFindMany,
  transaction,
  articleUpdate,
  mediaUsageDeleteMany,
  mediaFindUnique,
  mediaUsageUpsert,
  publicationFindFirst,
  publicationUpdate,
  publicationUpdateMany,
  publicationCreate,
  editorialEventCreate,
  revalidatePublicArticlePages,
  revalidatePath,
} = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  findUnique: vi.fn(),
  translationFindMany: vi.fn(),
  transaction: vi.fn(),
  articleUpdate: vi.fn(),
  mediaUsageDeleteMany: vi.fn(),
  mediaFindUnique: vi.fn(),
  mediaUsageUpsert: vi.fn(),
  publicationFindFirst: vi.fn(),
  publicationUpdate: vi.fn(),
  publicationUpdateMany: vi.fn(),
  publicationCreate: vi.fn(),
  editorialEventCreate: vi.fn(),
  revalidatePublicArticlePages: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/admin/requireAdmin", () => ({ requireAdmin }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/public-revalidation", () => ({
  revalidatePublicArticlePages,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    article: { findUnique },
    articleTranslation: {
      findMany: translationFindMany,
    },
    $transaction: transaction,
  },
}));
vi.mock("@/components/admin/article-v4/validation", () => ({
  validateArticleDraft: vi.fn(() => ({ success: true, errors: [] })),
  getFirstValidationError: vi.fn(),
}));

import { saveArticle } from "./article-v4";
import {
  EMPTY_ARTICLE_DRAFT,
  type ArticleDraft,
} from "@/components/admin/article-v4/types";

const existingArticle = {
  id: 7,
  slug: "ancien-titre",
  image: "/ancienne-image.jpg",
  category: "ACTUALITÉ",
  editorialStatus: "PUBLISHED",
  publishedAt: new Date("2026-08-02T08:00:00.000Z"),
};

function createDraft(): ArticleDraft {
  return {
    ...EMPTY_ARTICLE_DRAFT,
    id: 7,
    title: "Nouveau titre",
    slug: "nouveau-titre",
    category: "POLITIQUE",
    author: "Rédaction",
    description: "Description",
    content: "Contenu de l’article",
    image: "/image.jpg",
    editorialStatus: "PUBLISHED",
  };
}

describe("durcissement de la sauvegarde principale", () => {
  beforeEach(() => {
    vi.clearAllMocks();
        translationFindMany.mockResolvedValue([
      { locale: "CA", status: "PUBLISHED" },
      { locale: "ES", status: "PUBLISHED" },
    ]);
    findUnique.mockReset();
    requireAdmin.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
    });
    findUnique
      .mockResolvedValueOnce(existingArticle)
      .mockResolvedValueOnce({ id: 7 });
    mediaFindUnique.mockResolvedValue(null);
    publicationFindFirst.mockResolvedValue(null);
    transaction.mockImplementation(
      async (callback: (client: unknown) => unknown) =>
        callback({
          article: { update: articleUpdate },
          mediaUsage: {
            deleteMany: mediaUsageDeleteMany,
            upsert: mediaUsageUpsert,
          },
          media: { findUnique: mediaFindUnique },
          publication: {
            findFirst: publicationFindFirst,
            update: publicationUpdate,
            updateMany: publicationUpdateMany,
            create: publicationCreate,
          },
          editorialEvent: {
            create: editorialEventCreate,
          },
        }),
    );
  });

  it("refuse avant toute lecture ou écriture sans administrateur", async () => {
    requireAdmin.mockRejectedValue(new Error("Accès refusé"));

    await expect(
      saveArticle({
        mode: "update",
        intent: "publish",
        article: createDraft(),
      }),
    ).rejects.toThrow("Accès refusé");

    expect(findUnique).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
    expect(revalidatePublicArticlePages).not.toHaveBeenCalled();
  });
    it("refuse la publication lorsqu’une traduction manque", async () => {
    translationFindMany.mockResolvedValue([
      { locale: "CA", status: "PUBLISHED" },
    ]);

    const result = await saveArticle({
      mode: "update",
      intent: "publish",
      article: createDraft(),
    });

    expect(result).toEqual({
      success: false,
      message:
        "Publie d’abord les traductions suivantes : ES.",
    });

    expect(translationFindMany).toHaveBeenCalledWith({
      where: {
        articleId: 7,
        locale: {
          in: ["CA", "ES"],
        },
      },
      select: {
        locale: true,
        status: true,
      },
    });

    expect(transaction).not.toHaveBeenCalled();
  });

  it.each([
    ["publish" as const, true],
    ["draft" as const, false],
  ])(
    "invalide les pages concernées après l’intention %s",
    async (intent, published) => {
      articleUpdate.mockResolvedValue({
        id: 7,
        slug: "nouveau-titre",
        category: "POLITIQUE",
        title: "Nouveau titre",
        published,
        editorialStatus: published ? "PUBLISHED" : "DRAFT",
      });

      const result = await saveArticle({
        mode: "update",
        intent,
        article: createDraft(),
      });

      expect(result).toEqual(
        expect.objectContaining({ success: true, published }),
      );
      expect(revalidatePublicArticlePages).toHaveBeenCalledWith({
        categories: ["POLITIQUE", "ACTUALITÉ"],
        slugs: ["nouveau-titre", "ancien-titre"],
      });
      expect(editorialEventCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: published
            ? "ARTICLE_UPDATED"
            : "ARTICLE_UNPUBLISHED",
          articleId: 7,
          actorId: "admin-1",
          actorEmail: "admin@example.com",
        }),
      });
    },
  );

  it("distingue une première publication d’une modification publiée", async () => {
    findUnique.mockReset();
    findUnique
      .mockResolvedValueOnce({
        ...existingArticle,
        editorialStatus: "APPROVED",
      })
      .mockResolvedValueOnce({ id: 7 });
    articleUpdate.mockResolvedValue({
      id: 7,
      slug: "nouveau-titre",
      category: "POLITIQUE",
      title: "Nouveau titre",
      published: true,
      editorialStatus: "PUBLISHED",
    });

    await saveArticle({
      mode: "update",
      intent: "publish",
      article: createDraft(),
    });

    expect(editorialEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "ARTICLE_PUBLISHED",
        fromStatus: "APPROVED",
        toStatus: "PUBLISHED",
      }),
    });
  });
});
