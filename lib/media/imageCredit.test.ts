import { describe, expect, it, vi } from "vitest";

import { imageCreditLabel, loadImageCredit } from "./imageCredit";

describe("loadImageCredit", () => {
  it("renvoie le crédit enregistré dans la médiathèque pour l’image de l’article", async () => {
    const findUnique = vi.fn(async () => ({ credit: "Govern d’Andorra" }));

    await expect(loadImageCredit("/api/media/files/sources/p.jpg", { media: { findUnique } })).resolves.toBe(
      "Govern d’Andorra",
    );
    expect(findUnique).toHaveBeenCalledWith({
      where: { path: "/api/media/files/sources/p.jpg" },
      select: { credit: true },
    });
  });

  it("ne renvoie rien sans image, sans média ou sans crédit", async () => {
    const findUnique = vi.fn(async () => null);

    await expect(loadImageCredit(null, { media: { findUnique } })).resolves.toBeNull();
    expect(findUnique).not.toHaveBeenCalled();
    await expect(loadImageCredit("/images/global/hero.jpg", { media: { findUnique } })).resolves.toBeNull();
    await expect(
      loadImageCredit("/x.jpg", { media: { findUnique: vi.fn(async () => ({ credit: "  " })) } }),
    ).resolves.toBeNull();
  });
});

describe("imageCreditLabel", () => {
  it("traduit la mention de la photo", () => {
    expect(imageCreditLabel("fr")).toBe("Photo");
    expect(imageCreditLabel("ca")).toBe("Foto");
    expect(imageCreditLabel("es")).toBe("Foto");
  });
});
