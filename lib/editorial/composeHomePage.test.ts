import { describe, expect, it } from "vitest";

import { composeHomePage, HOME_PAGE_SLOTS, type HomeLayoutInput } from "./composeHomePage";
import { HOME_VISIBLE_ZONE_CAPACITIES } from "./homeComposition";

type TestArticle = { id: number };

const article = (id: number): TestArticle => ({ id });
const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, index) => article(from + index));
const ids = (articles: TestArticle[]) => articles.map(({ id }) => id);

function emptyLayout(overrides: Partial<HomeLayoutInput<TestArticle>> = {}): HomeLayoutInput<TestArticle> {
  return {
    hero: null,
    feature: null,
    secondary: [],
    card: [],
    briefs: [],
    grandFormat: null,
    editorial: null,
    discover: [],
    ...overrides,
  };
}

describe("composeHomePage", () => {
  it("affiche autant de cartes que l’automatisation en place, première comprise", () => {
    const placed = range(101, 105);
    const home = composeHomePage(emptyLayout({ hero: article(1), card: placed }), [], {
      hasActiveAutomatedComposition: true,
    });

    expect(HOME_PAGE_SLOTS.cards).toBe(HOME_VISIBLE_ZONE_CAPACITIES.card);
    expect(ids(home.cards)).toEqual([101, 102, 103, 104, 105]);
  });

  it("aligne le nombre de brèves sur la capacité de l’automatisation", () => {
    expect(HOME_PAGE_SLOTS.briefs).toBe(HOME_VISIBLE_ZONE_CAPACITIES.brief);
  });

  it("donne la priorité aux zones placées et complète les zones vides par les derniers articles", () => {
    const home = composeHomePage(
      emptyLayout({ feature: article(50), briefs: [article(60)] }),
      range(1, 20),
      { hasActiveAutomatedComposition: false },
    );

    expect(home.hero?.id).toBe(1);
    expect(home.feature?.id).toBe(50);
    expect(ids(home.briefs)).toEqual([60, 2, 3]);
    expect(home.grandFormat?.id).toBe(4);
    expect(ids(home.cards)).toEqual([5, 6, 7, 8, 9]);
    expect(ids(home.discover)).toEqual([10, 11, 12]);
  });

  it("n’affiche jamais deux fois le même article", () => {
    const home = composeHomePage(
      emptyLayout({ hero: article(3), card: [article(5)], secondary: [article(7)] }),
      range(1, 20),
      { hasActiveAutomatedComposition: false },
    );

    const shown = [
      home.hero,
      home.feature,
      ...home.briefs,
      home.grandFormat,
      ...home.cards,
      home.editorial,
      ...home.discover,
    ].filter((item): item is TestArticle => item !== null);

    expect(new Set(ids(shown)).size).toBe(shown.length);
    expect(ids(shown)).not.toContain(7);
  });

  it("laisse le Grand format vide pendant une composition automatique sans placement", () => {
    const home = composeHomePage(emptyLayout({ hero: article(1) }), range(2, 20), {
      hasActiveAutomatedComposition: true,
    });

    expect(home.grandFormat).toBeNull();
  });

  it("n’affiche pas plus d’articles que d’emplacements, même placés à la main", () => {
    const home = composeHomePage(
      emptyLayout({ hero: article(1), briefs: range(10, 15), card: range(20, 28), discover: range(30, 35) }),
      [],
      { hasActiveAutomatedComposition: false },
    );

    expect(home.briefs).toHaveLength(HOME_PAGE_SLOTS.briefs);
    expect(home.cards).toHaveLength(HOME_PAGE_SLOTS.cards);
    expect(home.discover).toHaveLength(HOME_PAGE_SLOTS.discover);
  });

  it("ne renvoie pas d’Une quand aucun article n’est disponible", () => {
    expect(composeHomePage(emptyLayout(), [], { hasActiveAutomatedComposition: false }).hero).toBeNull();
  });
});
