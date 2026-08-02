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

export function partitionFilInfoArticles<T>(items: readonly T[]) {
  let cursor = 0;

  const featured = items[cursor] ?? null;
  cursor += featured ? 1 : 0;

  const newsFeed = items.slice(
    cursor,
    cursor + FIL_INFO_NEWS_FEED_SIZE,
  );
  cursor += newsFeed.length;

  const briefs = items.slice(
    cursor,
    cursor + FIL_INFO_BRIEFS_SIZE,
  );
  cursor += briefs.length;

  const cards = items.slice(
    cursor,
    cursor + FIL_INFO_CARDS_SIZE,
  );
  cursor += cards.length;

  const illustratedBriefs = items.slice(
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
