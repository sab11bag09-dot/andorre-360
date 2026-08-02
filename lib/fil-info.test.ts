import { describe, expect, it } from "vitest";

import {
  FIL_INFO_QUERY_LIMIT,
  getArticlePublicationDate,
  partitionFilInfoArticles,
} from "./fil-info";

describe("partitionFilInfoArticles", () => {
  it("réserve les informations les plus récentes au fil", () => {
    const result = partitionFilInfoArticles([1, 2, 3, 4]);

    expect(result.featured).toBe(1);
    expect(result.newsFeed).toEqual([2, 3, 4]);
    expect(result.briefs).toEqual([]);
    expect(result.cards).toEqual([]);
    expect(result.illustratedBriefs).toEqual([]);
  });

  it("ne place aucun article dans plusieurs blocs", () => {
    const items = Array.from(
      { length: FIL_INFO_QUERY_LIMIT },
      (_, index) => index + 1,
    );
    const result = partitionFilInfoArticles(items);
    const partitionedItems = [
      result.featured,
      ...result.newsFeed,
      ...result.briefs,
      ...result.cards,
      ...result.illustratedBriefs,
    ].filter((item): item is number => item !== null);

    expect(partitionedItems).toEqual(items);
    expect(new Set(partitionedItems).size).toBe(items.length);
  });

  it("ignore proprement une liste vide", () => {
    expect(partitionFilInfoArticles([])).toEqual({
      featured: null,
      newsFeed: [],
      briefs: [],
      cards: [],
      illustratedBriefs: [],
    });
  });
});

describe("getArticlePublicationDate", () => {
  it("utilise la date de publication lorsqu'elle existe", () => {
    const publishedAt = new Date("2026-08-02T09:00:00.000Z");

    expect(
      getArticlePublicationDate({
        publishedAt,
        createdAt: new Date("2026-08-01T09:00:00.000Z"),
      }),
    ).toBe(publishedAt);
  });

  it("utilise la date de création pour les anciennes données", () => {
    const createdAt = new Date("2026-08-01T09:00:00.000Z");

    expect(
      getArticlePublicationDate({
        publishedAt: null,
        createdAt,
      }),
    ).toBe(createdAt);
  });
});
