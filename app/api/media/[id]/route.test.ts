import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminApi, findUnique, update } = vi.hoisted(() => ({
  requireAdminApi: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/lib/admin/requireAdmin", () => ({ requireAdminApi }));
vi.mock("@/lib/prisma", () => ({
  prisma: { media: { findUnique, update } },
}));

import { PATCH } from "./route";

function patch(body: Record<string, unknown>) {
  return PATCH(
    new Request("http://localhost/api/media/5", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as never,
    { params: Promise.resolve({ id: "5" }) },
  );
}

describe("PATCH /api/media/[id] — banque d’images", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminApi.mockResolvedValue(null);
    findUnique.mockResolvedValue({ id: 5, type: "IMAGE", testOnly: false });
    update.mockImplementation(async ({ data }) => ({ id: 5, ...data }));
  });

  it("range une image dans la banque d’une rubrique", async () => {
    const response = await patch({ bankCategory: "SPORTS" });

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ bankCategory: "SPORTS" }) }),
    );
  });

  it("refuse une rubrique inconnue", async () => {
    const response = await patch({ bankCategory: "PEOPLE" });

    expect(response.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it("refuse dans la banque une photo de source réservée aux essais", async () => {
    findUnique.mockResolvedValue({ id: 5, type: "IMAGE", testOnly: true });

    const response = await patch({ bankCategory: "SPORTS" });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Une photo reprise d’une source pour les essais ne peut pas entrer dans la banque d’images.",
    });
    expect(update).not.toHaveBeenCalled();
  });

  it("refuse une vidéo dans la banque d’images", async () => {
    findUnique.mockResolvedValue({ id: 5, type: "VIDEO", testOnly: false });

    const response = await patch({ bankCategory: "SPORTS" });

    expect(response.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it("ne touche pas la banque quand le champ n’est pas envoyé", async () => {
    await patch({ title: "Titre" });

    expect(update.mock.calls[0][0].data).not.toHaveProperty("bankCategory");
  });
});
