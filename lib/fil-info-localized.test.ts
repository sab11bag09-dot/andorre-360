import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: { article: { findMany } },
}));

import {
  getFilInfoArticlePath,
  getFilInfoPath,
  isTranslatedFilInfoLocale,
} from "./fil-info-locale";
import { getTranslatedFilInfoArticles } from "./fil-info-localized";

describe("Fil info multilingue", () => {
  beforeEach(() => findMany.mockReset());

  it("accepte uniquement les routes catalane et espagnole", () => {
    expect(isTranslatedFilInfoLocale("ca")).toBe(true);
    expect(isTranslatedFilInfoLocale("es")).toBe(true);
    expect(isTranslatedFilInfoLocale("fr")).toBe(false);
    expect(getFilInfoPath("ca")).toBe("/ca/fil-info");
    expect(getFilInfoArticlePath("es", "article-es")).toBe("/es/article/article-es");
  });

  it("exige une traduction PUBLISHED et un article parent public", async () => {
    findMany.mockResolvedValue([]);
    await getTranslatedFilInfoArticles("ca", { limit: 21 });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        category: "ACTUALITÉ",
        published: true,
        editorialStatus: "PUBLISHED",
        filInfoVisible: true,
        translations: { some: { locale: "CA", status: "PUBLISHED" } },
      }),
      include: { translations: { where: { locale: "CA", status: "PUBLISHED" }, take: 1 } },
    }));
  });

  it("remplace uniquement le contenu éditorial par la traduction publiée", async () => {
    const createdAt = new Date("2026-08-02T08:00:00Z");
    findMany.mockResolvedValue([{
      id: 7, slug: "fr", title: "FR", description: "FR", content: "FR",
      image: "  /image.jpg  ", createdAt, publishedAt: createdAt,
      translations: [{ slug: "ca", title: "CA", description: "Descripció", content: "Contingut" }],
    }]);
    await expect(getTranslatedFilInfoArticles("ca", { limit: 1 })).resolves.toEqual([
      expect.objectContaining({ id: 7, slug: "ca", title: "CA", description: "Descripció", content: "Contingut", image: "/image.jpg" }),
    ]);
  });
});
