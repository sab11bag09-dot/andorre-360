import { describe, expect, it, vi } from "vitest";

import {
  buildArticleSourceCredits,
  loadArticleSourceCredits,
  sourceAttributionLead,
  sourceAttributionSeparator,
} from "./articleSourceCredits";

const govern = { id: 3, name: "Govern d’Andorra" };
const diari = { id: 6, name: "Diari d’Andorra" };

describe("buildArticleSourceCredits", () => {
  it("crédite la source de l’observation avec un lien vers l’article d’origine", () => {
    expect(
      buildArticleSourceCredits([
        { id: 10, url: "https://www.govern.ad/ca/noticies/busos", source: govern },
      ]),
    ).toEqual([
      { name: "Govern d’Andorra", url: "https://www.govern.ad/ca/noticies/busos" },
    ]);
  });

  it("ne crédite chaque source qu’une fois, dans l’ordre des observations", () => {
    expect(
      buildArticleSourceCredits([
        { id: 12, url: "https://www.govern.ad/b", source: govern },
        { id: 11, url: "https://www.diariandorra.ad/a", source: diari },
        { id: 10, url: "https://www.govern.ad/a", source: govern },
      ]),
    ).toEqual([
      { name: "Govern d’Andorra", url: "https://www.govern.ad/a" },
      { name: "Diari d’Andorra", url: "https://www.diariandorra.ad/a" },
    ]);
  });

  it("garde le nom mais retire un lien qui n’est pas une adresse web", () => {
    expect(
      buildArticleSourceCredits([
        { id: 10, url: "javascript:alert(1)", source: govern },
        { id: 11, url: "pas une adresse", source: diari },
      ]),
    ).toEqual([
      { name: "Govern d’Andorra", url: null },
      { name: "Diari d’Andorra", url: null },
    ]);
  });

  it("ignore une source sans nom", () => {
    expect(
      buildArticleSourceCredits([
        { id: 10, url: "https://www.govern.ad/a", source: { id: 3, name: "  " } },
      ]),
    ).toEqual([]);
  });

  it("ne crédite rien pour un article sans observation", () => {
    expect(buildArticleSourceCredits([])).toEqual([]);
  });
});

describe("mention « D’après… »", () => {
  it("donne la mention dans la langue de l’article", () => {
    expect(sourceAttributionLead("fr")).toBe("D’après");
    expect(sourceAttributionLead("ca")).toBe("Segons");
    expect(sourceAttributionLead("es")).toBe("Según");
  });

  it("sépare les sources par des virgules, puis « et » devant la dernière", () => {
    const names = ["Govern", "CASS", "Comú d’Encamp"];
    const phrase = (language: "fr" | "ca" | "es") =>
      sourceAttributionLead(language) +
      names.map((name, index) => sourceAttributionSeparator(language, index, names.length) + name).join("");

    expect(phrase("fr")).toBe("D’après Govern, CASS et Comú d’Encamp");
    expect(phrase("ca")).toBe("Segons Govern, CASS i Comú d’Encamp");
    expect(phrase("es")).toBe("Según Govern, CASS y Comú d’Encamp");
  });
});

describe("loadArticleSourceCredits", () => {
  it("lit les observations rattachées à l’article et en tire les crédits", async () => {
    const findMany = vi.fn().mockResolvedValue([
      { id: 10, url: "https://www.govern.ad/a", source: govern },
    ]);

    await expect(
      loadArticleSourceCredits(499, { observation: { findMany } }),
    ).resolves.toEqual([{ name: "Govern d’Andorra", url: "https://www.govern.ad/a" }]);

    expect(findMany).toHaveBeenCalledWith({
      where: { articleId: 499 },
      select: {
        id: true,
        url: true,
        source: { select: { id: true, name: true } },
      },
      orderBy: { id: "asc" },
    });
  });
});
