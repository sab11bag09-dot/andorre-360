import { describe, expect, it } from "vitest";
import * as cheerio from "cheerio";

import type { Source } from "@/lib/generated/prisma/client";

import {
  HtmlCollector,
  parseDayMonthWithoutYear,
  parseWordPressPostDate,
  wordPressPostJsonUrl,
} from "../collectors/HtmlCollector";
import type { HtmlClient } from "../html/HtmlClient";

/** Pages servies par adresse ; aucune requête réseau réelle. */
class PagesClient implements HtmlClient {
  public readonly requested: string[] = [];

  constructor(private readonly pages: Record<string, string>) {}

  async get(url: string): Promise<string> {
    this.requested.push(url);
    const page = this.pages[url];
    if (page === undefined) throw new Error(`Page inconnue : ${url}`);
    return page;
  }
}

function source(url: string): Source {
  return { id: 1, name: "Source de test", url, collectionMode: "HTML" } as Source;
}

const BODY = "<p>Paragraphe éditorial assez long pour être conservé par la collecte.</p>";

describe("date sans année (« 16 Nov »)", () => {
  const reference = new Date("2026-11-21T10:00:00Z");

  it.each([
    ["16 Nov", "2026-11-16"],
    ["3 de set.", "2026-09-03"],
    ["1 gen", "2026-01-01"],
  ])("lit « %s »", (value, expected) => {
    expect(parseDayMonthWithoutYear(value, reference)?.toISOString().slice(0, 10)).toBe(expected);
  });

  it("prend l’année précédente quand la date tomberait dans le futur", () => {
    expect(
      parseDayMonthWithoutYear("28 Des", new Date("2027-01-03T10:00:00Z"))?.toISOString().slice(0, 10),
    ).toBe("2026-12-28");
  });

  it("refuse un texte qui n’est pas une date seule", () => {
    expect(parseDayMonthWithoutYear("16 Nov 2026 actualitat", reference)).toBeNull();
    expect(parseDayMonthWithoutYear("31 Nov", reference)).toBeNull();
    expect(parseDayMonthWithoutYear("12 xyz", reference)).toBeNull();
  });
});

describe("fiche JSON WordPress", () => {
  const article = "https://www.fae.ad/article-test/";

  it("trouve la fiche déclarée par la page, sur le même site", () => {
    const $ = cheerio.load(
      '<link rel="alternate" type="application/json" href="https://www.fae.ad/wp-json/wp/v2/posts/30475">',
    );
    expect(wordPressPostJsonUrl($, article)).toBe("https://www.fae.ad/wp-json/wp/v2/posts/30475");
  });

  it("ignore une fiche d’un autre site", () => {
    const $ = cheerio.load(
      '<link rel="alternate" type="application/json" href="https://ailleurs.example/wp-json/wp/v2/posts/1">',
    );
    expect(wordPressPostJsonUrl($, article)).toBeNull();
  });

  it("lit la date UTC, sinon la date du site", () => {
    expect(parseWordPressPostDate('{"date_gmt":"2026-11-18T09:30:00","date":"2026-11-18T10:30:00"}')?.toISOString()).toBe(
      "2026-11-18T09:30:00.000Z",
    );
    expect(parseWordPressPostDate('{"date":"2026-11-18T10:30:00"}')).not.toBeNull();
    expect(parseWordPressPostDate("<html>pas du JSON</html>")).toBeNull();
    expect(parseWordPressPostDate('{"date_gmt":"hier"}')).toBeNull();
  });

  it("complète la date d’un article WordPress qui ne l’affiche pas", async () => {
    const listing = "https://www.fae.ad/blog/";
    const client = new PagesClient({
      [listing]: '<h4 class="post_title entry-title"><a href="/article-test/">Article de test</a></h4>',
      [article]: `<link rel="alternate" type="application/json" href="https://www.fae.ad/wp-json/wp/v2/posts/30475">
        <div class="elementor-widget-theme-post-content">${BODY}</div>`,
      "https://www.fae.ad/wp-json/wp/v2/posts/30475": '{"date_gmt":"2026-11-18T09:30:00"}',
    });

    const [observation] = await new HtmlCollector(client).collect(source(listing));

    expect(observation.publishedAt?.toISOString()).toBe("2026-11-18T09:30:00.000Z");
  });

  it("ne fait aucune requête de plus quand la page donne déjà la date", async () => {
    const listing = "https://www.fae.ad/blog/";
    const client = new PagesClient({
      [listing]: '<h4 class="post_title entry-title"><a href="/article-test/">Article de test</a></h4>',
      [article]: `<meta property="article:published_time" content="2026-11-17T08:00:00+00:00">
        <link rel="alternate" type="application/json" href="https://www.fae.ad/wp-json/wp/v2/posts/30475">
        <div class="elementor-widget-theme-post-content">${BODY}</div>`,
    });

    const [observation] = await new HtmlCollector(client).collect(source(listing));

    expect(observation.publishedAt?.toISOString()).toBe("2026-11-17T08:00:00.000Z");
    expect(client.requested).toEqual([listing, article]);
  });
});

describe("règles de date de la page de liste", () => {
  it("lit « 16 Nov » au Comú de Sant Julià de Lòria", async () => {
    const listing = "https://comusantjulia.ad/ca/actualitat/noticies/";
    const article = "https://comusantjulia.ad/ca/actualitat/noticies/consell-d-infants/";
    const client = new PagesClient({
      [listing]: `<article class="single-post">
        <div class="post-date clearfix"><span class="day"> 16 </span> <span class="month"> Nov </span></div>
        <h2><a href="/ca/actualitat/noticies/consell-d-infants/">Consell d’Infants</a></h2>
      </article>`,
      [article]: `<div class="post-content">${BODY}</div>`,
    });

    const [observation] = await new HtmlCollector(client).collect(source(listing));

    expect(observation.publishedAt?.getUTCMonth()).toBe(10);
    expect(observation.publishedAt?.getUTCDate()).toBe(16);
  });

  it("lit la date de la liste du Consell General", async () => {
    const listing = "https://www.consellgeneral.ad";
    const article = "https://www.consellgeneral.ad/ca/noticies/sessio";
    const client = new PagesClient({
      [listing]: `<div class="noticiesDestacades"><div class="titleItem">
        <h3><a href="/ca/noticies/sessio">Sessió de preguntes</a></h3>
        <div class="tileDate">19/11/2026</div>
      </div></div>`,
      [article]: `<div id="parent-fieldname-text">${BODY}</div>`,
    });

    const [observation] = await new HtmlCollector(client).collect(source(listing));

    expect(observation.publishedAt?.toISOString().slice(0, 10)).toBe("2026-11-19");
  });
});

describe("pages qui ne sont pas des articles", () => {
  it.each([
    ["www.bca.ad", ["/botiga/", "/noticies-bca/", "/category/noticies/"], ["/previa-j9-acb-26-27/", "/cronica-j8-acb-26-27/"]],
    ["somaccio.org", ["/partit/", "/blog-2/", "/contact/"], ["/parasits-del-totxo/", "/el-futur-no-espera/"]],
  ])("écarte les pages de service de %s", async (host, excluded, kept) => {
    const { siteRules } = await import("../collectors/siteRules");
    const pattern = siteRules[host].articlePathPattern!;
    for (const path of excluded) expect(pattern.test(path), path).toBe(false);
    for (const path of kept) expect(pattern.test(path), path).toBe(true);
  });
});
