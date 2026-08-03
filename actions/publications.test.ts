import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireAdmin,
  findUnique,
  transaction,
  revalidateEditorialPublicPage,
} = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  findUnique: vi.fn(),
  transaction: vi.fn(),
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
    requireAdmin.mockResolvedValue(undefined);
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

  it("invalide la page éditoriale après un remplacement", async () => {
    findUnique.mockResolvedValue({
      id: 42,
      published: true,
      editorialStatus: "PUBLISHED",
    });
    transaction.mockResolvedValue({
      publication: { id: 7 },
      previousArticleId: 3,
      movedArticles: 1,
      unchanged: false,
    });

    await replacePublication({
      articleId: 42,
      pageKey: "category:POLITIQUE",
      zone: "hero",
    });

    expect(revalidateEditorialPublicPage).toHaveBeenCalledWith(
      "category:POLITIQUE",
    );
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
