import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireAdmin,
  findUnique,
  transaction,
  publicationFindFirst,
  publicationUpdate,
  publicationUpdateMany,
  publicationCreate,
  editorialEventCreate,
  revalidateEditorialPublicPage,
} = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  findUnique: vi.fn(),
  transaction: vi.fn(),
  publicationFindFirst: vi.fn(),
  publicationUpdate: vi.fn(),
  publicationUpdateMany: vi.fn(),
  publicationCreate: vi.fn(),
  editorialEventCreate: vi.fn(),
  revalidateEditorialPublicPage: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/admin/requireAdmin", () => ({ requireAdmin }));
vi.mock("@/lib/public-revalidation", () => ({
  revalidateEditorialPublicPage,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    article: { findUnique },
    $transaction: transaction,
  },
}));

import { replacePublication } from "./publications";

describe("replacePublication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdmin.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
    });
    transaction.mockImplementation(
      async (callback: (client: unknown) => unknown) =>
        callback({
          publication: {
            findFirst: publicationFindFirst,
            update: publicationUpdate,
            updateMany: publicationUpdateMany,
            create: publicationCreate,
          },
          editorialEvent: { create: editorialEventCreate },
        }),
    );
  });

  it.each(["DRAFT", "APPROVED"])(
    "refuse une sélection éditoriale au statut %s",
    async (editorialStatus) => {
      findUnique.mockResolvedValue({
        id: 42,
        published: true,
        editorialStatus,
      });

      await expect(
        replacePublication({
          articleId: 42,
          pageKey: "home",
          zone: "hero",
        }),
      ).resolves.toEqual({
        success: false,
        message: "Cet article n’est pas publié et validé.",
      });

      expect(transaction).not.toHaveBeenCalled();
    },
  );

  it("trace et invalide la page éditoriale après un placement", async () => {
    findUnique.mockResolvedValue({
      id: 42,
      published: true,
      editorialStatus: "PUBLISHED",
    });
    publicationFindFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    publicationCreate.mockResolvedValue({ id: 7 });

    await replacePublication({
      articleId: 42,
      pageKey: "category:POLITIQUE",
      zone: "hero",
    });

    expect(revalidateEditorialPublicPage).toHaveBeenCalledWith(
      "category:POLITIQUE",
    );
    expect(editorialEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "PUBLICATION_PLACED",
        articleId: 42,
        actorId: "admin-1",
        actorEmail: "admin@example.com",
        details: JSON.stringify({
          pageKey: "category:POLITIQUE",
          zone: "hero",
          channel: "site",
          priority: 20,
          previousArticleId: null,
          movedArticles: 0,
        }),
      }),
    });
  });

  it("n’ajoute pas d’événement si l’article occupe déjà la zone", async () => {
    findUnique.mockResolvedValue({
      id: 42,
      published: true,
      editorialStatus: "PUBLISHED",
    });
    publicationFindFirst.mockResolvedValue({
      id: 7,
      articleId: 42,
    });

    await replacePublication({
      articleId: 42,
      pageKey: "home",
      zone: "hero",
    });

    expect(editorialEventCreate).not.toHaveBeenCalled();
  });

  it("refuse sans administrateur avant toute lecture ou transaction", async () => {
    requireAdmin.mockRejectedValue(new Error("Accès refusé"));

    await expect(
      replacePublication({
        articleId: 42,
        pageKey: "home",
        zone: "hero",
      }),
    ).rejects.toThrow("Accès refusé");

    expect(findUnique).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
    expect(revalidateEditorialPublicPage).not.toHaveBeenCalled();
  });
});
