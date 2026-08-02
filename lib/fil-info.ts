import { normalizeFilInfoFormat } from "./fil-info-format";

export const FIL_INFO_NEWS_FEED_SIZE = 6;
export const FIL_INFO_BRIEFS_SIZE = 6;
export const FIL_INFO_CARDS_SIZE = 4;
export const FIL_INFO_ILLUSTRATED_BRIEFS_SIZE = 4;

export const FIL_INFO_QUERY_LIMIT =
  1 +
  FIL_INFO_NEWS_FEED_SIZE +
  FIL_INFO_BRIEFS_SIZE +
  FIL_INFO_CARDS_SIZE +
  FIL_INFO_ILLUSTRATED_BRIEFS_SIZE;

type FilInfoPartitionArticle = {
  featured: boolean;
  filInfoFormat: string;
};

export function partitionFilInfoArticles<T extends FilInfoPartitionArticle>(
  items: readonly T[],
) {
  const explicitSelectionIndex = items.findIndex(
    (item) =>
      item.featured &&
      normalizeFilInfoFormat(item.filInfoFormat) === "ARTICLE",
  );
  const selectionIndex =
    explicitSelectionIndex >= 0
      ? explicitSelectionIndex
      : items.findIndex(
          (item) =>
            normalizeFilInfoFormat(item.filInfoFormat) === "ARTICLE",
        );
  const featured =
    selectionIndex >= 0 ? items[selectionIndex] : null;
  const remainingItems = items.filter(
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
