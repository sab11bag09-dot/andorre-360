import { describe, expect, it } from "vitest";

import { DeterministicEditorialGenerator } from "./DeterministicEditorialGenerator";

describe("DeterministicEditorialGenerator", () => {
  it("normalise les données collectées", async () => {
    const generator =
      new DeterministicEditorialGenerator();

    const result =
      await generator.prepareArticle({
        originalTitle: "  Titre collecté  ",
        originalContent:
          "  Premier paragraphe collecté.  ",
        sourceName: "Source test",
        sourceCategory: "  Société  ",
      });

    expect(result).toEqual({
      title: "Titre collecté",
      description:
        "Premier paragraphe collecté.",
      content:
        "Premier paragraphe collecté.",
      category: "Société",
      author: "Source test",
    });
  });

  it("limite le chapô et utilise la catégorie de repli", async () => {
    const generator =
      new DeterministicEditorialGenerator();

    const content = "a".repeat(300);

    const result =
      await generator.prepareArticle({
        originalTitle: "Titre",
        originalContent: content,
        sourceName: "Source test",
        sourceCategory: null,
      });

    expect(result.description).toHaveLength(250);
    expect(result.content).toHaveLength(300);
    expect(result.category).toBe("Général");
  });
});