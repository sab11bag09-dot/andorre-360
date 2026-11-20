import { HOME_VISIBLE_ZONE_CAPACITIES } from "./homeComposition";

/**
 * Composition de la page d’accueil à partir des placements éditoriaux.
 *
 * Les zones placées (missions manuelles ou composition automatique) sont
 * prioritaires ; les derniers articles publiés complètent les zones vides.
 * Le nombre d’emplacements affichés est celui que l’automatisation remplit
 * (`HOME_VISIBLE_ZONE_CAPACITIES`) : aucun article placé n’est caché.
 */

export const HOME_PAGE_SLOTS = {
  briefs: HOME_VISIBLE_ZONE_CAPACITIES.brief,
  cards: HOME_VISIBLE_ZONE_CAPACITIES.card,
  discover: 3,
} as const;

export type HomeLayoutInput<Article> = {
  hero: Article | null;
  feature: Article | null;
  /** Zone sans emplacement sur la page d’accueil : ses articles ne servent pas de complément. */
  secondary: Article[];
  card: Article[];
  briefs: Article[];
  grandFormat: Article | null;
  editorial: Article | null;
  discover: Article[];
};

export type HomeComposition<Article> = {
  hero: Article | null;
  feature: Article | null;
  briefs: Article[];
  grandFormat: Article | null;
  cards: Article[];
  editorial: Article | null;
  discover: Article[];
};

export function composeHomePage<Article extends { id: number }>(
  layout: HomeLayoutInput<Article>,
  publishedArticles: readonly Article[],
  { hasActiveAutomatedComposition }: { hasActiveAutomatedComposition: boolean },
): HomeComposition<Article> {
  const placed = [
    layout.hero,
    layout.feature,
    ...layout.secondary,
    ...layout.card,
    ...layout.briefs,
    layout.grandFormat,
    layout.editorial,
    ...layout.discover,
  ].filter((article): article is Article => article !== null);

  const placedIds = new Set(placed.map(({ id }) => id));
  const available = publishedArticles.filter(({ id }) => !placedIds.has(id));
  const take = (count: number) => available.splice(0, Math.max(0, count));

  // Ordre de complément inchangé : Une, Grande carte, brèves, Grand format, cartes, À découvrir.
  const hero = layout.hero ?? take(1)[0] ?? null;
  const feature = layout.feature ?? take(1)[0] ?? null;
  const briefs = [
    ...layout.briefs,
    ...take(HOME_PAGE_SLOTS.briefs - layout.briefs.length),
  ].slice(0, HOME_PAGE_SLOTS.briefs);

  // Pendant une composition automatique, le Grand format n’est jamais choisi par défaut.
  const grandFormat =
    layout.grandFormat ?? (hasActiveAutomatedComposition ? null : (take(1)[0] ?? null));

  const cards = (layout.card.length > 0 ? layout.card : take(HOME_PAGE_SLOTS.cards)).slice(
    0,
    HOME_PAGE_SLOTS.cards,
  );

  const discover = (
    layout.discover.length > 0 ? layout.discover : take(HOME_PAGE_SLOTS.discover)
  ).slice(0, HOME_PAGE_SLOTS.discover);

  return { hero, feature, briefs, grandFormat, cards, editorial: layout.editorial, discover };
}
