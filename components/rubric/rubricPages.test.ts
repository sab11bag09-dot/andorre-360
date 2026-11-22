import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * Garde-fou contre le retour des cartes recopiées : chaque page de rubrique
 * décrit seulement son plan et sa répartition d’articles, et délègue le rendu
 * des cartes aux composants partagés de `components/rubric/`.
 */

const ROOT = new URL("../../", import.meta.url);

function source(path: string): string {
  return readFileSync(new URL(path, ROOT), "utf8");
}

const NEWS_RUBRIC_PAGE = "components/rubric/NewsRubricPage.tsx";

const PAGES = {
  Actualité: "app/(public)/actualite/page.tsx",
  Culture: "components/rubric/pages/CulturePage.tsx",
  Économie: "components/rubric/pages/EconomiePage.tsx",
  "Ils en parlent": "components/rubric/pages/IlsEnParlentPage.tsx",
  International: "components/rubric/pages/InternationalPage.tsx",
  Loisirs: "components/rubric/pages/LoisirsPage.tsx",
  Montagne: "components/rubric/pages/MontagnePage.tsx",
  Politique: "components/rubric/pages/PolitiquePage.tsx",
  Société: "components/rubric/pages/SocietePage.tsx",
  Sports: "components/rubric/pages/SportsPage.tsx",
};

describe("Économie, Société et Politique : photos du bas en format paysage", () => {
  it.each(["Économie", "Société", "Politique", "International"] as const)("%s utilise le bas compact", (page) => {
    expect(source(PAGES[page])).toContain("compactBottom");
  });

  it("utilise le bas compact et deux cartes latérales", () => {
    expect(source(NEWS_RUBRIC_PAGE)).toContain("RUBRIC_XL_HEIGHTS.newsCompact");
    expect(source(NEWS_RUBRIC_PAGE)).toContain("RUBRIC_XL_HEIGHTS.newsWithPartnerCompact");
    expect(source(NEWS_RUBRIC_PAGE)).toContain("const sideCount = compactBottom ? 2 : 3;");
  });
});

describe("Actualité : photos du bas réduites, trois cartes latérales", () => {
  it("garde trois cartes latérales qui remplissent leur bloc", () => {
    const page = source(PAGES.Actualité);
    expect(page).toContain("side: 3,");
    expect(page).toContain("...[0, 1, 2].map(");
    expect(page).toContain("stretch\n");
  });

  it("laisse la publicité du bas tenir dans le bloc réduit", () => {
    expect(source(PAGES.Actualité)).toContain("xl:h-auto xl:min-h-0 xl:flex-1");
  });
});

describe("Loisirs : sans les trois cartes du bas", () => {
  it("garde deux cartes en bas et agrandit les photos des cartes latérales", () => {
    const page = source(PAGES.Loisirs);
    expect(page).toContain("takeArticles(layout.card, 2)");
    expect(page).toContain("takeArticles([], 1)");
    expect(page).toContain("<RubricGrid columns={2} rows={1} fill>");
    // Question à… et les deux cartes latérales remplissent leur bloc.
    expect(page.match(/ stretch \/>/g)).toHaveLength(3);
  });
});

describe("Culture : photos du bas réduites, sans Question à…", () => {
  it("affiche quatre cartes latérales et aucune carte Question à…", () => {
    const page = source(PAGES.Culture);
    expect(page).toContain("side: 4,");
    expect(page).not.toContain("RubricQuestionCard");
    expect(page).not.toContain("question:");
  });
});

describe("Sports : page allégée", () => {
  it("garde trois brèves, deux cartes photo et deux cartes latérales, sans Bon à savoir", () => {
    const page = source(PAGES.Sports);
    expect(page).toContain("briefs: 3,");
    expect(page).toContain("bottom: 2,");
    expect(page).toContain("side: 2,");
    expect(page).not.toContain("RubricGoodToKnow");
  });
});

describe("pages de rubrique", () => {
  it.each(Object.entries(PAGES))("%s : utilise les cartes partagées, sans carte recopiée", (_, path) => {
    const page = source(path);

    expect(page).toMatch(/from "@\/components\/rubric\/(RubricCards|NewsRubricPage)"/);
    expect(page).not.toMatch(/<article\b/);
    expect(page).not.toMatch(/<h[1-3]\b/);
  });

  it.each(
    Object.entries(PAGES).filter(([name]) => name !== "Loisirs"),
  )("%s : répartit les articles sans en sauter aucun", (_, path) => {
    const page = source(path);

    // Les rubriques d’information délèguent leur plan à NewsRubricPage.
    const plan = page.includes("<NewsRubricPage") ? source(NEWS_RUBRIC_PAGE) : page;

    expect(plan).toContain("allocateRubricSlots(");
    expect(plan).not.toMatch(/items\[\d+\]|items\.slice\(/);
  });

  it("Loisirs garde le complément par la Montagne et le trafic du Pas de la Casa", () => {
    const page = source(PAGES.Loisirs);

    expect(page).toContain('buildEditorialLayout("category:LOISIRS")');
    expect(page).toContain('getArticlesByCategory("MONTAGNE")');
    expect(page).toContain("<PasDeLaCasaTraffic />");
  });

  it("Ils en parlent n’a plus les trois cartes du bas", () => {
    const page = source(PAGES["Ils en parlent"]);
    expect(page).toContain("side: 2,");
    expect(page).not.toContain("bottom");
    expect(page).toContain("RUBRIC_XL_HEIGHTS.ilsEnParlent;");
    expect(source("app/(public)/ils-en-parlent/page.tsx")).toContain('from "@/components/rubric/pages/IlsEnParlentPage"');
    // Le nom de la catégorie s’affiche sans tirets bas.
    expect(page).toContain('featured.category === "ILS_EN_PARLENT"');
  });

  it("conserve les liens partenaires et les formats publicitaires", () => {
    expect(source(PAGES.Économie)).toContain("https://www.andorracorporate.com");
    expect(source(PAGES.Société)).toContain("https://www.andorrasignature.com");

    const actualite = source(PAGES.Actualité);
    expect(actualite).toContain("https://www.andorracorporate.com");
    expect(actualite).toContain('activeAdvertisement?.format === "FOUR_COLUMNS"');
    expect(actualite).toContain('activeAdvertisement?.format === "TWO_COLUMNS_WITH_CARD"');
  });
});

describe("pages de rubrique : hauteurs figées", () => {
  it.each(Object.entries(PAGES))("%s : déclare ses blocs avec leurs hauteurs figées", (_, path) => {
    const page = source(path);
    const plan = page.includes("<NewsRubricPage") ? source(NEWS_RUBRIC_PAGE) : page;

    expect(plan).toContain("RUBRIC_XL_HEIGHTS.");
    expect(plan.match(/rubricColumn\(/g)).toHaveLength(2);
    // Chaque grille garde son nombre de rangées.
    for (const grid of plan.matchAll(/<RubricGrid\b[^>]*>/g)) {
      expect(grid[0]).toMatch(/rows=\{[12]\}/);
    }
  });
});
