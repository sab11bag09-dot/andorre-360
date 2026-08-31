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
            category: {
              not: "ILS_EN_PARLENT",
            },
          },
        }),
      }),
    );
  });

  it("réserve l’exclusion ILS_EN_PARLENT à la page d’accueil", async () => {
    await buildEditorialLayout("category:POLITIQUE");

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          pageKey: "category:POLITIQUE",
          article: {
            published: true,
            editorialStatus: "PUBLISHED",
          },
        }),
      }),
    );
  });

  it("ne place jamais le même article dans plusieurs zones", async () => {
    const article = { id: 42 };
    findMany.mockResolvedValue([
      { zone: "hero", article },
      { zone: "feature", article },
      { zone: "brief", article },
    ]);

    const layout = await buildEditorialLayout("home");

    expect(layout.hero).toEqual(article);
    expect(layout.feature).toBeNull();
    expect(layout.briefs).toEqual([]);
  });
});
