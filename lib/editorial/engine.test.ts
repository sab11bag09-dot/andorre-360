import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: { publication: { findMany } },
}));

import { buildEditorialLayout } from "./engine";

describe("buildEditorialLayout", () => {
  beforeEach(() => {
    findMany.mockReset();
    findMany.mockResolvedValue([]);
  });

  it("exclut les sélections dont l’article n’est pas public", async () => {
    await buildEditorialLayout("home");

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          pageKey: "home",
          article: {
            published: true,
            editorialStatus: "PUBLISHED",
          },
        }),
      }),
    );
  });
});
