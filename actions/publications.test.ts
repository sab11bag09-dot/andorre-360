import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdmin, findUnique, transaction } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  findUnique: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/admin/requireAdmin", () => ({ requireAdmin }));
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
});
