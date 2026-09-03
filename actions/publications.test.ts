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

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/admin/requireAdmin", () => ({
  requireAdmin,
}));

vi.mock("@/lib/public-revalidation", () => ({
  revalidateEditorialPublicPage,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    article: {
      findUnique,
    },
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
          editorialEvent: {
            create: editorialEventCreate,
          },
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

    publicationCreate.mockResolvedValue({
      id: 7,
    });

    await replacePublication({
      articleId: 42,
      pageKey: "category:POLITIQUE",
      zone: "hero",
    });

    expect(publicationCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        articleId: 42,
        pageKey: "category:POLITIQUE",
        channel: "site",
        zone: "hero",
        priority: 20,
        active: true,
        origin: "MANUAL",
        locked: true,
        automationScore: null,
        automationPolicyVersion: null,
        automationRunId: null,
      }),
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
      origin: "MANUAL",
      locked: true,
      automationScore: null,
      automationPolicyVersion: null,
      automationRunId: null,
    });

    await replacePublication({
      articleId: 42,
      pageKey: "home",
      zone: "hero",
    });

    expect(publicationUpdate).not.toHaveBeenCalled();
    expect(editorialEventCreate).not.toHaveBeenCalled();
  });

  it("verrouille comme sélection humaine un article déjà placé automatiquement", async () => {
    findUnique.mockResolvedValue({
      id: 42,
      published: true,
      editorialStatus: "PUBLISHED",
    });

    publicationFindFirst.mockResolvedValue({
      id: 7,
      articleId: 42,
      origin: "AUTOMATED",
      locked: false,
      automationScore: 91,
      automationPolicyVersion: "1.1",
      automationRunId: "run-123",
    });

    publicationUpdate.mockResolvedValue({
      id: 7,
      articleId: 42,
    });

    await expect(
      replacePublication({
        articleId: 42,
        pageKey: "home",
        zone: "hero",
      }),
    ).resolves.toEqual({
      success: true,
      message: "Sélection humaine verrouillée.",
      publicationId: 7,
      movedArticles: 0,
    });

    expect(publicationUpdate).toHaveBeenCalledWith({
      where: {
        id: 7,
      },
      data: {
        origin: "MANUAL",
        locked: true,
        automationScore: null,
        automationPolicyVersion: null,
        automationRunId: null,
      },
    });

    expect(editorialEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "PUBLICATION_PLACED",
        articleId: 42,
        details: JSON.stringify({
          pageKey: "home",
          zone: "hero",
          channel: "site",
          priority: 20,
          previousArticleId: null,
          movedArticles: 0,
          manualLockApplied: true,
        }),
      }),
    });
  });

  it("réinitialise la provenance lors de la réactivation manuelle", async () => {
    findUnique.mockResolvedValue({
      id: 42,
      published: true,
      editorialStatus: "PUBLISHED",
    });

    publicationFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 9,
      articleId: 42,
      origin: "AUTOMATED",
      locked: false,
      automationScore: 91,
      automationPolicyVersion: "1.1",
      automationRunId: "run-123",
    });

    publicationUpdate.mockResolvedValue({
      id: 9,
      articleId: 42,
    });

    await replacePublication({
      articleId: 42,
      pageKey: "home",
      zone: "hero",
    });

    expect(publicationUpdate).toHaveBeenCalledWith({
      where: {
        id: 9,
      },
      data: expect.objectContaining({
        active: true,
        priority: 20,
        endsAt: null,
        zone: "hero",
        origin: "MANUAL",
        locked: true,
        automationScore: null,
        automationPolicyVersion: null,
        automationRunId: null,
      }),
    });
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
