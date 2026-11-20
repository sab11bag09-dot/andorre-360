import { describe, expect, it, vi } from "vitest";

import { PrismaArticleRepository } from "./PrismaArticleRepository";

function client({ testOnly }: { testOnly: boolean | null }) {
  return {
    article: {
      findUnique: vi.fn(async () => ({ image: "/api/media/files/sources/p.jpg" })),
      updateMany: vi.fn(async () => ({ count: 1 })),
    },
    media: {
      findUnique: vi.fn(async () => (testOnly === null ? null : { testOnly })),
    },
  };
}

describe("PrismaArticleRepository.publishDraft", () => {
  it("refuse la publication automatique d’un brouillon illustré par une photo réservée aux essais", async () => {
    const db = client({ testOnly: true });
    const repository = new PrismaArticleRepository(db as never);

    await expect(repository.publishDraft(42)).rejects.toThrow("Publication refusée");
    expect(db.article.updateMany).not.toHaveBeenCalled();
  });

  it("publie un brouillon dont l’image est publiable", async () => {
    const db = client({ testOnly: false });
    const repository = new PrismaArticleRepository(db as never);

    await repository.publishDraft(42);

    expect(db.article.updateMany).toHaveBeenCalledTimes(1);
  });
});
