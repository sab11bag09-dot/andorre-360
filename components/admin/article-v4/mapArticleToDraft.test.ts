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
  videoUrl: null,
  videoDuration: null,
  socialText: null,
  featured: false,
  published: false,
  editorialStatus: "DRAFT" as const,
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
});
