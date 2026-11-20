import { describe, expect, it, vi } from "vitest";

import { assertImagePublishable, TEST_ONLY_IMAGE_MESSAGE } from "./sourceImagePolicy";

function client(media: { testOnly: boolean } | null) {
  return { media: { findUnique: vi.fn(async () => media) } };
}

describe("assertImagePublishable", () => {
  it("bloque la publication d’un article dont l’image est réservée aux essais", async () => {
    const db = client({ testOnly: true });

    await expect(assertImagePublishable("/api/media/files/sources/a.jpg", db)).rejects.toThrow(
      TEST_ONLY_IMAGE_MESSAGE,
    );
    expect(db.media.findUnique).toHaveBeenCalledWith({
      where: { path: "/api/media/files/sources/a.jpg" },
      select: { testOnly: true },
    });
  });

  it("laisse publier une image autorisée, de la médiathèque ou générique", async () => {
    await expect(assertImagePublishable("/api/media/files/originals/b.jpg", client({ testOnly: false }))).resolves.toBeUndefined();
    await expect(assertImagePublishable("/images/global/hero.jpg", client(null))).resolves.toBeUndefined();
  });
});
