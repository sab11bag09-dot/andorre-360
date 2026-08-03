import { describe, expect, it, vi } from "vitest";

import { recordEditorialEvent } from "./editorial-history";

describe("historique éditorial", () => {
  it("conserve l’acteur, la transition et les détails", async () => {
    const create = vi.fn().mockResolvedValue({ id: 1 });

    await recordEditorialEvent(
      { editorialEvent: { create } },
      {
        action: "ARTICLE_STATUS_CHANGED",
        articleId: 42,
        actor: {
          id: "admin-1",
          email: "admin@example.com",
        },
        fromStatus: "DRAFT",
        toStatus: "REVIEW",
        details: {
          source: "article-workflow",
          automatic: false,
        },
      },
    );

    expect(create).toHaveBeenCalledWith({
      data: {
        action: "ARTICLE_STATUS_CHANGED",
        articleId: 42,
        translationId: undefined,
        actorId: "admin-1",
        actorEmail: "admin@example.com",
        fromStatus: "DRAFT",
        toStatus: "REVIEW",
        details: JSON.stringify({
          source: "article-workflow",
          automatic: false,
        }),
      },
    });
  });

  it("n’ajoute pas de détails artificiels", async () => {
    const create = vi.fn().mockResolvedValue({ id: 2 });

    await recordEditorialEvent(
      { editorialEvent: { create } },
      {
        action: "ARTICLE_CREATED",
        articleId: 7,
        actor: {
          id: "admin-2",
          email: "redaction@example.com",
        },
        toStatus: "DRAFT",
      },
    );

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        details: undefined,
      }),
    });
  });
});
