import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: { publication: { findMany } },
}));

import { getHomepagePublications } from "./publications";

describe("getHomepagePublications", () => {
  beforeEach(() => {
    findMany.mockReset();
    findMany.mockResolvedValue([]);
  });

  it("applique la barrière publique aux missions de l’accueil", async () => {
    await getHomepagePublications();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          article: {
            published: true,
            editorialStatus: "PUBLISHED",
          },
        }),
      }),
    );
  });
});
