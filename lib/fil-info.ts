import { normalizeFilInfoFormat } from "./fil-info-format";

export const FIL_INFO_NEWS_FEED_SIZE = 6;
export const FIL_INFO_BRIEFS_SIZE = 6;
export const FIL_INFO_CARDS_SIZE = 4;
export const FIL_INFO_ILLUSTRATED_BRIEFS_SIZE = 4;

export const FIL_INFO_QUERY_LIMIT =
  2 +
  FIL_INFO_NEWS_FEED_SIZE +
  FIL_INFO_BRIEFS_SIZE +
  FIL_INFO_CARDS_SIZE +
  FIL_INFO_ILLUSTRATED_BRIEFS_SIZE;

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
  const selectionIndex =
    explicitSelectionIndex >= 0
      ? explicitSelectionIndex
      : unpinnedItems.findIndex(
          (item) =>
            normalizeFilInfoFormat(item.filInfoFormat) === "ARTICLE",
        );
  const featured =
    selectionIndex >= 0 ? unpinnedItems[selectionIndex] : null;
  const remainingItems = unpinnedItems.filter(
    (_, index) => index !== selectionIndex,
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
  return article.publishedAt ?? article.createdAt;
}
