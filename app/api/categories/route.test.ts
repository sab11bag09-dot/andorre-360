import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminApi, findMany, create } = vi.hoisted(() => ({
  requireAdminApi: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
}));

vi.mock("@/lib/admin/requireAdmin", () => ({ requireAdminApi }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    category: { findMany, create },
  },
}));

import { GET, POST } from "./route";

describe("API catégories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("conserve la lecture publique", async () => {
    findMany.mockResolvedValue([]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(requireAdminApi).not.toHaveBeenCalled();
  });

  it("bloque une création avant de lire le corps ou écrire en base", async () => {
    requireAdminApi.mockResolvedValue(
      Response.json(
        { error: "Authentification requise." },
        { status: 401 },
      ),
    );
    const request = {
      json: vi.fn(),
    } as unknown as Request;

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(request.json).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });
});
