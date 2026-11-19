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
    consecutiveEmptyCollections: 0,
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

  it("interprète les dates Altaveu au format jour/mois/année", async () => {
    const source = {
      ...createSource(),
      name: "Altaveu",
      url: "https://www.altaveu.com",
    };
    const articleUrl =
      "https://www.altaveu.com/actualitat/societat/article-date_123_102.html";
    const htmlClient = new FakeHtmlClient({
      [source.url]: `
        <a href="${articleUrl}">Article daté</a>
      `,
      [articleUrl]: `
        <time datetime="12/08/2026">12/08/2026</time>
        <div class="c-mainarticle__body">
          <p>Premier paragraphe complet de l'article publié par Altaveu.</p>
          <p>Second paragraphe qui confirme la bonne extraction du contenu.</p>
        </div>
      `,
    });
    const collector = new HtmlCollector(htmlClient);

    const observations = await collector.collect(source);

    expect(
      observations[0]?.publishedAt?.toISOString(),
    ).toBe("2026-08-12T00:00:00.000Z");
  });

  it("écarte une date de publication manifestement future", async () => {
    const source = createSource();
    const articleUrl = "https://example.com/article-futur";
    const htmlClient = new FakeHtmlClient({
      [source.url]: `
        <h2><a href="${articleUrl}">Article futur</a></h2>
      `,
      [articleUrl]: `
        <time datetime="2999-01-01T00:00:00.000Z">
          1 janvier 2999
        </time>
        <div class="article-content">
          <p>Contenu éditorial suffisamment long pour tester le rejet d'une date future.</p>
        </div>
      `,
    });
    const collector = new HtmlCollector(htmlClient);

    const observations = await collector.collect(source);

    expect(observations[0]?.publishedAt).toBeNull();
  });

  it("écarte les articles sans contenu de Diari d'Andorra", async () => {
    const source = {
      ...createSource(),
      name: "Diari d'Andorra",
      url: "https://www.diariandorra.ad",
    };
    const completeArticleUrl =
      "https://www.diariandorra.ad/nacional/260804/article-complet_123.html";
    const emptyArticleUrl =
      "https://www.diariandorra.ad/dmg/en-set-tuits/260804/article-vide_456.html";
    const htmlClient = new FakeHtmlClient(
      {
        [source.url]: `
          <h2><a href="${completeArticleUrl}">Article complet</a></h2>
          <h2><a href="${emptyArticleUrl}">Article vide</a></h2>
        `,
        [completeArticleUrl]: `
          <div class="c-detail__body">
            <p>Premier paragraphe complet publié par Diari d'Andorra.</p>
            <p>Second paragraphe qui rend le contenu réellement exploitable.</p>
          </div>
        `,
        [emptyArticleUrl]: `
          <div class="c-detail__body"></div>
        `,
      },
      1,
    );
    const collector = new HtmlCollector(htmlClient);

    const observations = await collector.collect(source);

    expect(observations).toEqual([
      expect.objectContaining({
        title: "Article complet",
        url: completeArticleUrl,
        content:
          "Premier paragraphe complet publié par Diari d'Andorra.\n\nSecond paragraphe qui rend le contenu réellement exploitable.",
      }),
    ]);
    expect(htmlClient.maxActiveRequests).toBe(2);
  });

  it("limite et parallélise les articles d'El Periòdic", async () => {
    const source = {
      ...createSource(),
      name: "El Periòdic d'Andorra",
      url: "https://elperiodic.ad",
    };
    const articleLinks = Array.from(
      { length: 30 },
      (_, index) => `
        <div class="e-loop-item">
          <h2 class="elementor-heading-title">
            <a href="/societat/article-${index}/">Article ${index}</a>
          </h2>
        </div>
      `,
    ).join("");
    const articleResponses = Object.fromEntries(
      Array.from({ length: 30 }, (_, index) => [
        `https://elperiodic.ad/societat/article-${index}/`,
        `<div class="elementor-widget-theme-post-content"><p>Contingut complet de l'article número ${index} publicat per El Periòdic d'Andorra.</p></div>`,
      ]),
    );
    const htmlClient = new FakeHtmlClient(
      {
        [source.url]: `
          <div class="e-loop-item">
            <h2 class="elementor-heading-title">
              <a href="/societat/">Rubrique société</a>
            </h2>
          </div>
          ${articleLinks}
        `,
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
    expect(htmlClient.receivedUrls).not.toContain(
      "https://elperiodic.ad/societat/",
    );
    expect(htmlClient.maxActiveRequests).toBe(4);
  });

  it("extrait les articles Encamp redirigés vers le domaine www", async () => {
    const source = {
      ...createSource(),
      name: "Encamp",
      url: "https://comuencamp.ad/actualitat/noticies",
    };
    const articleUrl =
      "https://www.comuencamp.ad/actualitat/noticies/article-test";
    const htmlClient = new FakeHtmlClient({
      [source.url]: `
        <h2 class="newsItem2__title">
          <a class="newsItem2__link" href="${articleUrl}">Article Encamp</a>
        </h2>
      `,
      [articleUrl]: `
        <div id="content-core">
          <div class="documentDescription">Résumé à ne pas dupliquer.</div>
          <div id="parent-fieldname-text">
            <p>Premier paragraphe complet publié par le Comú d'Encamp.</p>
            <p>Second paragraphe qui confirme l'extraction du corps éditorial.</p>
          </div>
        </div>
      `,
    });
    const collector = new HtmlCollector(htmlClient);

    const observations = await collector.collect(source);

    expect(observations).toEqual([
      expect.objectContaining({
        title: "Article Encamp",
        url: articleUrl,
        content:
          "Premier paragraphe complet publié par le Comú d'Encamp.\n\nSecond paragraphe qui confirme l'extraction du corps éditorial.",
      }),
    ]);
  });

  it("extrait le corps complet des actualités d'Andorra la Vella", async () => {
    const source = {
      ...createSource(),
      name: "Mairie d’Andorre",
      url: "https://www.andorralavella.ad/comu/inici",
    };
    const articleUrl =
      "https://www.andorralavella.ad/comu/?q=noticia/article-test";
    const htmlClient = new FakeHtmlClient({
      [source.url]: `
        <h2>
          <a href="/comu/?q=noticia/article-test">Actualité communale</a>
        </h2>
        <h2>
          <a href="/comu/?q=agenda/evenement-test">Événement</a>
        </h2>
      `,
      [articleUrl]: `
        <div class="post-content">Résumé trop court.</div>
        <div class="field field-name-body">
          <div class="field-item">
            <p>Premier paragraphe complet publié par le Comú d'Andorra la Vella.</p>
            <p>Second paragraphe qui garantit une observation éditoriale exploitable.</p>
          </div>
        </div>
      `,
    });
    const collector = new HtmlCollector(htmlClient);

    const observations = await collector.collect(source);

    expect(observations).toEqual([
      expect.objectContaining({
        title: "Actualité communale",
        url: articleUrl,
        content:
          "Premier paragraphe complet publié par le Comú d'Andorra la Vella.\n\nSecond paragraphe qui garantit une observation éditoriale exploitable.",
      }),
    ]);
    expect(htmlClient.receivedUrls).toEqual([
      source.url,
      articleUrl,
    ]);
  });

  it("collecte uniquement les communiqués du Govern d'Andorra", async () => {
    const source = {
      ...createSource(),
      name: "Gouvernement d'Andorre",
      url: "https://www.govern.ad/ca/inici",
    };
    const articleUrl =
      "https://www.govern.ad/ca/w/comunicat-de-prova";
    const htmlClient = new FakeHtmlClient({
      [source.url]: `
        <div class="journal-content-article">
          <h3><a href="/ca/w/comunicat-de-prova">Communiqué officiel</a></h3>
        </div>
        <div class="journal-content-article">
          <h3><a href="/ca/tematiques/habitatge">Thématique habitatge</a></h3>
        </div>
        <div class="journal-content-article">
          <h3><a href="https://www.agenda.ad/">Agenda externe</a></h3>
        </div>
      `,
      [articleUrl]: `
        <div class="component-html">
          <p>Premier paragraphe complet du communiqué officiel du Govern d'Andorra.</p>
          <p>Second paragraphe qui confirme que le contenu est exploitable.</p>
        </div>
      `,
    });
    const collector = new HtmlCollector(htmlClient);

    const observations = await collector.collect(source);

    expect(observations).toEqual([
      expect.objectContaining({
        title: "Communiqué officiel",
        url: articleUrl,
        content:
          "Premier paragraphe complet du communiqué officiel du Govern d'Andorra.\n\nSecond paragraphe qui confirme que le contenu est exploitable.",
      }),
    ]);
    expect(htmlClient.receivedUrls).toEqual([
      source.url,
      articleUrl,
    ]);
  });

  it("collecte les actualités de la Police d'Andorre depuis la page de listing", async () => {
    const source = {
      ...createSource(),
      name: "Policia d'Andorra",
      url: "https://www.policia.ad/ca/noticies/",
    };
    const articleUrl =
      "https://www.policia.ad/ca/noticies/noticies/2026/08/04/8312/balanc-d-accidents-de-circulacio-accident-amb-una-persona-ferida-a-andorra-la-vella/";
    const htmlClient = new FakeHtmlClient({
      [source.url]: `
        <a href="/ca/noticies/categoria/noticies/">Toutes les actualités</a>
        <a href="/ca/noticies/">Accueil</a>
        <a href="/ca/noticies/noticies/2026/08/04/8312/balanc-d-accidents-de-circulacio-accident-amb-una-persona-ferida-a-andorra-la-vella/">Balanç d’accidents</a>
      `,
      [articleUrl]: `
        <div class="post_body font-20 m-t-20">
          <p>Premier paragraphe complet publié par la Police d’Andorre.</p>
          <p>Second paragraphe qui confirme l’extraction du corps éditorial.</p>
        </div>
      `,
    });
    const collector = new HtmlCollector(htmlClient);

    const observations = await collector.collect(source);

    expect(observations).toEqual([
      expect.objectContaining({
        title: "Balanç d’accidents",
        url: articleUrl,
        content:
          "Premier paragraphe complet publié par la Police d’Andorre.\n\nSecond paragraphe qui confirme l’extraction du corps éditorial.",
      }),
    ]);
    expect(htmlClient.receivedUrls).toEqual([
      source.url,
      articleUrl,
    ]);
  });

  it("collecte les actualités de la Cambra de Comerç", async () => {
    const source = {
      ...createSource(),
      name: "Cambra de Comerç",
      url: "https://www.ccis.ad/category/noticies/",
    };
    const articleUrl =
      "https://www.ccis.ad/resultats-de-lenquesta-de-clima-empresarial/";
    const htmlClient = new FakeHtmlClient({
      [source.url]: `
        <h3 class="entry-title"><a href="${articleUrl}"><span class="light">Resultats de l’Enquesta de Clima Empresarial</span></a></h3>
        <a href="https://www.ccis.ad/category/noticies/page/2/">Pàgina següent</a>
      `,
      [articleUrl]: `
        <div class="entry-content post-content">
          <p>Primer paràgraf de l’actualitat econòmica de la Cambra.</p>
          <p>Segon paràgraf amb informació útil per a les empreses.</p>
        </div>
      `,
    });
    const collector = new HtmlCollector(htmlClient);

    const observations = await collector.collect(source);

    expect(observations).toEqual([
      expect.objectContaining({
        title: "Resultats de l’Enquesta de Clima Empresarial",
        url: articleUrl,
        content:
          "Primer paràgraf de l’actualitat econòmica de la Cambra.\n\nSegon paràgraf amb informació útil per a les empreses.",
      }),
    ]);
  });

  it("extrait le vrai titre des articles Canillo depuis leur conteneur", async () => {
    const source = {
      ...createSource(),
      name: "Canillo",
      url: "https://www.canillo.ad/noticies",
    };
    const articleUrl = "https://www.canillo.ad/noticia/prova";
    const htmlClient = new FakeHtmlClient({
      [source.url]: `
        <div class="item-noticia">
          <h2>Actualitat de Canillo</h2>
          <a class="btn-fletxa stretched-link" href="/noticia/prova">Continuer à lire</a>
        </div>
      `,
      [articleUrl]: `
        <div class="field--name-field-content">
          <div class="field__item">
            <p>Contingut complet de la notícia de Canillo.</p>
          </div>
        </div>
      `,
    });
    const observations = await new HtmlCollector(htmlClient).collect(source);
    expect(observations).toEqual([
      expect.objectContaining({
        title: "Actualitat de Canillo",
        url: articleUrl,
      }),
    ]);
  });
});

