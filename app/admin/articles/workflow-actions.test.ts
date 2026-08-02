import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdmin, findUnique, updateMany } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  findUnique: vi.fn(),
  updateMany: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/admin/requireAdmin", () => ({ requireAdmin }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    article: { findUnique, updateMany },
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
  });
});
