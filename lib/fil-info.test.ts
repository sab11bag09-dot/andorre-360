import { describe, expect, it } from "vitest";

import {
  FIL_INFO_NEWS_FEED_SIZE,
  FIL_INFO_QUERY_LIMIT,
  FIL_INFO_SELECTION_SIZE,
  getArticlePublicationDate,
  partitionFilInfoArticles,
} from "./fil-info";

describe("partitionFilInfoArticles", () => {
  const makeItem = (
    id: number,
    filInfoFormat = "ARTICLE",
    featured = false,
    filInfoPinned = false,
  ) => ({ id, filInfoFormat, featured, filInfoPinned });

  it("met les articles les plus récents dans La sélection et garde alertes et brèves dans le fil", () => {
    const alert = makeItem(1, "ALERT");
    const article = makeItem(2);
    const brief = makeItem(3, "BRIEF");
    const result = partitionFilInfoArticles([alert, article, brief]);

    expect(result.selection).toEqual([article]);
    expect(result.pinned).toBeNull();
    expect(result.newsFeed).toEqual([alert, brief]);
    expect(result.rest).toEqual([]);
  });

  it("place d’abord l’article explicitement sélectionné", () => {
    const items = [makeItem(1), makeItem(2), makeItem(3, "ARTICLE", true)];
    const result = partitionFilInfoArticles(items);

    expect(result.selection.map((item) => item.id)).toEqual([3, 1, 2]);
  });

  it("limite La sélection et le fil, sans placer un article deux fois", () => {
    const items = Array.from({ length: FIL_INFO_QUERY_LIMIT + 1 }, (_, index) =>
      makeItem(index + 1, index % 2 ? "BRIEF" : "ARTICLE", false, index === 0),
    );
    const result = partitionFilInfoArticles(items);
    const placed = [
      result.pinned,
      ...result.selection,
      ...result.newsFeed,
      ...result.rest,
    ].filter((item) => item !== null);

    expect(result.selection).toHaveLength(FIL_INFO_SELECTION_SIZE);
    expect(result.newsFeed).toHaveLength(FIL_INFO_NEWS_FEED_SIZE);
    expect(result.rest.length).toBeGreaterThan(0);
    expect(new Set(placed).size).toBe(items.length);
    expect(placed.map((item) => item.id).sort((a, b) => a - b)).toEqual(items.map((item) => item.id));
  });

  it("garde dans le fil l’ordre chronologique, et la suite plus ancienne que sa dernière ligne", () => {
    const items = Array.from({ length: 20 }, (_, index) => makeItem(index + 1, "BRIEF"));
    const result = partitionFilInfoArticles(items);

    expect(result.newsFeed.map((item) => item.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(result.rest[0].id).toBe(9);
  });

  it("ignore proprement une liste vide", () => {
    expect(partitionFilInfoArticles([])).toEqual({
      pinned: null,
      selection: [],
      newsFeed: [],
      rest: [],
    });
  });

  it("retire le contenu épinglé de tous les autres blocs", () => {
    const pinned = makeItem(1, "ALERT", false, true);
    const article = makeItem(2);
    const result = partitionFilInfoArticles([pinned, article]);

    expect(result.pinned).toBe(pinned);
    expect(result.selection).toEqual([article]);
    expect(result.newsFeed).toEqual([]);
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