describe("HtmlCollector — dates de publication standard", () => {
  const BODY = `
    <div class="article-content">
      <p>Contenu éditorial suffisamment long pour vérifier la lecture de la date de publication.</p>
    </div>
  `;

  async function collectDate(articleHtml: string, articleUrl = "https://example.com/article") {
    const source = createSource();
    const htmlClient = new FakeHtmlClient({
      [source.url]: `<h2><a href="${articleUrl}">Article de test</a></h2>`,
      [articleUrl]: articleHtml,
    });
    const observations = await new HtmlCollector(htmlClient).collect(source);
    return observations[0]?.publishedAt?.toISOString() ?? null;
  }

  it("lit la balise article:published_time", async () => {
    await expect(
      collectDate(`
        <head><meta property="article:published_time" content="2026-11-17T21:27:47+01:00"></head>
        ${BODY}
      `),
    ).resolves.toBe("2026-11-17T20:27:47.000Z");
  });

  it("lit datePublished dans le JSON-LD, y compris dans un @graph", async () => {
    await expect(
      collectDate(`
        <script type="application/ld+json">
          {"@context":"https://schema.org","@graph":[
            {"@type":"WebPage","dateModified":"2026-11-18T10:00:00+00:00"},
            {"@type":"NewsArticle","datePublished":"2026-11-15T21:21:27+02:00"}
          ]}
        </script>
        ${BODY}
      `),
    ).resolves.toBe("2026-11-15T19:21:27.000Z");
  });

  it("préfère la date déclarée de l’article à une balise time de la page", async () => {
    await expect(
      collectDate(`
        <header><time datetime="2026-11-18T08:00:00Z">Aujourd’hui</time></header>
        <meta property="article:published_time" content="2026-11-10T09:00:00Z">
        ${BODY}
      `),
    ).resolves.toBe("2026-11-10T09:00:00.000Z");
  });

  it("n’utilise jamais une date de modification comme date de publication", async () => {
    await expect(
      collectDate(`
        <meta property="article:modified_time" content="2026-11-17T10:00:00Z">
        <meta property="og:updated_time" content="2026-11-17T10:00:00Z">
        <script type="application/ld+json">{"@type":"Article","dateModified":"2026-11-17T10:00:00Z"}</script>
        ${BODY}
      `),
    ).resolves.toBeNull();
  });

  it("comprend une date catalane écrite en toutes lettres", async () => {
    await expect(
      collectDate(`
        <script type="application/ld+json">{"@type":"NewsArticle","datePublished":"16 de novembre 2026"}</script>
        ${BODY}
      `),
    ).resolves.toBe("2026-11-16T00:00:00.000Z");
  });

  it("lit une date année/mois/jour présente dans l’adresse de l’article", async () => {
    await expect(
      collectDate(BODY, "https://example.com/noticies/2026/11/09/8394/la-policia"),
    ).resolves.toBe("2026-11-09T00:00:00.000Z");
  });

  it("ignore une date de métadonnées future et se rabat sur le signal suivant", async () => {
    await expect(
      collectDate(`
        <meta property="article:published_time" content="2999-01-01T00:00:00Z">
        <time datetime="2026-11-12T08:00:00Z">12 novembre</time>
        ${BODY}
      `),
    ).resolves.toBe("2026-11-12T08:00:00.000Z");
  });

  it("retrouve datePublished dans un JSON-LD mal formé", async () => {
    await expect(
      collectDate(`
        <script type="application/ld+json">
          {"@type":"NewsArticle","datePublished":"2026-11-16T07:00:00.0000000+00:00","dateModified":"2026-11-17T08:00:00Z"} }
        </script>
        ${BODY}
      `),
    ).resolves.toBe("2026-11-16T07:00:00.000Z");
  });

  it("ne transforme pas un JSON-LD invalide en erreur de collecte", async () => {
    await expect(
      collectDate(`
        <script type="application/ld+json">{ ceci n'est pas du JSON</script>
        ${BODY}
      `),
    ).resolves.toBeNull();
  });
});

