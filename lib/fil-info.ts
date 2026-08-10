import { normalizeFilInfoFormat } from "./fil-info-format";
import { getPublicArticleDate } from "./public-article";

export const FIL_INFO_NEWS_FEED_SIZE = 6;
export const FIL_INFO_BRIEFS_SIZE = 6;
export const FIL_INFO_CARDS_SIZE = 4;
export const FIL_INFO_ILLUSTRATED_BRIEFS_SIZE = 5;
export const FIL_INFO_SELECTION_SIZE = 2;
export const FIL_INFO_PAGE_SIZE = 20;
export const FIL_INFO_REFRESH_INTERVAL_MS = 45_000;

export const FIL_INFO_QUERY_LIMIT =
  FIL_INFO_PAGE_SIZE;

type FilInfoPartitionArticle = {
  featured: boolean;
  filInfoFormat: string;
  filInfoPinned: boolean;
};

export function partitionFilInfoArticles<T extends FilInfoPartitionArticle>(
  items: readonly T[],
) {
  const pinnedIndex = items.findIndex((item) => item.filInfoPinned);
  const pinned = pinnedIndex >= 0 ? items[pinnedIndex] : null;
  const unpinnedItems = items.filter((_, index) => index !== pinnedIndex);
  const explicitSelectionIndex = unpinnedItems.findIndex(
    (item) =>
      item.featured &&
      normalizeFilInfoFormat(item.filInfoFormat) === "ARTICLE",
  );
  const firstSelectionIndex =
    explicitSelectionIndex >= 0
      ? explicitSelectionIndex
      : unpinnedItems.findIndex(
          (item) =>
            normalizeFilInfoFormat(item.filInfoFormat) === "ARTICLE",
        );
  const selectionIndexes =
    firstSelectionIndex >= 0
      ? [
          firstSelectionIndex,
          ...unpinnedItems
            .map((item, index) => ({ item, index }))
            .filter(
              ({ item, index }) =>
                index !== firstSelectionIndex &&
                normalizeFilInfoFormat(item.filInfoFormat) === "ARTICLE",
            )
            .slice(0, FIL_INFO_SELECTION_SIZE - 1)
            .map(({ index }) => index),
        ]
      : [];
  const featured = selectionIndexes.map((index) => unpinnedItems[index]);
  const remainingItems = unpinnedItems.filter(
    (_, index) => !selectionIndexes.includes(index),
  );
  let cursor = 0;

  const newsFeed = remainingItems.slice(
    cursor,
    cursor + FIL_INFO_NEWS_FEED_SIZE,
  );
  cursor += newsFeed.length;

  const briefs = remainingItems.slice(
    cursor,
    cursor + FIL_INFO_BRIEFS_SIZE,
  );
  cursor += briefs.length;

  const cards = remainingItems.slice(
    cursor,
    cursor + FIL_INFO_CARDS_SIZE,
  );
  cursor += cards.length;

  const illustratedBriefs = remainingItems.slice(
    cursor,
    cursor + FIL_INFO_ILLUSTRATED_BRIEFS_SIZE,
  );

  return {
    pinned,
    featured,
    newsFeed,
    briefs,
    cards,
    illustratedBriefs,
  };
}

export function getArticlePublicationDate(article: {
  publishedAt: Date | null;
  createdAt: Date;
}) {
  return getPublicArticleDate(article);
}
