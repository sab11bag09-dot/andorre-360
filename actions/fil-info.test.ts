import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireAdmin,
  revalidatePath,
  findUnique,
  updateMany,
  update,
  transaction,
  editorialEventCreate,
  revalidateFilInfoPublicPages,
} = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  findUnique: vi.fn(),
  updateMany: vi.fn(),
  update: vi.fn(),
  transaction: vi.fn(),
  editorialEventCreate: vi.fn(),
  revalidateFilInfoPublicPages: vi.fn(),
}));

vi.mock("@/lib/admin/requireAdmin", () => ({ requireAdmin }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/public-revalidation", () => ({
  revalidateFilInfoPublicPages,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { $transaction: transaction },
}));

import { updateFilInfoSettings } from "./fil-info";

const updatedAt = new Date("2026-08-02T06:00:00.000Z");

describe("updateFilInfoSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdmin.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
    });
    findUnique.mockResolvedValue({
      id: 7,
      published: true,
      editorialStatus: "PUBLISHED",
      filInfoVisible: false,
      filInfoPinned: false,
      publishedAt: new Date("2026-08-02T05:00:00.000Z"),
      updatedAt,
    });
    update.mockResolvedValue({
      filInfoVisible: true,
      filInfoPinned: true,
      publishedAt: new Date("2026-08-02T05:30:00.000Z"),
      updatedAt: new Date("2026-08-02T06:01:00.000Z"),
    });
    transaction.mockImplementation(
      async (callback: (client: unknown) => unknown) =>
        callback({
          article: { findUnique, updateMany, update },
          editorialEvent: { create: editorialEventCreate },
        }),
    );
  });

  it("épingle atomiquement sans modifier le statut de publication", async () => {
    const result = await updateFilInfoSettings({
      articleId: 7,
      visible: true,
      pinned: true,
      publishedAt: "2026-08-02T05:30:00.000Z",
      expectedUpdatedAt: updatedAt.toISOString(),
    });

    expect(result.success).toBe(true);
    expect(updateMany).toHaveBeenCalledWith({
      where: { filInfoPinned: true, id: { not: 7 } },
      data: { filInfoPinned: false },
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: {
        filInfoVisible: true,
        filInfoPinned: true,
        publishedAt: new Date("2026-08-02T05:30:00.000Z"),
      },
      select: {
        filInfoVisible: true,
        filInfoPinned: true,
        publishedAt: true,
        updatedAt: true,
      },
    });
    expect(update.mock.calls[0]?.[0].data).not.toHaveProperty("published");
    expect(update.mock.calls[0]?.[0].data).not.toHaveProperty(
      "editorialStatus",
    );
    expect(revalidateFilInfoPublicPages).toHaveBeenCalledOnce();
    expect(editorialEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "FIL_INFO_UPDATED",
        articleId: 7,
        actorId: "admin-1",
        actorEmail: "admin@example.com",
        details: JSON.stringify({
          previousVisible: false,
          visible: true,
          previousPinned: false,
          pinned: true,
          previousPublishedAt: "2026-08-02T05:00:00.000Z",
          publishedAt: "2026-08-02T05:30:00.000Z",
        }),
      }),
    });
  });

  it("refuse d’exposer un article non publié", async () => {
    findUnique.mockResolvedValue({
      id: 7,
      published: false,
      editorialStatus: "APPROVED",
      filInfoVisible: false,
      filInfoPinned: false,
      publishedAt: null,
      updatedAt,
    });

    const result = await updateFilInfoSettings({
      articleId: 7,
      visible: true,
      pinned: false,
      publishedAt: "2026-08-02T05:30:00.000Z",
      expectedUpdatedAt: updatedAt.toISOString(),
    });

    expect(result).toEqual({
      success: false,
      message:
        "Seul un article publié et approuvé peut apparaître dans le Fil info.",
    });
    expect(update).not.toHaveBeenCalled();
    expect(editorialEventCreate).not.toHaveBeenCalled();
  });

  it("refuse une écriture fondée sur une version périmée", async () => {
    const result = await updateFilInfoSettings({
      articleId: 7,
      visible: true,
      pinned: false,
      publishedAt: "2026-08-02T05:30:00.000Z",
      expectedUpdatedAt: "2026-08-02T04:00:00.000Z",
    });

    expect(result).toEqual({
      success: false,
      message:
        "Cet article a été modifié ailleurs. Recharge la page avant de réessayer.",
    });
    expect(update).not.toHaveBeenCalled();
  });

  it("refuse sans administrateur avant toute transaction", async () => {
    requireAdmin.mockRejectedValue(new Error("Accès refusé"));

    await expect(
      updateFilInfoSettings({
        articleId: 7,
        visible: true,
        pinned: false,
        publishedAt: "2026-08-02T05:30:00.000Z",
        expectedUpdatedAt: updatedAt.toISOString(),
      }),
    ).resolves.toEqual({
      success: false,
      message: "La mise à jour du Fil info a échoué.",
    });

    expect(transaction).not.toHaveBeenCalled();
    expect(revalidateFilInfoPublicPages).not.toHaveBeenCalled();
  });
});
