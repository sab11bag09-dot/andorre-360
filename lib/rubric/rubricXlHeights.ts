/**
 * Hauteurs figées des blocs des pages de rubrique sur grand écran (`xl`,
 * 1 280 px et plus : la page est alors limitée à 1 280 px de large et chaque
 * bloc a toujours la même largeur).
 *
 * Règle de l’utilisateur : les blocs ne bougent pas, les deux colonnes
 * finissent au même niveau en bas de page, et une fois alignés les blocs
 * gardent leur hauteur, quels que soient les textes et le nombre d’articles.
 * Un bloc sans article reste un cadre vide de la même hauteur.
 *
 * Chaque liste donne, de haut en bas, la hauteur en pixels de chaque bloc de
 * la colonne principale (`main`) et de la colonne latérale (`aside`). Avec
 * leurs espacements, les deux colonnes totalisent la même hauteur : un test le
 * vérifie. Valeurs mesurées dans le navigateur le 21 novembre 2026 ; une
 * modification des cartes (police, marges, nombre d’articles par zone) oblige
 * à les remesurer.
 */

export const RUBRIC_COLUMN_GAPS = { main: 32, aside: 24 } as const;

export type RubricXlHeights = { main: readonly number[]; aside: readonly number[] };

export const RUBRIC_XL_HEIGHTS = {
  /** Article principal, brèves, deux cartes ; lien partenaire, quatre cartes, Bon à savoir. */
  actualite: { main: [689, 354, 678], aside: [44, 329, 329, 329, 329, 305] },
  /** Politique et International. */
  news: { main: [689, 354, 237, 722], aside: [534, 329, 329, 329, 481] },
  /** Économie et Société, avec le lien partenaire en tête de colonne. */
  newsWithPartner: { main: [689, 354, 237, 790], aside: [44, 534, 329, 329, 329, 481] },
  ilsEnParlent: { main: [689, 354, 237, 459], aside: [534, 387, 387, 455] },
  ilsEnParlentSansMilieu: { main: [689, 354, 728], aside: [534, 387, 387, 455] },
  sports: { main: [689, 354, 989], aside: [534, 387, 387, 387, 305] },
  culture: { main: [689, 354, 660], aside: [534, 387, 387, 387] },
  montagne: { main: [689, 237, 941], aside: [534, 387, 387, 551] },
  loisirs: { main: [689, 354, 941], aside: [534, 387, 387, 668] },
} as const satisfies Record<string, RubricXlHeights>;

export function rubricColumnTotal(heights: readonly number[], gap: number): number {
  return heights.reduce((sum, height) => sum + height, 0) + gap * Math.max(0, heights.length - 1);
}
