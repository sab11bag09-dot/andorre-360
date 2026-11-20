import { describe, expect, it, vi } from "vitest";

import {
  importSourceImage,
  isFetchableImageUrl,
  type SourceImageDependencies,
  type SourceImageInput,
} from "./importSourceImage";

const PHOTO_URL = "https://www.govern.ad/media/photo.jpg";

function input(overrides: Partial<SourceImageInput> = {}): SourceImageInput {
  return {
    imageUrl: PHOTO_URL,
    imageRights: "© Govern d’Andorra",
    sourceName: "Govern d’Andorra",
    reuse: "TESTS",
    alt: "Le Govern présente son plan logement",
    ...overrides,
  };
}

function dependencies(overrides: Partial<SourceImageDependencies> = {}) {
  const deps: SourceImageDependencies = {
    findBySourceUrl: vi.fn(async () => null),
    download: vi.fn(async () => ({ buffer: Buffer.alloc(2048), contentType: "image/jpeg" })),
    readDimensions: vi.fn(async () => ({ width: 1200, height: 800 })),
    saveFiles: vi.fn(async () => undefined),
    createMedia: vi.fn(async (data) => ({ id: 7, path: data.path, testOnly: data.testOnly })),
    ...overrides,
  };

  return deps;
}

describe("importSourceImage", () => {
  it("ne reprend rien quand la source n’autorise aucune réutilisation", async () => {
    const deps = dependencies();

    await expect(importSourceImage(input({ reuse: "NONE" }), deps)).resolves.toBeNull();
    expect(deps.download).not.toHaveBeenCalled();
  });

  it("ne reprend rien sans image relevée", async () => {
    const deps = dependencies();

    await expect(importSourceImage(input({ imageUrl: null }), deps)).resolves.toBeNull();
    expect(deps.download).not.toHaveBeenCalled();
  });

  it("range la photo dans la médiathèque avec son crédit, ses droits et sa restriction aux essais", async () => {
    const deps = dependencies();

    const imported = await importSourceImage(input(), deps);

    expect(imported).toEqual({ mediaId: 7, path: expect.stringMatching(/^\/api\/media\/files\/sources\/.+\.jpg$/), testOnly: true });
    expect(deps.saveFiles).toHaveBeenCalledWith(expect.stringMatching(/^source-.+\.jpg$/), expect.any(Buffer));
    expect(deps.createMedia).toHaveBeenCalledWith(
      expect.objectContaining({
        credit: "Govern d’Andorra",
        copyright: "© Govern d’Andorra",
        alt: "Le Govern présente son plan logement",
        sourceUrl: PHOTO_URL,
        testOnly: true,
        mimeType: "image/jpeg",
        width: 1200,
        height: 800,
      }),
    );
  });

  it("ne marque pas « essais » une photo dont la réutilisation est autorisée", async () => {
    const deps = dependencies();

    await importSourceImage(input({ reuse: "ALLOWED" }), deps);

    expect(deps.createMedia).toHaveBeenCalledWith(expect.objectContaining({ testOnly: false }));
  });

  it("réutilise la photo déjà importée depuis la même adresse", async () => {
    const deps = dependencies({
      findBySourceUrl: vi.fn(async () => ({ id: 3, path: "/api/media/files/sources/a.jpg", testOnly: true })),
    });

    await expect(importSourceImage(input(), deps)).resolves.toEqual({
      mediaId: 3,
      path: "/api/media/files/sources/a.jpg",
      testOnly: true,
    });
    expect(deps.download).not.toHaveBeenCalled();
  });

  it.each([
    ["un format qui n’est pas une photo", { download: vi.fn(async () => ({ buffer: Buffer.alloc(10), contentType: "image/svg+xml" })) }],
    ["un fichier trop lourd", { download: vi.fn(async () => ({ buffer: Buffer.alloc(11 * 1024 * 1024), contentType: "image/jpeg" })) }],
    ["une image trop petite pour une carte", { readDimensions: vi.fn(async () => ({ width: 300, height: 200 })) }],
    ["un téléchargement en échec", { download: vi.fn(async () => { throw new Error("403"); }) }],
  ])("revient à l’image générique pour %s", async (_, overrides) => {
    const deps = dependencies(overrides as Partial<SourceImageDependencies>);

    await expect(importSourceImage(input(), deps)).resolves.toBeNull();
    expect(deps.createMedia).not.toHaveBeenCalled();
  });

  it("ne télécharge jamais une adresse qui vise une machine interne", async () => {
    const deps = dependencies();

    await expect(importSourceImage(input({ imageUrl: "http://127.0.0.1:3000/admin.jpg" }), deps)).resolves.toBeNull();
    expect(deps.download).not.toHaveBeenCalled();
  });
});

describe("isFetchableImageUrl", () => {
  it.each([
    "https://www.govern.ad/media/photo.jpg",
    "http://cdn.example.org/a.webp",
  ])("accepte %s", (url) => {
    expect(isFetchableImageUrl(url)).toBe(true);
  });

  it.each([
    "file:///etc/passwd",
    "http://localhost/photo.jpg",
    "http://serveur.local/photo.jpg",
    "http://127.0.0.1/photo.jpg",
    "http://10.0.0.4/photo.jpg",
    "http://172.16.3.2/photo.jpg",
    "http://192.168.1.15/photo.jpg",
    "http://169.254.169.254/latest/meta-data",
    "http://0.0.0.0/photo.jpg",
    "http://[::1]/photo.jpg",
    "http://[fd00::1]/photo.jpg",
    "pas une adresse",
  ])("refuse %s", (url) => {
    expect(isFetchableImageUrl(url)).toBe(false);
  });
});
