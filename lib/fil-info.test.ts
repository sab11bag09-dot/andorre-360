import { describe, expect, it } from "vitest";

import {
  FIL_INFO_QUERY_LIMIT,
  getArticlePublicationDate,
  partitionFilInfoArticles,
} from "./fil-info";

describe("partitionFilInfoArticles", () => {
  const makeItem = (
    id: number,
    filInfoFormat = "ARTICLE",
    featured = false,
  ) => ({ id, filInfoFormat, featured });

  it("conserve les alertes récentes dans le fil", () => {
    const alert = makeItem(1, "ALERT");
    const article = makeItem(2);
    const brief = makeItem(3, "BRIEF");
    const result = partitionFilInfoArticles([
      alert,
      article,
      brief,
    ]);

    expect(result.featured).toBe(article);
    expect(result.newsFeed).toEqual([alert, brief]);
    expect(result.briefs).toEqual([]);
    expect(result.cards).toEqual([]);
    expect(result.illustratedBriefs).toEqual([]);
  });

  it("privilégie l’article explicitement sélectionné", () => {
    const items = [
      makeItem(1),
      makeItem(2),
      makeItem(3, "ARTICLE", true),
    ];

    const result = partitionFilInfoArticles(items);

    expect(result.featured).toBe(items[2]);
    expect(result.newsFeed).toEqual(items.slice(0, 2));
  });

  it("ne place aucun article dans plusieurs blocs", () => {
    const items = Array.from(
      { length: FIL_INFO_QUERY_LIMIT },
      (_, index) => makeItem(index + 1),
    );
    const result = partitionFilInfoArticles(items);
    const partitionedItems = [
      result.featured,
      ...result.newsFeed,
      ...result.briefs,
      ...result.cards,
      ...result.illustratedBriefs,
    ].filter((item): item is ReturnType<typeof makeItem> => item !== null);

    expect(
      partitionedItems.map((item) => item.id).sort((a, b) => a - b),
    ).toEqual(items.map((item) => item.id));
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
