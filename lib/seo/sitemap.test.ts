import { describe, expect, it } from "vitest";

import { buildSitemap } from "./sitemap";
import { absoluteUrl, siteUrl } from "./siteUrl";

const BASE = new URL("https://andorre360.ad");
const NOW = new Date("2026-11-23T21:00:00Z");

describe("adresse du site", () => {
  it("suit NEXT_PUBLIC_SITE_URL, sinon le serveur local", () => {
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://andorre360.ad" }).origin).toBe("https://andorre360.ad");
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: " " }).origin).toBe("http://localhost:3000");
    expect(absoluteUrl("/sitemap.xml", BASE)).toBe("https://andorre360.ad/sitemap.xml");
  });
});

describe("plan du site", () => {
  const sitemap = buildSitemap(
    [
      {
        slug: "le-budget",
        image: "/uploads/budget.jpg",
        updatedAt: new Date("2026-11-20T10:00:00Z"),
        translations: [
          { locale: "CA", slug: "el-pressupost", updatedAt: new Date("2026-11-20T11:00:00Z") },
          { locale: "ES", slug: "el-presupuesto", updatedAt: new Date("2026-11-20T12:00:00Z") },
        ],
      },
      { slug: "seul", image: "/images/global/hero.jpg", updatedAt: NOW, translations: [] },
    ],
    { base: BASE, now: NOW },
  );
  const urls = sitemap.map((entry) => entry.url);

  it("liste la une, le fil info en trois langues et les rubriques, sans les rubriques renvoyées", () => {
    expect(urls.slice(0, 4)).toEqual([
      "https://andorre360.ad/",
      "https://andorre360.ad/fil-info",
      "https://andorre360.ad/ca/fil-info",
      "https://andorre360.ad/es/fil-info",
    ]);
    expect(urls).toContain("https://andorre360.ad/politique");
    expect(urls).toContain("https://andorre360.ad/ils-en-parlent");
    expect(urls).not.toContain("https://andorre360.ad/lifestyle");
    expect(urls).not.toContain("https://andorre360.ad/immobilier");
  });

  it("liste chaque version d’un article avec toutes ses langues", () => {
    const languages = {
      fr: "https://andorre360.ad/article/le-budget",
      ca: "https://andorre360.ad/ca/article/el-pressupost",
      es: "https://andorre360.ad/es/article/el-presupuesto",
      "x-default": "https://andorre360.ad/article/le-budget",
    };
    for (const url of [languages.fr, languages.ca, languages.es]) {
      const entry = sitemap.find((candidate) => candidate.url === url);
      expect(entry?.alternates?.languages).toEqual(languages);
      expect(entry?.images).toEqual(["https://andorre360.ad/uploads/budget.jpg"]);
    }
    expect(sitemap.find((entry) => entry.url === languages.ca)?.lastModified).toEqual(
      new Date("2026-11-20T11:00:00Z"),
    );
  });

  it("n’annonce ni langues absentes ni image générique", () => {
    const entry = sitemap.find((candidate) => candidate.url === "https://andorre360.ad/article/seul");
    expect(entry?.alternates).toBeUndefined();
    expect(entry?.images).toBeUndefined();
  });
});
