import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdmin, revalidatePath, redirect, count, createMany, update, findMany } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn(),
  count: vi.fn(),
  createMany: vi.fn(),
  update: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("@/lib/admin/requireAdmin", () => ({ requireAdmin }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    referenceCase: { count, createMany, update },
    observation: { findMany },
  },
}));

import {
  completeReferenceSetAction,
  excludeReferenceCaseAction,
  saveReferenceAnnotationAction,
} from "./reference-set";

function observation(id: number, referenceCase: { excludedAt: Date | null } | null = null) {
  return {
    id,
    sourceId: id,
    title: `Le Comú présente le projet numéro ${id}`,
    content: `Texte ${id} ${"mot ".repeat(300)}`,
    publishedAt: new Date(Date.UTC(2026, 10, id)),
    collectedAt: new Date("2026-11-20T00:00:00Z"),
    referenceCase,
    source: { category: "Société", organizationType: "GOVERNMENT" },
  };
}

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("actions du jeu de référence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdmin.mockResolvedValue({ id: "admin-1", email: "admin@example.com" });
  });

  it("refuse toute action sans droits d’administration", async () => {
    requireAdmin.mockRejectedValue(new Error("Accès administrateur requis."));
    await expect(completeReferenceSetAction()).rejects.toThrow("Accès administrateur requis.");
    await expect(excludeReferenceCaseAction(form({ id: "1" }))).rejects.toThrow();
    expect(createMany).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("complète le jeu sans reproposer une observation écartée", async () => {
    count.mockResolvedValue(1);
    findMany.mockResolvedValue([
      observation(1, { excludedAt: null }),
      observation(2, { excludedAt: new Date() }),
      observation(3),
      observation(4),
    ]);

    await completeReferenceSetAction();

    expect(createMany).toHaveBeenCalledWith({ data: [{ observationId: 4 }, { observationId: 3 }] });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/qualite/reference");
  });

  it("enregistre les cinq questions et la date seulement s’il y a un fait", async () => {
    await saveReferenceAnnotationAction(form({ id: "7", howFacts: " 14 400 euros \n", whoFacts: "Govern | Gouvernement", forbiddenErrors: "", notes: "" }));
    expect(update).toHaveBeenLastCalledWith({
      where: { id: 7, excludedAt: null },
      data: expect.objectContaining({
        whoFacts: "Govern | Gouvernement",
        whereFacts: "",
        howFacts: "14 400 euros",
        annotatedAt: expect.any(Date),
      }),
    });

    await saveReferenceAnnotationAction(form({ id: "7", forbiddenErrors: "x", notes: "" }));
    expect(update).toHaveBeenLastCalledWith(expect.objectContaining({ data: expect.objectContaining({ annotatedAt: null }) }));
    expect(redirect).toHaveBeenCalledWith("/admin/qualite/reference");
  });

  it("écarte une observation sans l’effacer", async () => {
    await excludeReferenceCaseAction(form({ id: "7" }));
    expect(update).toHaveBeenCalledWith({ where: { id: 7 }, data: { excludedAt: expect.any(Date) } });
    await expect(excludeReferenceCaseAction(form({ id: "abc" }))).rejects.toThrow("invalide");
  });
});
