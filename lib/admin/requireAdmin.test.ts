import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, findUnique } = vi.hoisted(() => ({
  auth: vi.fn(),
  findUnique: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique } },
}));

import {
  AdminAuthorizationError,
  getAdminAuthorization,
  requireAdmin,
  requireAdminApi,
} from "./requireAdmin";

describe("autorisation administrateur", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuse une requête sans session", async () => {
    auth.mockResolvedValue(null);

    await expect(getAdminAuthorization()).resolves.toEqual({
      authorized: false,
      status: 401,
      message: "Authentification requise.",
    });
    expect(findUnique).not.toHaveBeenCalled();
  });

  it.each([
    null,
    { active: false, role: "ADMIN" },
    { active: true, role: "EDITOR" },
  ])("refuse un compte absent, inactif ou non ADMIN", async (user) => {
    auth.mockResolvedValue({ user: { email: "User@Example.com " } });
    findUnique.mockResolvedValue(user);

    await expect(getAdminAuthorization()).resolves.toEqual({
      authorized: false,
      status: 403,
      message: "Accès administrateur requis.",
    });
    expect(findUnique).toHaveBeenCalledWith({
      where: { email: "user@example.com" },
      select: { role: true, active: true },
    });
  });

  it("autorise un compte ADMIN actif", async () => {
    auth.mockResolvedValue({ user: { email: "admin@example.com" } });
    findUnique.mockResolvedValue({ active: true, role: "ADMIN" });

    await expect(requireAdmin()).resolves.toBeUndefined();
  });

  it("expose une erreur contrôlée aux actions serveur", async () => {
    auth.mockResolvedValue(null);

    await expect(requireAdmin()).rejects.toEqual(
      new AdminAuthorizationError(401, "Authentification requise."),
    );
  });

  it("retourne une réponse 403 pour une API interdite", async () => {
    auth.mockResolvedValue({ user: { email: "editor@example.com" } });
    findUnique.mockResolvedValue({ active: true, role: "EDITOR" });

    const response = await requireAdminApi();

    expect(response?.status).toBe(403);
    await expect(response?.json()).resolves.toEqual({
      error: "Accès administrateur requis.",
    });
  });

  it("retourne une réponse 401 pour une API sans session", async () => {
    auth.mockResolvedValue(null);

    const response = await requireAdminApi();

    expect(response?.status).toBe(401);
    await expect(response?.json()).resolves.toEqual({
      error: "Authentification requise.",
    });
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("laisse passer une API pour un ADMIN actif", async () => {
    auth.mockResolvedValue({ user: { email: "admin@example.com" } });
    findUnique.mockResolvedValue({ active: true, role: "ADMIN" });

    await expect(requireAdminApi()).resolves.toBeNull();
  });
});
