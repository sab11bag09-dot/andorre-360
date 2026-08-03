import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath }));

import {
  PUBLIC_CATEGORY_PATHS,
  revalidateEditorialPublicPage,
  revalidateFilInfoPublicPages,
  revalidatePublicArticlePages,
  revalidateTranslatedPublicPages,
} from "./public-revalidation";

describe("revalidation publique", () => {
  beforeEach(() => {
    revalidatePath.mockReset();
  });

  it("référence toutes les rubriques publiques", () => {
    expect(PUBLIC_CATEGORY_PATHS).toEqual({
      "ACTUALITÉ": "/actualite",
      "ÉCONOMIE": "/economie",
      "SOCIÉTÉ": "/societe",
      POLITIQUE: "/politique",
      IMMOBILIER: "/immobilier",
      INTERNATIONAL: "/international",
      SPORTS: "/sports",
      CULTURE: "/culture",
      MONTAGNE: "/montagne",
      LIFESTYLE: "/lifestyle",
    });
  });

  it("invalide l’accueil, les rubriques concernées et les fiches", () => {
    revalidatePublicArticlePages({
      categories: ["POLITIQUE", "SOCIÉTÉ", "POLITIQUE"],
      slugs: ["nouveau-slug", "ancien-slug"],
    });

    expect(revalidatePath.mock.calls).toEqual([
      ["/"],
      ["/politique"],
      ["/societe"],
      ["/article/nouveau-slug"],
      ["/article/ancien-slug"],
      ["/[locale]/article/[slug]", "page"],
    ]);
  });

  it("invalide aussi tous les Fils info pour Actualité", () => {
    revalidatePublicArticlePages({ categories: ["ACTUALITÉ"] });

    expect(revalidatePath.mock.calls).toEqual([
      ["/"],
      ["/actualite"],
      ["/fil-info"],
      ["/ca/fil-info"],
      ["/es/fil-info"],
    ]);
  });

  it("cible la rubrique d’une mission éditoriale", () => {
    revalidateEditorialPublicPage("category:IMMOBILIER");

    expect(revalidatePath.mock.calls).toEqual([
      ["/"],
      ["/immobilier"],
    ]);
  });

  it("invalide les variantes localisées", () => {
    revalidateTranslatedPublicPages("CA");

    expect(revalidatePath.mock.calls).toEqual([
      ["/[locale]/article/[slug]", "page"],
      ["/ca/fil-info"],
    ]);
  });

  it("invalide explicitement les trois Fils info", () => {
    revalidateFilInfoPublicPages();

    expect(revalidatePath.mock.calls).toEqual([
      ["/fil-info"],
      ["/ca/fil-info"],
      ["/es/fil-info"],
    ]);
  });
});