describe("HtmlCollector — dates propres à certains sites", () => {
  const BODY = `
    <div class="article-content">
      <p>Contenu éditorial suffisamment long pour vérifier la lecture de la date de publication propre au site.</p>
    </div>
  `;

  async function collectSiteDate(sourceUrl: string, articleUrl: string, articleHtml: string) {
    const source = { ...createSource(), url: sourceUrl };
    const htmlClient = new FakeHtmlClient({
      [source.url]: `<h2><a href="${new URL(articleUrl).pathname}">Article de test</a></h2>`,
      [articleUrl]: articleHtml,
    });
    const collector = new HtmlCollector(htmlClient);
    const observations = await collector.collect(source);
    return observations.find((observation) => observation.url === articleUrl)?.publishedAt?.toISOString() ?? null;
  }

  it("lit la date RTVA au format jour.mois.année sur deux chiffres", async () => {
    await expect(
      collectSiteDate(
        "https://www.rtva.ad",
        "https://www.rtva.ad/noticies/politica/andorra-estudia-donar-suport",
        `<p class="ContentArticle_date__tJl00">19.11.26</p>
         <div class="ContentArticle_infoBody__pp8zZ"><p>${"Text de la notícia de RTVA. ".repeat(4)}</p></div>
         <div class="ContentCard_date__Ds9dC">08.10.26</div>`,
      ),
    ).resolves.toBe("2026-11-19T00:00:00.000Z");
  });

  it("lit la date d’Escaldes-Engordany à côté de l’icône calendrier", async () => {
    await expect(
      collectSiteDate(
        "https://e-e.ad/categoria/66/noticies/",
        "https://e-e.ad/publicacio/7538/el-carrer-josep-viladomat",
        `<div class="post__meta-item post__meta-item--category">
           <span class="post__terms post__terms--category"><i class="fa fa-calendar" aria-hidden="true"></i> 2026-10-20</span>
         </div>
         <div class="post__content"><p>${"Text de la notícia d’Escaldes. ".repeat(4)}</p></div>`,
      ),
    ).resolves.toBe("2026-10-20T00:00:00.000Z");
  });

  it("lit la date « Publicat » d’AR+I, même si ce bloc est retiré du contenu", async () => {
    await expect(
      collectSiteDate(
        "https://ari.ad/noticies",
        "https://ari.ad/noticies/del-microscopi-als-prismatics",
        `<div class="post-meta"><span class="post-meta-date"><i class="icon-calendar"></i> Publicat: 18/11/2026</span></div>
         <div class="single-post"><div class="textllarg pt-4"><p>${"Text de la notícia d’AR+I. ".repeat(4)}</p></div></div>`,
      ),
    ).resolves.toBe("2026-11-18T00:00:00.000Z");
  });

  it("lit la date affichée sous le titre d’un communiqué de l’AFA", async () => {
    await expect(
      collectSiteDate(
        "https://www.afa.ad/ca/sala-premsa/comunicats-de-premsa",
        "https://www.afa.ad/ca/sala-premsa/comunicats-de-premsa/memoria-2025/view",
        `<p class="text-gray-light"><span class="icon-history" aria-hidden="true"></span> <span>01/09/2026</span></p>
         <div id="content-core"><p>${"Text del comunicat de l’AFA. ".repeat(4)}</p></div>`,
      ),
    ).resolves.toBe("2026-09-01T00:00:00.000Z");
  });

  it("lit la date de Sant Julià de Lòria sur la page de liste", async () => {
    const source = { ...createSource(), url: "https://comusantjulia.ad/ca/actualitat/noticies/" };
    const articleUrl = "https://comusantjulia.ad/ca/actualitat/noticies/consell-d-infants/";
    const htmlClient = new FakeHtmlClient({
      [source.url]: `
        <ul class="posts-list"><li>
          <div class="post-info">
            <a href="/ca/actualitat/noticies/consell-d-infants/">Sant Julià constitueix el 19è Consell d’Infants</a>
            <div class="post-meta clearfix"> 16.11.2026 </div>
          </div>
        </li></ul>`,
      [articleUrl]: `<div class="post-content"><p>${"Text de la notícia de Sant Julià. ".repeat(4)}</p></div>`,
    });

    const observations = await new HtmlCollector(htmlClient).collect(source);

    expect(observations[0]?.publishedAt?.toISOString()).toBe("2026-11-16T00:00:00.000Z");
  });

  it("n’interprète pas un nombre à points quelconque comme une date sur un autre site", async () => {
    await expect(
      collectSiteDate(
        "https://example.com",
        "https://example.com/article",
        `<p class="version">19.11.26</p>${BODY}`,
      ),
    ).resolves.toBeNull();
  });
});
