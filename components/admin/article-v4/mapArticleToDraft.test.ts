import { describe, expect, it } from "vitest";

import { mapArticleToDraft } from "./mapArticleToDraft";

const article = {
  id: 1,
  slug: "article-test",
  title: "Article test",
  category: "ACTUALITÉ",
  description: "Description",
  content: "Contenu",
  image: "/images/test.jpg",
  author: "ANDORRE 360",
  readingTime: "2 min",
  contentType: "article",
  filInfoFormat: "BRIEF",
  filInfoVisible: true,
  filInfoPinned: false,
  videoUrl: null,
  videoDuration: null,
  socialText: null,
  featured: false,
  published: false,
  editorialStatus: "DRAFT" as const,
  publishedAt: null,
  updatedAt: new Date("2026-08-02T06:00:00.000Z"),
};

describe("mapArticleToDraft", () => {
  it("conserve le format du Fil info", () => {
    expect(mapArticleToDraft(article).filInfoFormat).toBe("BRIEF");
  });

  it("normalise une ancienne valeur inconnue", () => {
    expect(
      mapArticleToDraft({
        ...article,
        filInfoFormat: "format-inconnu",
      }).filInfoFormat,
    ).toBe("ARTICLE");
  });

  it("charge les réglages administratifs du Fil info", () => {
    const draft = mapArticleToDraft({
      ...article,
      filInfoVisible: false,
      filInfoPinned: true,
      publishedAt: new Date("2026-08-02T05:30:00.000Z"),
    });

    expect(draft.filInfoVisible).toBe(false);
    expect(draft.filInfoPinned).toBe(true);
    expect(draft.publishedAt).toBe("2026-08-02T05:30:00.000Z");
    expect(draft.updatedAt).toBe("2026-08-02T06:00:00.000Z");
  });
});
