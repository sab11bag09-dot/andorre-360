import { expect, test } from "@playwright/test";

import { layoutServerUrl } from "./database";
import {
  boxDifferences,
  layoutViolations,
  removeCards,
  replaceReservedTexts,
  snapshotLayout,
  waitForStableLayout,
} from "./measure";

/**
 * Règle de mise en page de l’utilisateur, vérifiée dans un vrai navigateur :
 * les blocs et les photos ne bougent jamais selon la longueur des textes ou le
 * nombre d’articles. Sur grand écran (`xl`, 1 280 px et plus), chaque bloc a
 * une hauteur figée et les colonnes finissent alignées en bas.
 *
 * Lancement : `npm run build`, puis `npm run test:mise-en-page` (Chromium à
 * installer une fois avec `npx playwright install chromium`). Une page dont
 * les blocs changent doit marquer sa structure avec `data-layout-row`,
 * `data-layout-column` et `data-layout-block` (voir `measure.ts`).
 */

const PAGES = [
  { path: "/", name: "la une" },
  { path: "/actualite", name: "Actualité" },
  { path: "/politique", name: "Politique" },
  { path: "/economie", name: "Économie" },
  { path: "/societe", name: "Société" },
  { path: "/international", name: "International" },
  { path: "/ils-en-parlent", name: "Ils en parlent" },
  { path: "/sports", name: "Sports" },
  { path: "/culture", name: "Culture" },
  { path: "/montagne", name: "Montagne" },
  { path: "/loisirs", name: "Loisirs" },
  { path: "/fil-info", name: "Fil info" },
] as const;

/** Rangées de colonnes attendues sur chaque page. */
function expectedRows(path: string): string[] {
  if (path === "/") return ["une"];
  if (path === "/fil-info") return ["fil", "a-suivre"];
  return ["rubrique"];
}

const WIDE_SCREENS = [1280, 1440] as const;
const PHONE = { width: 375, height: 812 } as const;

const SHORT_TEXT = "Bref.";
const LONG_TEXT = Array.from(
  { length: 12 },
  () =>
    "Le gouvernement d’Andorre détaille un projet très attendu par les habitants des sept paroisses",
).join(" ; ");

for (const width of WIDE_SCREENS) {
  test.describe(`grand écran, ${width} px`, () => {
    test.use({ viewport: { width, height: 900 } });

    for (const { path, name } of PAGES) {
      test(`${name} (${path}) : blocs figés et colonnes alignées en bas`, async ({ page }) => {
        await page.goto(path);
        await waitForStableLayout(page);

        const reference = await snapshotLayout(page);
        expect(
          reference.rows.map((row) => row.name),
          "rangées de colonnes repérées dans la page",
        ).toEqual(expectedRows(path));
        for (const row of reference.rows) {
          expect(row.columns.length, `colonnes de la rangée « ${row.name} »`).toBeGreaterThanOrEqual(2);
        }

        const violations = layoutViolations("textes du jeu de données", reference);

        // Textes très courts puis très longs : rien ne doit bouger.
        for (const [label, text] of [
          ["textes très courts", SHORT_TEXT],
          ["textes très longs", LONG_TEXT],
        ] as const) {
          const replaced = await replaceReservedTexts(page, text);
          expect(replaced, "titres et chapôs remplacés").toBeGreaterThan(0);
          const snapshot = await snapshotLayout(page);
          violations.push(
            ...layoutViolations(label, snapshot),
            ...boxDifferences(`${label}, bloc`, reference.blocks, snapshot.blocks),
            ...boxDifferences(`${label}, photo`, reference.images, snapshot.images),
          );
        }

        // Cartes retirées : les blocs gardent leur place et leur hauteur.
        for (const [label, mode] of [
          ["une carte sur deux retirée", "half"],
          ["toutes les cartes retirées", "all"],
        ] as const) {
          await page.reload();
          await waitForStableLayout(page);
          const removed = await removeCards(page, mode);
          expect(removed, `cartes retirées (${label})`).toBeGreaterThan(0);
          const snapshot = await snapshotLayout(page);
          violations.push(
            ...layoutViolations(label, snapshot),
            ...boxDifferences(label, reference.blocks, snapshot.blocks),
          );
        }

        // Même page servie avec très peu d’articles (jeu « clairsemé ») : les
        // blocs vides restent des cadres de la même hauteur. Seule une rangée
        // entière sans aucun article peut être omise (au Fil info, la rangée
        // À suivre et À retenir, en bas de page) ; un bloc d’une rangée
        // affichée ne disparaît jamais.
        await page.goto(`${layoutServerUrl("clairseme")}${path}`);
        await waitForStableLayout(page);
        const sparse = await snapshotLayout(page);
        violations.push(
          ...layoutViolations("jeu clairsemé", sparse),
          ...boxDifferences(
            "jeu clairsemé",
            reference.blocks.filter((block) => sparse.rows.some((row) => row.name === block.row)),
            sparse.blocks,
            { positions: false },
          ),
        );

        expect(violations, "écarts à la règle de mise en page").toEqual([]);
      });
    }
  });
}

test.describe(`téléphone, ${PHONE.width} px`, () => {
  test.use({ viewport: PHONE, isMobile: true, hasTouch: true });

  for (const { path, name } of PAGES) {
    test(`${name} (${path}) : pas de défilement horizontal`, async ({ page }) => {
      await page.goto(path);
      await waitForStableLayout(page);

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth, "largeur de la page").toBeLessThanOrEqual(clientWidth);
    });
  }
});
