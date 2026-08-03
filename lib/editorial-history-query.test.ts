import { describe, expect, it } from "vitest";

import {
  buildEditorialHistoryHref,
  parseEditorialHistoryFilters,
} from "./editorial-history-query";

describe("filtres du journal éditorial", () => {
  it("normalise les filtres valides", () => {
    expect(
      parseEditorialHistoryFilters({
        articleId: "42",
        actor: "  admin@example.com  ",
        action: "ARTICLE_PUBLISHED",
        page: "3",
      }),
    ).toEqual({
      articleId: 42,
      actor: "admin@example.com",
      action: "ARTICLE_PUBLISHED",
      page: 3,
    });
  });

  it("neutralise les valeurs invalides", () => {
    expect(
      parseEditorialHistoryFilters({
        articleId: "-7",
        action: "DELETE_EVERYTHING",
        page: "0",
      }),
    ).toEqual({
      articleId: null,
      actor: "",
      action: null,
      page: 1,
    });
  });

  it("conserve les filtres dans les liens de pagination", () => {
    expect(
      buildEditorialHistoryHref(
        {
          articleId: 42,
          actor: "admin+soir@example.com",
          action: "TRANSLATION_GENERATED",
          page: 1,
        },
        2,
      ),
    ).toBe(
      "/admin/history?articleId=42&actor=admin%2Bsoir%40example.com&action=TRANSLATION_GENERATED&page=2",
    );
  });
});
