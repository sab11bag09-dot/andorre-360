import type { Page } from "@playwright/test";

/**
 * Mesures faites dans la page. Les pages marquent leur mise en page figée :
 * - `data-layout-row` : une rangée de colonnes qui doivent finir au même
 *   niveau (la une, une rubrique, chaque rangée du Fil info) ;
 * - `data-layout-column` : une colonne de cette rangée ;
 * - `data-layout-block` : un bloc de hauteur figée sur grand écran (une
 *   colonne peut être elle-même un bloc, comme au Fil info).
 */

export type Box = { top: number; left: number; width: number; height: number };

export type LayoutSnapshot = {
  rows: { name: string; columns: { name: string; bottom: number }[] }[];
  blocks: (Box & { key: string; row: string; overflow: number })[];
  images: (Box & { key: string })[];
};

/** Tolérance des comparaisons, en pixels (arrondis du moteur de rendu). */
export const PIXEL_TOLERANCE = 0.5;

export async function waitForStableLayout(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

export async function snapshotLayout(page: Page): Promise<LayoutSnapshot> {
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );

  return page.evaluate(() => {
    const box = (element: Element) => {
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      };
    };
    const visible = (element: Element) => getComputedStyle(element).display !== "none";
    const blocksOf = (column: Element) =>
      (column.matches("[data-layout-block]")
        ? [column]
        : Array.from(column.querySelectorAll("[data-layout-block]"))
      ).filter(visible);

    const rows = Array.from(document.querySelectorAll("[data-layout-row]")).map((row) => ({
      name: row.getAttribute("data-layout-row") ?? "",
      columns: Array.from(row.querySelectorAll("[data-layout-column]"))
        .filter(visible)
        .map((column) => ({
          name: column.getAttribute("data-layout-column") ?? "",
          bottom: Math.max(...blocksOf(column).map((block) => box(block).top + box(block).height)),
        })),
    }));

    const blocks = Array.from(document.querySelectorAll("[data-layout-block]"))
      .filter(visible)
      .map((block, index) => {
        // Débordement du bloc, ou d’un cadre qui coupe son contenu à
        // l’intérieur du bloc (une carte trop haute pour sa place). Les textes
        // limités en lignes (`line-clamp`) coupent volontairement : exclus.
        const clipping = [block, ...Array.from(block.querySelectorAll("*"))].filter((element) => {
          const style = getComputedStyle(element);
          return (
            element === block ||
            (style.overflowY !== "visible" && style.getPropertyValue("-webkit-line-clamp") === "none")
          );
        });
        const overflow = Math.max(
          ...clipping.map((element) => element.scrollHeight - element.clientHeight),
        );

        return {
          key: block.getAttribute("data-layout-block") || `bloc ${index + 1}`,
          row: block.closest("[data-layout-row]")?.getAttribute("data-layout-row") ?? "",
          overflow,
          ...box(block),
        };
      });

    const images = Array.from(document.querySelectorAll("main img")).map((image, index) => ({
      key: `${index + 1}. ${image.getAttribute("alt") ?? "image"}`,
      ...box(image),
    }));

    return { rows, blocks, images };
  });
}

/**
 * Remplace tous les titres et chapôs par `text` : les textes à lignes
 * réservées (`line-clamp`) et, même sans cette limite, les titres des cartes.
 */
export async function replaceReservedTexts(page: Page, text: string): Promise<number> {
  return page.evaluate((replacement) => {
    const texts = Array.from(document.querySelectorAll("main *")).filter(
      (element) =>
        getComputedStyle(element).getPropertyValue("-webkit-line-clamp") !== "none" ||
        element.matches('a[href*="/article/"] :is(h1, h2, h3, h4)'),
    );
    for (const element of texts) element.textContent = replacement;
    return texts.length;
  }, text);
}

/**
 * Retire des cartes (liens vers un article) dans chaque bloc figé : une sur
 * deux (`half`) ou toutes (`all`). Renvoie le nombre de cartes retirées.
 */
export async function removeCards(page: Page, mode: "half" | "all"): Promise<number> {
  return page.evaluate((removal) => {
    let removed = 0;

    for (const block of Array.from(document.querySelectorAll("[data-layout-block]"))) {
      const cards = Array.from(block.querySelectorAll('a[href*="/article/"]'));
      cards.forEach((card, index) => {
        if (removal === "half" && index % 2 === 0) return;
        // Une ligne de liste ne contenant que la carte part avec elle.
        const target =
          card.parentElement?.tagName === "LI" && card.parentElement.children.length === 1
            ? card.parentElement
            : card;
        target.remove();
        removed += 1;
      });
    }

    return removed;
  }, mode);
}

/** Écarts entre deux mesures des mêmes éléments (position ou taille). */
export function boxDifferences(
  label: string,
  before: readonly (Box & { key: string })[],
  after: readonly (Box & { key: string })[],
  { positions = true }: { positions?: boolean } = {},
): string[] {
  const differences: string[] = [];
  const afterByKey = new Map(after.map((item) => [item.key, item]));

  for (const item of before) {
    const moved = afterByKey.get(item.key);
    if (!moved) {
      differences.push(`${label} : « ${item.key} » a disparu`);
      continue;
    }
    const properties = positions
      ? (["top", "left", "width", "height"] as const)
      : (["height"] as const);
    for (const property of properties) {
      const delta = moved[property] - item[property];
      if (Math.abs(delta) > PIXEL_TOLERANCE) {
        differences.push(
          `${label} : « ${item.key} » ${property} ${item[property].toFixed(1)} → ${moved[property].toFixed(1)} px`,
        );
      }
    }
  }

  return differences;
}

/** Colonnes qui ne finissent pas au même pixel et blocs qui débordent. */
export function layoutViolations(label: string, snapshot: LayoutSnapshot): string[] {
  const violations: string[] = [];

  for (const row of snapshot.rows) {
    const bottoms = row.columns.map((column) => column.bottom);
    const empty = row.columns.filter((column) => !Number.isFinite(column.bottom));
    if (empty.length > 0) {
      violations.push(
        `${label} : rangée « ${row.name} », colonne sans bloc visible (${empty
          .map((column) => column.name)
          .join(", ")})`,
      );
      continue;
    }
    if (Math.max(...bottoms) - Math.min(...bottoms) > PIXEL_TOLERANCE) {
      violations.push(
        `${label} : rangée « ${row.name} », bas des colonnes différents (${row.columns
          .map((column) => `${column.name} ${column.bottom.toFixed(1)} px`)
          .join(", ")})`,
      );
    }
  }

  for (const block of snapshot.blocks) {
    if (block.overflow > 0) {
      violations.push(`${label} : bloc « ${block.key} » déborde de ${block.overflow} px`);
    }
  }

  return violations;
}
