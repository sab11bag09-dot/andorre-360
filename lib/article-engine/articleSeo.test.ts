import { describe, expect, it, vi } from "vitest";

import {
  createArticleMetadata,
  getPublicArticleSeoVersions,
} from "./articleSeo";
import type { PublicArticleSeoRepository } from "./repositories/PublicArticleSeoRepository";

const publishedAt = new Date("2026-08-01T12:00:00.000Z");

describe("createArticleMetadata", () => {
  it("cree le canonical et les hreflang des seules versions publiees", () => {
    const metadata = createArticleMetadata({
      language: "ca",
      slug: "politica-habitatge",
      title: "Política d’habitatge",
      description: "Descripció catalana",
      image: "/media/habitatge.jpg",
      publishedAt,
      versions: {
        frenchSlug: "politique-logement",
        translations: [
          { locale: "CA", slug: "politica-habitatge" },
        ],
      },
    });

    expect(metadata.alternates).toEqual({
      canonical: "/ca/article/politica-habitatge",
      languages: {
        fr: "/article/politique-logement",
        ca: "/ca/article/politica-habitatge",
        "x-default": "/article/politique-logement",
      },
    });
    expect(metadata.openGraph).toEqual(
      expect.objectContaining({
        locale: "ca_AD",
        title: "Política d’habitatge",
        description: "Descripció catalana",
        url: "/ca/article/politica-habitatge",
        images: ["/media/habitatge.jpg"],
      }),
    );
  });

  it("n'ajoute pas de hreflang vers une traduction non publiee", () => {
    const metadata = createArticleMetadata({
      language: "fr",
      slug: "politique-logement",
      title: "Politique du logement",
      description: "Description française",
      image: null,
      publishedAt,
      versions: {
        frenchSlug: "politique-logement",
        translations: [],
      },
    });

    expect(metadata.alternates?.languages).toEqual({
      fr: "/article/politique-logement",
      "x-default": "/article/politique-logement",
    });
    expect(metadata.openGraph).not.toHaveProperty("images");
  });

  it("utilise la page courante comme x-default sans version francaise", () => {
    const metadata = createArticleMetadata({
      language: "es",
      slug: "politica-vivienda",
      title: "Política de vivienda",
      description: "Descripción española",
      image: null,
      publishedAt,
      versions: {
        frenchSlug: null,
        translations: [
          { locale: "ES", slug: "politica-vivienda" },
        ],
      },
    });

    expect(metadata.alternates?.languages).toEqual({
      es: "/es/article/politica-vivienda",
      "x-default": "/es/article/politica-vivienda",
    });
  });
});

describe("getPublicArticleSeoVersions", () => {
  it("delegue la lecture des versions publiees", async () => {
    const versions = {
      frenchSlug: "article-fr",
      translations: [
        { locale: "ES" as const, slug: "article-es" },
      ],
    };
    const repository: PublicArticleSeoRepository = {
      findPublishedVersionsByArticleId: vi
        .fn()
        .mockResolvedValue(versions),
    };

    await expect(
      getPublicArticleSeoVersions(42, repository),
    ).resolves.toEqual(versions);
  });
});
