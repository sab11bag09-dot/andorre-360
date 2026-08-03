import { describe, expect, it } from "vitest";

import type { Source } from "@/lib/generated/prisma/client";

import { HtmlCollector } from "../collectors/HtmlCollector";
import type { HtmlClient } from "../html/HtmlClient";

class FakeHtmlClient implements HtmlClient {
  public receivedUrl: string | null = null;

  public readonly receivedUrls: string[] = [];

  public activeRequests = 0;

  public maxActiveRequests = 0;

  constructor(
    private readonly responses: Record<string, string> = {},
    private readonly delayMs = 0,
  ) {}

  async get(url: string): Promise<string> {
    this.receivedUrl = url;

    this.receivedUrls.push(url);

    this.activeRequests += 1;
    this.maxActiveRequests = Math.max(
      this.maxActiveRequests,
      this.activeRequests,
    );

    if (this.delayMs > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.delayMs),
      );
    }

    this.activeRequests -= 1;

    return this.responses[url] ?? "";
  }
}

function createSource(): Source {
  return {
    id: 1,
    name: "Source de test",
    url: "https://example.com",
    description: null,
    category: null,
    organizationType: "OTHER",
    collectionMode: "HTML",
    publicationMode: "MANUAL",
    trustLevel: "HIGH",
    checkIntervalMinutes: 60,
    active: true,
    availabilityStatus: "UNKNOWN",
    lastCheckedAt: null,
    lastSuccessAt: null,
    lastErrorAt: null,
    lastErrorMessage: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

describe("HtmlCollector", () => {
  it("appelle le client HTML avec l'URL de la source", async () => {
    const htmlClient = new FakeHtmlClient();
    const collector = new HtmlCollector(htmlClient);
    const source = createSource();

    await collector.collect(source);

    expect(htmlClient.receivedUrl).toBe(source.url);
  });

  it("ignore les pages de catégories RTVA", async () => {
    const source = {
      ...createSource(),
      name: "RTVA",
      url: "https://www.rtva.ad",
    };
    const articleUrl =
      "https://www.rtva.ad/noticies/cultura/article-test";
    const htmlClient = new FakeHtmlClient({
      [source.url]: `
        <a href="/noticies/societat">Societat</a>
        <a href="/noticies/politica">Política</a>
        <a href="/noticies/economia">Economia</a>
        <a href="/noticies/cultura">Cultura</a>
        <a href="/noticies/cultura/article-test">Article test</a>
      `,
      [articleUrl]: `
        <div class="ContentArticle_infoBody_test">
          <p>Contingut prou llarg perquè sigui reconegut com un article real.</p>
        </div>
      `,
    });
    const collector = new HtmlCollector(htmlClient);

    const observations = await collector.collect(source);

    expect(observations).toEqual([
      expect.objectContaining({
        title: "Article test",
        url: articleUrl,
      }),
    ]);
    expect(htmlClient.receivedUrls).toEqual([
      source.url,
      articleUrl,
    ]);
  });

  it("limite et parallélise prudemment les articles RTVA", async () => {
    const source = {
      ...createSource(),
      name: "RTVA",
      url: "https://www.rtva.ad",
    };
    const articleLinks = Array.from(
      { length: 30 },
      (_, index) =>
        `<a href="/noticies/societat/article-${index}">Article ${index}</a>`,
    ).join("");
    const articleResponses = Object.fromEntries(
      Array.from({ length: 30 }, (_, index) => [
        `https://www.rtva.ad/noticies/societat/article-${index}`,
        `<div class="ContentArticle_infoBody_test"><p>Contingut prou llarg per a l'article número ${index} de la prova RTVA.</p></div>`,
      ]),
    );
    const htmlClient = new FakeHtmlClient(
      {
        [source.url]: articleLinks,
        ...articleResponses,
      },
      1,
    );
    const collector = new HtmlCollector(htmlClient);

    const observations = await collector.collect(source);

    expect(observations).toHaveLength(24);
    expect(observations[0]?.title).toBe("Article 0");
    expect(observations[23]?.title).toBe("Article 23");
    expect(htmlClient.receivedUrls).toHaveLength(25);
    expect(htmlClient.maxActiveRequests).toBe(4);
  });

  it("extrait le corps éditorial de La Veu Lliure", async () => {
    const source = {
      ...createSource(),
      name: "La Veu Lliure",
      url: "https://www.laveulliure.ad/ca",
    };
    const articleUrl =
      "https://www.laveulliure.ad/ca/article/article-test";
    const htmlClient = new FakeHtmlClient({
      [source.url]: `
        <a href="/ca/article/article-test">Article test</a>
      `,
      [articleUrl]: `
        <div class="field--name-body">
          <ul class="social-network"><li>Réseaux sociaux</li></ul>
        </div>
        <div class="content__body">
          <div class="field--name-body">
            <p>Premier paragraphe éditorial suffisamment long pour être conservé.</p>
            <p>Second paragraphe éditorial utile pour vérifier toute l’extraction.</p>
          </div>
        </div>
      `,
    });
    const collector = new HtmlCollector(htmlClient);

    const observations = await collector.collect(source);

    expect(observations).toEqual([
      expect.objectContaining({
        title: "Article test",
        url: articleUrl,
        content:
          "Premier paragraphe éditorial suffisamment long pour être conservé.\n\nSecond paragraphe éditorial utile pour vérifier toute l’extraction.",
      }),
    ]);
  });

  it("collecte uniquement les articles d'actualité Altaveu", async () => {
    const source = {
      ...createSource(),
      name: "Altaveu",
      url: "https://www.altaveu.com",
    };
    const articleUrl =
      "https://www.altaveu.com/actualitat/societat/article-test_123_102.html";
    const htmlClient = new FakeHtmlClient({
      [source.url]: `
        <a href="/actualitat/societat">Rubrique société</a>
        <a href="/videos/video-test_123_110.html">Vidéo sans article</a>
        <a href="${articleUrl}">Article Altaveu</a>
        <a href="${articleUrl}#comments-anchor">Commentaires</a>
      `,
      [articleUrl]: `
        <div class="c-mainarticle__body">
          <p>Premier paragraphe complet de l'article publié par Altaveu.</p>
          <p>Second paragraphe qui confirme la bonne extraction du contenu.</p>
        </div>
      `,
    });
    const collector = new HtmlCollector(htmlClient);

    const observations = await collector.collect(source);

    expect(observations).toEqual([
      expect.objectContaining({
        title: "Article Altaveu",
        url: articleUrl,
        content:
          "Premier paragraphe complet de l'article publié par Altaveu.\n\nSecond paragraphe qui confirme la bonne extraction du contenu.",
      }),
    ]);
    expect(htmlClient.receivedUrls).toEqual([
      source.url,
      articleUrl,
    ]);
  });
});
