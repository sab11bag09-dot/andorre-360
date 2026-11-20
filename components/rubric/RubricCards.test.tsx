import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  RubricBriefCard,
  RubricGoodToKnow,
  RubricHero,
  RubricImageCard,
  RubricMainCard,
  RubricQuestionCard,
  RubricTextCard,
  type RubricArticle,
} from "./RubricCards";

const TITLE_70 = "Le Govern présente un plan de 12 mesures pour le logement des jeunes";

function article(overrides: Partial<RubricArticle> = {}): RubricArticle {
  return {
    id: 1,
    slug: "plan-logement",
    title: TITLE_70,
    description: "Description de l’article.",
    image: "/images/global/hero.jpg",
    videoUrl: null,
    category: "SOCIÉTÉ",
    ...overrides,
  };
}

function headingClasses(html: string): string[] {
  return [...html.matchAll(/<h[1-3] class="([^"]*)"/g)].map((match) => match[1]);
}

const CARDS = {
  "une de rubrique": <RubricHero article={article()} />,
  "article principal": <RubricMainCard article={article()} />,
  brève: <RubricBriefCard article={article()} />,
  "carte sans image": <RubricTextCard article={article()} />,
  "carte large": <RubricImageCard article={article()} size="wide" />,
  "carte latérale": <RubricImageCard article={article()} size="side" />,
  "Question à…": <RubricQuestionCard article={article()} />,
  "Bon à savoir": <RubricGoodToKnow article={article()} />,
};

describe("cartes partagées des rubriques", () => {
  it.each(Object.entries(CARDS))("%s : lien, titre entier et appel à lire", (_, card) => {
    const html = renderToStaticMarkup(card);

    expect(html).toContain('href="/article/plan-logement"');
    expect(html).toContain(TITLE_70);
    expect(html).toMatch(/Lire l’(article|entretien) →/);

    // Titre limité en lignes, jamais par une hauteur fixe qui le couperait.
    for (const classes of headingClasses(html)) {
      expect(classes).toMatch(/\bline-clamp-[3-4]\b/);
      expect(classes).not.toMatch(/(^|\s)(max-)?h-/);
    }
  });

  it("affiche le libellé de catégorie choisi par la page dans la une", () => {
    const html = renderToStaticMarkup(
      <RubricHero article={article({ category: "IMMOBILIER" })} categoryLabel="ILS EN PARLENT" />,
    );

    expect(html).toContain("ILS EN PARLENT");
    expect(html).not.toContain("IMMOBILIER");
  });

  it("reprend l’image de secours dans Question à… quand l’article n’en a pas", () => {
    const html = renderToStaticMarkup(
      <RubricQuestionCard article={article({ image: null })} fallbackImage="/images/secours.jpg" />,
    );

    expect(html).toContain("Question à…");
    expect(html).toContain("Lire l’entretien →");
    expect(html).toContain("secours.jpg");
  });

  it("n’intègre jamais de lecteur vidéo dans une carte cliquable", () => {
    const withVideo = article({ videoUrl: "https://www.youtube.com/watch?v=abc123" });

    for (const card of [
      <RubricQuestionCard key="question" article={withVideo} />,
      <RubricImageCard key="side" article={withVideo} size="side" />,
    ]) {
      expect(renderToStaticMarkup(card)).not.toContain("<iframe");
    }
  });

  it("peut masquer la description d’une carte avec image", () => {
    const html = renderToStaticMarkup(
      <RubricImageCard article={article()} size="wide" showDescription={false} />,
    );

    expect(html).not.toContain("Description de l’article.");
  });

  it("étire l’image de la carte qui doit remplir la colonne", () => {
    const html = renderToStaticMarkup(
      <RubricImageCard article={article()} size="side" stretch />,
    );

    expect(html).toContain("lg:flex-1");
  });

  it("ajoute la brève de Bon à savoir sous l’article", () => {
    const html = renderToStaticMarkup(
      <RubricGoodToKnow
        article={article()}
        brief={article({ id: 2, slug: "breve-utile", title: "Brève utile" })}
      />,
    );

    expect(html).toContain("Bon à savoir");
    expect(html).toContain('href="/article/breve-utile"');
    expect(html).toContain("Brève utile");
  });
});
