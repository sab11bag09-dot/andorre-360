import { beforeEach, describe, expect, it, vi } from "vitest";

const { create, findUnique, updateMany } = vi.hoisted(() => ({
  create: vi.fn(),
  findUnique: vi.fn(),
  updateMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    articleTranslation: {
      create,
      findUnique,
      updateMany,
    },
  },
}));

import { PrismaArticleTranslationRepository } from "./PrismaArticleTranslationRepository";

describe("PrismaArticleTranslationRepository - slugs", () => {
  beforeEach(() => {
    create.mockReset();
    findUnique.mockReset();
    updateMany.mockReset();
  });

  it("ajoute un suffixe en cas de collision dans une langue", async () => {
    findUnique
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce(null);

    const repository = new PrismaArticleTranslationRepository();

    await expect(
      repository.resolveUniqueSlug("CA", "mateix-titol"),
    ).resolves.toBe("mateix-titol-2");

    expect(findUnique).toHaveBeenNthCalledWith(1, {
      where: {
        locale_slug: {
          locale: "CA",
          slug: "mateix-titol",
        },
      },
      select: { id: true },
    });
    expect(findUnique).toHaveBeenNthCalledWith(2, {
      where: {
        locale_slug: {
          locale: "CA",
          slug: "mateix-titol-2",
        },
      },
      select: { id: true },
    });
  });

  it("autorise le meme slug dans une autre langue", async () => {
    findUnique.mockResolvedValue(null);

    const repository = new PrismaArticleTranslationRepository();

    await expect(
      repository.resolveUniqueSlug("CA", "actualitat"),
    ).resolves.toBe("actualitat");
    await expect(
      repository.resolveUniqueSlug("ES", "actualitat"),
    ).resolves.toBe("actualitat");

    expect(findUnique).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: {
          locale_slug: {
            locale: "CA",
            slug: "actualitat",
          },
        },
      }),
    );
    expect(findUnique).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: {
          locale_slug: {
            locale: "ES",
            slug: "actualitat",
          },
        },
      }),
    );
  });

  it("conserve le slug de la traduction modifiee", async () => {
    findUnique.mockResolvedValue({ id: 12 });

    const repository = new PrismaArticleTranslationRepository();

    await expect(
      repository.resolveUniqueSlug("ES", "estable", 12),
    ).resolves.toBe("estable");
  });

  it("genere un slug lisible a la creation", async () => {
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue({ id: 15 });

    const repository = new PrismaArticleTranslationRepository();
    await repository.createDraft({
      articleId: 7,
      locale: "CA",
      title: "Nova política d’habitatge",
      description: "Entradeta",
      content: "Contingut",
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: "nova-politica-d-habitatge",
        }),
      }),
    );
  });

  it("ne modifie pas le slug pendant une regeneration", async () => {
    updateMany.mockResolvedValue({ count: 1 });

    const repository = new PrismaArticleTranslationRepository();
    await repository.updateDraft(12, {
      articleId: 7,
      locale: "ES",
      title: "Titulo regenerado",
      description: "Entradilla",
      content: "Contenido",
    });

    const update = updateMany.mock.calls[0][0];
    expect(update.data).not.toHaveProperty("slug");
  });

  it("met a jour le slug seulement avant publication", async () => {
    updateMany.mockResolvedValue({ count: 1 });

    const repository = new PrismaArticleTranslationRepository();
    await repository.updateSlugBeforePublication(
      12,
      "APPROVED",
      "slug-stable",
    );

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: 12,
        status: "APPROVED",
        publishedAt: null,
      },
      data: {
        slug: "slug-stable",
      },
    });
  });
});
