import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireAdmin,
  findUnique,
  transaction,
  updateMany,
  editorialEventCreate,
} = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  findUnique: vi.fn(),
  transaction: vi.fn(),
  updateMany: vi.fn(),
  editorialEventCreate: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/admin/requireAdmin", () => ({ requireAdmin }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    article: { findUnique },
    $transaction: transaction,
  },
}));

import {
  approveArticleAction,
  submitArticleForReviewAction,
} from "./workflow-actions";

describe("protection du workflow éditorial", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdmin.mockRejectedValue(new Error("Accès refusé"));
  });

  it.each([
    submitArticleForReviewAction,
    approveArticleAction,
  ])("refuse l’action avant toute lecture ou écriture", async (action) => {
    await expect(action(1)).rejects.toThrow("Accès refusé");
    expect(findUnique).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
  });

  it("enregistre atomiquement une transition autorisée", async () => {
    requireAdmin.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
    });
    findUnique.mockResolvedValue({ editorialStatus: "DRAFT" });
    updateMany.mockResolvedValue({ count: 1 });
    transaction.mockImplementation(
      async (callback: (client: unknown) => unknown) =>
        callback({
          article: { updateMany },
          editorialEvent: { create: editorialEventCreate },
        }),
    );

    await submitArticleForReviewAction(7);

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: 7,
        editorialStatus: "DRAFT",
      },
      data: {
        editorialStatus: "REVIEW",
      },
    });
    expect(editorialEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "ARTICLE_STATUS_CHANGED",
        articleId: 7,
        actorId: "admin-1",
        actorEmail: "admin@example.com",
        fromStatus: "DRAFT",
        toStatus: "REVIEW",
      }),
    });
  });

  it("n’enregistre rien lorsque le statut a changé entre-temps", async () => {
    requireAdmin.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
    });
    findUnique.mockResolvedValue({ editorialStatus: "DRAFT" });
    updateMany.mockResolvedValue({ count: 0 });
    transaction.mockImplementation(
      async (callback: (client: unknown) => unknown) =>
        callback({
          article: { updateMany },
          editorialEvent: { create: editorialEventCreate },
        }),
    );

    await expect(
      submitArticleForReviewAction(7),
    ).rejects.toThrow(
      "Le statut de l’article a changé. Recharge la page et réessaie.",
    );

    expect(editorialEventCreate).not.toHaveBeenCalled();
  });
});
