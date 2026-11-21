import { normalizeFilInfoFormat } from "./fil-info-format";
import { getPublicArticleDate } from "./public-article";

/**
 * Page Fil info allégée (21 novembre 2026) : le fil chronologique et, à côté,
 * La sélection ; plus de zones en dessous. « Afficher plus » prolonge le fil
 * juste en dessous.
 */
export const FIL_INFO_NEWS_FEED_SIZE = 8;
export const FIL_INFO_SELECTION_SIZE = 4;
/** Publications chargées à chaque « Afficher plus ». */
export const FIL_INFO_PAGE_SIZE = 20;
export const FIL_INFO_REFRESH_INTERVAL_MS = 45_000;

/**
 * Articles affichés au plus sur la première page : l’information épinglée,
 * La sélection et le fil. La page en lit un de plus pour savoir s’il reste
 * une suite.
 */
export const FIL_INFO_QUERY_LIMIT = 1 + FIL_INFO_SELECTION_SIZE + FIL_INFO_NEWS_FEED_SIZE;

/**
 * Hauteur figée de la rangée du fil et de La sélection sur grand écran (`xl`,
 * 1 280 px et plus : largeur de page constante). Les deux colonnes en prennent
 * la hauteur ; leurs lignes et leurs cartes la partagent à parts égales, quel
 * que soit leur nombre. Mesurée dans le navigateur le 21 novembre 2026 ; le
 * fil et ses huit lignes n’ont pas changé.
 */
export const FIL_INFO_XL_ROW_HEIGHT = 1810;

type FilInfoPartitionArticle = {
  featured: boolean;
  filInfoFormat: string;
  filInfoPinned: boolean;
};

/**
 * Répartit la première page : l’information épinglée, La sélection (l’article
 * mis en avant, puis les articles les plus récents) et le fil, dans l’ordre
 * chronologique. Les publications restantes (`rest`, plus anciennes que la
 * dernière ligne du fil) ne sont pas affichées : « Afficher plus » les charge.
 */
export function partitionFilInfoArticles<T extends FilInfoPartitionArticle>(
  items: readonly T[],
) {
  const pinnedIndex = items.findIndex((item) => item.filInfoPinned);
  const pinned = pinnedIndex >= 0 ? items[pinnedIndex] : null;
  const unpinnedItems = items.filter((_, index) => index !== pinnedIndex);
  const isArticle = (item: T) => normalizeFilInfoFormat(item.filInfoFormat) === "ARTICLE";

  const explicit = unpinnedItems.find((item) => item.featured && isArticle(item));
  const selection = [
    ...(explicit ? [explicit] : []),
    ...unpinnedItems.filter((item) => item !== explicit && isArticle(item)),
  ].slice(0, FIL_INFO_SELECTION_SIZE);

  const remainingItems = unpinnedItems.filter((item) => !selection.includes(item));
  const newsFeed = remainingItems.slice(0, FIL_INFO_NEWS_FEED_SIZE);
  const rest = remainingItems.slice(FIL_INFO_NEWS_FEED_SIZE);

  return { pinned, selection, newsFeed, rest };
}

export function getArticlePublicationDate(article: {
  publishedAt: Date | null;
  createdAt: Date;
}) {
  return getPublicArticleDate(article);
}
