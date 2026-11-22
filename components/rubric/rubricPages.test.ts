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
  Culture: "components/CulturePageV2.tsx",
  Économie: "components/EconomiePageV2.tsx",
  "Ils en parlent": "components/ImmobilierPageV2.tsx",
  International: "components/InternationalPageV2.tsx",
  Loisirs: "components/LifestylePageV2.tsx",
  Montagne: "components/MontagnePageV2.tsx",
  Politique: "components/PolitiquePageV2.tsx",
  Société: "components/SocietePageV2.tsx",
  Sports: "components/SportsPageV2.tsx",
};

describe("Économie : photos du bas en format paysage", () => {
  it("utilise le bas compact et deux cartes latérales", () => {
    expect(source(PAGES.Économie)).toContain("compactBottom");
    expect(source(NEWS_RUBRIC_PAGE)).toContain("RUBRIC_XL_HEIGHTS.newsWithPartnerCompact");
    expect(source(NEWS_RUBRIC_PAGE)).toContain("const sideCount = compactBottom ? 2 : 3;");
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

  it("Ils en parlent affiche les cartes du milieu sur sa route", () => {
    expect(source("app/(public)/ils-en-parlent/page.tsx")).toContain(
      "<ImmobilierPageV2 showMiddleCards />",
    );
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
