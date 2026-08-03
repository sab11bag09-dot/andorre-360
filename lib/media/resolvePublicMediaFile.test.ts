import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { resolvePublicMediaFile } from "./resolvePublicMediaFile";

describe("resolvePublicMediaFile", () => {
  const projectRoot = "/srv/andorre-360";

  it("résout un média public dans un dossier autorisé", () => {
    expect(
      resolvePublicMediaFile(
        "originals",
        "article-123.webp",
        projectRoot,
      ),
    ).toEqual({
      filePath: resolve(
        projectRoot,
        "storage",
        "media",
        "originals",
        "article-123.webp",
      ),
      contentType: "image/webp",
    });
  });

  it.each([
    ["..", "../.env"],
    ["originals", "../.env"],
    ["originals", "..\\..\\.env"],
    ["originals", "/etc/passwd"],
    ["originals/..", "secret.jpg"],
  ])(
    "refuse une traversée de chemin (%s, %s)",
    (folder, filename) => {
      expect(
        resolvePublicMediaFile(folder, filename, projectRoot),
      ).toBeNull();
    },
  );

  it("refuse un dossier média inconnu", () => {
    expect(
      resolvePublicMediaFile(
        "private",
        "article.jpg",
        projectRoot,
      ),
    ).toBeNull();
  });

  it("refuse une extension qui ne peut pas être servie", () => {
    expect(
      resolvePublicMediaFile(
        "originals",
        "payload.svg",
        projectRoot,
      ),
    ).toBeNull();
  });
});
