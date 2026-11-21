import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminApi, readFile } = vi.hoisted(() => ({
  requireAdminApi: vi.fn(),
  readFile: vi.fn(),
}));

vi.mock("@/lib/admin/requireAdmin", () => ({ requireAdminApi }));
vi.mock("node:fs/promises", () => ({ readFile }));

import { GET } from "./route";

function get(folder: string, filename: string) {
  return GET(new Request(`http://localhost/api/media/files/${folder}/${filename}`), {
    params: Promise.resolve({ folder, filename }),
  });
}

describe("GET /api/media/files/[folder]/[filename]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readFile.mockResolvedValue(Buffer.from("image"));
  });

  it("sert publiquement une image de la rédaction, avec un cache long", async () => {
    const response = await get("originals", "photo.jpg");

    expect(response.status).toBe(200);
    expect(requireAdminApi).not.toHaveBeenCalled();
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable");
  });

  it.each([
    ["sources", "source-a.jpg"],
    ["thumbnails", "source-a.webp"],
  ])("refuse à un visiteur une photo de source réservée aux essais (%s/%s)", async (folder, filename) => {
    requireAdminApi.mockResolvedValue(Response.json({ error: "Accès refusé" }, { status: 401 }));

    const response = await get(folder, filename);

    expect(response.status).toBe(401);
    expect(readFile).not.toHaveBeenCalled();
  });

  it("sert une photo de source à un administrateur, sans la mettre en cache", async () => {
    requireAdminApi.mockResolvedValue(null);

    const response = await get("sources", "source-a.jpg");

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });
});
