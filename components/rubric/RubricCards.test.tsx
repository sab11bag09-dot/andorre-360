import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { unreservedLineClamps } from "@/components/testing/reservedLines";

import {
  RUBRIC_COLUMN_GAPS,
  RUBRIC_XL_HEIGHTS,
  rubricColumnTotal,
} from "@/lib/rubric/rubricXlHeights";

import {
  RubricBriefCard,
  RubricGrid,
  RubricPage,
  rubricColumn,
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

describe("cartes partagées des rubriques : mise en page indépendante des textes", () => {
  it.each(Object.entries(CARDS))("%s : chaque texte réserve ses lignes", (_, card) => {
    expect(unreservedLineClamps(renderToStaticMarkup(card))).toEqual([]);
  });

  it("garde la place du chapô quand l’article n’en a pas", () => {
    for (const card of [
      <RubricMainCard key="main" article={article({ description: null })} />,
      <RubricTextCard key="text" article={article({ description: null })} />,
      <RubricImageCard key="wide" article={article({ description: null })} size="wide" />,
      <RubricQuestionCard key="question" article={article({ description: null })} />,
      <RubricGoodToKnow key="good" article={article({ description: null })} />,
    ]) {
      const html = renderToStaticMarkup(card);
      const withDescription = renderToStaticMarkup(
        { ...card, props: { ...card.props, article: article() } },
      );

      expect(html.match(/min-h-\[\d+lh\]/g)).toEqual(withDescription.match(/min-h-\[\d+lh\]/g));
      expect(html).toContain('aria-hidden="true"');
    }
  });
});

describe("pages de rubrique : blocs figés et colonnes alignées en bas", () => {
  it.each(Object.entries(RUBRIC_XL_HEIGHTS))("%s : les deux colonnes ont la même hauteur totale", (_, heights) => {
    expect(rubricColumnTotal(heights.main, RUBRIC_COLUMN_GAPS.main)).toBe(
      rubricColumnTotal(heights.aside, RUBRIC_COLUMN_GAPS.aside),
    );
  });

  it("fige chaque bloc à sa hauteur et garde le cadre d’un bloc sans article", () => {
    const html = renderToStaticMarkup(
      <RubricPage
        main={rubricColumn([689, 354], [<RubricMainCard key="main" article={article()} />, null])}
        aside={rubricColumn([534, 509], [null, <RubricTextCard key="text" article={article()} />], { fill: 1 })}
      />,
    );

    for (const height of [689, 354, 534, 509]) {
      expect(html).toContain(`--rubric-slot-height:${height}px`);
    }
    // Les cadres vides n’apparaissent que sur grand écran, où ils gardent la hauteur.
    expect(html.match(/class="hidden xl:flex flex-col/g)).toHaveLength(2);
    expect(html).toContain("xl:h-[var(--rubric-slot-height)]");
    expect(html).toContain("lg:flex-1 xl:h-[var(--rubric-slot-height)] xl:flex-none");
  });

  it("refuse une colonne dont le nombre de blocs ne correspond pas aux hauteurs", () => {
    expect(() => rubricColumn([689, 354], [null])).toThrow("1 blocs pour 2 hauteurs figées");
  });

  it("garde le nombre de rangées d’une grille, même avec moins de cartes", () => {
    const html = renderToStaticMarkup(
      <RubricGrid columns={3} rows={2}>
        <RubricBriefCard article={article()} />
      </RubricGrid>,
    );

    expect(html).toContain("xl:grid-rows-2");
    expect(html).toContain("xl:h-full");
  });
});
