import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminApi, findMany } = vi.hoisted(() => ({
  requireAdminApi: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("@/lib/admin/requireAdmin", () => ({ requireAdminApi }));
vi.mock("@/lib/prisma", () => ({ prisma: { media: { findMany } } }));

import { GET } from "./route";

describe("GET /api/media", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findMany.mockResolvedValue([{ id: 1, path: "/api/media/files/sources/a.jpg" }]);
  });

  it("refuse la médiathèque à un visiteur non administrateur", async () => {
    requireAdminApi.mockResolvedValue(Response.json({ error: "Accès refusé" }, { status: 401 }));

    const response = await GET();

    expect(response.status).toBe(401);
    expect(findMany).not.toHaveBeenCalled();
  });

  it("renvoie la médiathèque à un administrateur", async () => {
    requireAdminApi.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ media: [{ id: 1, path: "/api/media/files/sources/a.jpg" }] });
  });
});
