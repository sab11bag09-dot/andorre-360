import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import HomePageView, { type HomeArticle } from "./HomePageView";

const TITLE_70 = "Le Govern présente un plan de 12 mesures pour le logement des jeunes";

function article(id: number, overrides: Partial<HomeArticle> = {}): HomeArticle {
  return {
    id,
    slug: `article-${id}`,
    title: `${TITLE_70} ${id}`.slice(0, 70),
    description: "Description de l’article.",
    image: "/images/global/hero.jpg",
    videoUrl: null,
    category: "SOCIÉTÉ",
    ...overrides,
  };
}

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, index) => article(from + index));

const COMPLETE_HOME = {
  hero: article(1),
  feature: article(2),
  briefs: range(3, 5),
  grandFormat: article(6),
  cards: range(7, 11),
  editorial: article(12, { videoUrl: "https://www.youtube.com/watch?v=abc123" }),
  discover: range(13, 15),
};

describe("HomePageView", () => {
  const html = renderToStaticMarkup(<HomePageView home={COMPLETE_HOME} />);

  it("affiche chaque article de la composition, les cinq cartes comprises", () => {
    for (let id = 1; id <= 15; id += 1) {
      expect(html).toContain(`href="/article/article-${id}"`);
    }
  });

  it("limite les titres en lignes, jamais par une hauteur fixe", () => {
    const headings = [...html.matchAll(/<h[1-3] class="([^"]*)"[^>]*>([^<]*)</g)].filter(
      ([, , text]) => text.startsWith("Le Govern"),
    );

    expect(headings).toHaveLength(15);
    for (const [, classes] of headings) {
      expect(classes).toMatch(/\bline-clamp-[2-4]\b/);
      expect(classes).not.toMatch(/(^|\s)(max-)?h-/);
    }
  });

  it("charge la publicité du briefing depuis un fichier image", () => {
    expect(html).toContain("briefing-andorra-360.jpg");
    expect(html).not.toContain("data:image");
  });

  it("lit la vidéo de l’édito", () => {
    expect(html).toContain('src="https://www.youtube.com/embed/abc123"');
  });

  it("indique l’absence d’édito", () => {
    const withoutEditorial = renderToStaticMarkup(
      <HomePageView home={{ ...COMPLETE_HOME, editorial: null }} />,
    );

    expect(withoutEditorial).toContain("Aucun édito n’est actuellement programmé.");
  });

  it("invite à créer une Une quand il n’y en a pas", () => {
    const empty = renderToStaticMarkup(
      <HomePageView
        home={{ hero: null, feature: null, briefs: [], grandFormat: null, cards: [], editorial: null, discover: [] }}
      />,
    );

    expect(empty).toContain("Aucune Une principale définie");
    expect(empty).toContain('href="/admin/diffusion"');
  });
});
