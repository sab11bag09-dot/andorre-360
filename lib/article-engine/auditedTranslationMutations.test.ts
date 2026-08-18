import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  transaction,
  translationFindUnique,
  translationUpdateMany,
  editorialEventCreate,
} = vi.hoisted(() => ({
  transaction: vi.fn(),
  translationFindUnique: vi.fn(),
  translationUpdateMany: vi.fn(),
  editorialEventCreate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { $transaction: transaction },
}));

import {
  publishAuditedArticleTranslation,
  transitionAuditedArticleTranslation,
  updateAuditedArticleTranslation,
} from "./auditedTranslationMutations";

const actor = {
  id: "admin-1",
  email: "admin@example.com",
};

describe("mutations de traduction auditées", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    transaction.mockImplementation(
      async (callback: (client: unknown) => unknown) =>
        callback({
          articleTranslation: {
            findUnique: translationFindUnique,
            updateMany: translationUpdateMany,
          },
          editorialEvent: {
            create: editorialEventCreate,
          },
        }),
    );

    translationUpdateMany.mockResolvedValue({ count: 1 });
    editorialEventCreate.mockResolvedValue({ id: 99 });
  });

  it("trace les corrections avec l’acteur et le statut antérieur", async () => {
    translationFindUnique.mockResolvedValue({
      id: 12,
      status: "AI_DRAFT",
      publishedAt: null,
    });

    await expect(
      updateAuditedArticleTranslation(
        {
          articleId: 7,
          locale: "CA",
          title: "Títol",
          description: "Descripció",
          content: "Contingut",
        },
        actor,
      ),
    ).resolves.toEqual({
      translationId: 12,
      status: "DRAFT",
    });

    expect(editorialEventCreate).toHaveBeenCalledWith({
      data: {
        action: "TRANSLATION_UPDATED",
        articleId: 7,
        translationId: 12,
        actorId: "admin-1",
        actorEmail: "admin@example.com",
        fromStatus: "AI_DRAFT",
        toStatus: "DRAFT",
        details: JSON.stringify({
          locale: "CA",
          operation: "content",
        }),
      },
    });
  });

  it("trace une transition de validation", async () => {
    translationFindUnique.mockResolvedValue({
      id: 12,
      status: "REVIEW",
      publishedAt: null,
    });

    await transitionAuditedArticleTranslation(
      {
        articleId: 7,
        locale: "ES",
        nextStatus: "APPROVED",
      },
      actor,
    );

    expect(editorialEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "TRANSLATION_STATUS_CHANGED",
        fromStatus: "REVIEW",
        toStatus: "APPROVED",
        details: JSON.stringify({
          locale: "ES",
          operation: "status",
        }),
      }),
    });
  });

  it("distingue l’archivage de la publication", async () => {
    translationFindUnique.mockResolvedValue({
      id: 12,
      status: "PUBLISHED",
      publishedAt: new Date("2026-08-03T12:00:00.000Z"),
    });

    await transitionAuditedArticleTranslation(
      {
        articleId: 7,
        locale: "CA",
        nextStatus: "ARCHIVED",
      },
      actor,
    );

    expect(editorialEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "TRANSLATION_ARCHIVED",
        fromStatus: "PUBLISHED",
        toStatus: "ARCHIVED",
      }),
    });

    vi.clearAllMocks();

    translationFindUnique.mockResolvedValue({
      id: 12,
      status: "APPROVED",
      publishedAt: null,
      article: {
        aiRewrittenAt: new Date("2026-08-18T02:33:55.003Z"),
      },
    });

    translationUpdateMany.mockResolvedValue({ count: 1 });

    await publishAuditedArticleTranslation(
      { articleId: 7, locale: "CA" },
      actor,
    );

    expect(editorialEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "TRANSLATION_PUBLISHED",
        fromStatus: "APPROVED",
        toStatus: "PUBLISHED",
      }),
    });
  });

  it("n’écrit aucun événement si la mutation optimiste échoue", async () => {
    translationFindUnique.mockResolvedValue({
      id: 12,
      status: "REVIEW",
      publishedAt: null,
    });

    translationUpdateMany.mockResolvedValue({ count: 0 });

    await expect(
      transitionAuditedArticleTranslation(
        {
          articleId: 7,
          locale: "CA",
          nextStatus: "APPROVED",
        },
        actor,
      ),
    ).rejects.toThrow("Le statut de la traduction a changé");

    expect(editorialEventCreate).not.toHaveBeenCalled();
  });

  it("refuse une langue invalide avant toute transaction", async () => {
    await expect(
      updateAuditedArticleTranslation(
        {
          articleId: 7,
          locale: "FR",
          title: "Titre",
          description: "Description",
          content: "Contenu",
        },
        actor,
      ),
    ).rejects.toThrow("Langue de traduction invalide.");

    expect(transaction).not.toHaveBeenCalled();
  });
});
