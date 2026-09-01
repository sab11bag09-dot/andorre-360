import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

const timelineSource = readFileSync(
  new URL("../../../components/fil-info/FilInfoTimeline.tsx", import.meta.url),
  "utf8",
);

const paginationSource = readFileSync(
  new URL(
    "../../../components/fil-info/FilInfoPagination.tsx",
    import.meta.url,
  ),
  "utf8",
);

const partitionSource = readFileSync(
  new URL("../../../lib/fil-info.ts", import.meta.url),
  "utf8",
);

describe("mise en page Fil info", () => {
  it("conserve la page française et ses traductions", () => {
    expect(pageSource).toContain(
      'getTranslatedFilInfoArticles("ca", { limit: 1 })',
    );
    expect(pageSource).toContain(
      'getTranslatedFilInfoArticles("es", { limit: 1 })',
    );
    expect(pageSource).toContain('canonical: "/fil-info"');
    expect(pageSource).toContain('languages.ca = "/ca/fil-info"');
    expect(pageSource).toContain('languages.es = "/es/fil-info"');
  });

  it("conserve la requête et la pagination initiale", () => {
    expect(pageSource).toContain('getFilInfoArticles("ACTUALITÉ"');
    expect(pageSource).toContain("limit: FIL_INFO_QUERY_LIMIT + 1");
    expect(pageSource).toContain(
      "const hasMore = items.length > FIL_INFO_QUERY_LIMIT",
    );
    expect(pageSource).toContain(
      "const visibleItems = items.slice(0, FIL_INFO_QUERY_LIMIT)",
    );
    expect(pageSource).toContain("<FilInfoPagination");
    expect(pageSource).toContain("initialHasMore={hasMore}");
  });

  it("conserve les différentes zones éditoriales", () => {
    expect(pageSource).toContain("partitionFilInfoArticles(visibleItems)");
    expect(pageSource).toContain("pinned,");
    expect(pageSource).toContain("featured,");
    expect(pageSource).toContain("briefs,");
    expect(pageSource).toContain("cards,");
    expect(pageSource).toContain("illustratedBriefs,");
    expect(pageSource).toContain("newsFeed,");
  });

  it("conserve l’information épinglée", () => {
    expect(pageSource).toContain('aria-labelledby="fil-info-pinned-title"');
    expect(pageSource).toContain("Information épinglée");
    expect(pageSource).toContain(
      'normalizeFilInfoFormat(pinned.filInfoFormat) === "BRIEF"',
    );
    expect(pageSource).toContain('timeZone: "Europe/Andorra"');
  });

  it("conserve le Fil Info et La sélection côte à côte", () => {
    expect(pageSource).toContain(
      "<FilInfoTimeline entries={newsFeedEntries} />",
    );
    expect(pageSource).toContain(
      "lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]",
    );
    expect(pageSource).toContain('id="fil-info-selection-title"');
    expect(pageSource).toContain("La sélection");
    expect(pageSource).toContain(
      'className="mt-2 h-[4.5rem] max-h-[4.5rem] overflow-hidden font-serif text-2xl leading-9',
    );
    expect(pageSource).toContain(
      'className="mt-3 h-12 max-h-12 overflow-hidden text-sm leading-6 text-gray-400"',
    );
  });

  it("conserve les six autres publications", () => {
    expect(pageSource).toContain('id="fil-info-briefs-title"');
    expect(pageSource).toContain("Autres publications");
    expect(pageSource).toContain(
      'className="grid border-b border-gray-800 md:grid-cols-3"',
    );
    expect(pageSource).toContain(
      'className="mt-5 h-24 max-h-24 overflow-hidden font-serif text-xl leading-6',
    );
  });

  it("conserve À suivre et À retenir", () => {
    expect(pageSource).toContain('id="fil-info-follow-title"');
    expect(pageSource).toContain("À suivre");
    expect(pageSource).toContain('id="fil-info-remember-title"');
    expect(pageSource).toContain("À retenir");
    expect(pageSource).toContain("illustratedBriefs.slice(0, 7)");
    expect(pageSource).toContain("lg:grid-cols-6");
    expect(pageSource).toContain("lg:col-span-4");
    expect(pageSource).toContain("lg:col-span-2");
  });

  it("conserve les limites des cartes À suivre", () => {
    expect(pageSource).toContain(
      'className="h-[5.25rem] max-h-[5.25rem] overflow-hidden font-serif text-2xl leading-7',
    );
    expect(pageSource).toContain(
      'className="mt-3 h-24 max-h-24 overflow-hidden text-sm leading-6 text-gray-400"',
    );
  });

  it("conserve la chronologie multilingue", () => {
    expect(timelineSource).toContain(
      'const localeNames = { fr: "fr-FR", ca: "ca-ES", es: "es-ES" }',
    );
    expect(timelineSource).toContain('timeZone: "Europe/Andorra"');
    expect(timelineSource).toContain('const isAlert = format === "ALERT"');
    expect(timelineSource).toContain('const isBrief = format === "BRIEF"');
    expect(timelineSource).toContain(
      "getDateKey(previousEntry.publicationDate)",
    );
    expect(timelineSource).toContain(
      "getFilInfoArticlePath(locale, entry.slug)",
    );
  });

  it("conserve le rafraîchissement et le chargement des archives", () => {
    expect(paginationSource).toContain("FIL_INFO_REFRESH_INTERVAL_MS");
    expect(paginationSource).toContain("window.setInterval");
    expect(paginationSource).toContain("/api/fil-info/updates?after=");
    expect(paginationSource).toContain("/api/fil-info?cursor=");
    expect(paginationSource).toContain("router.refresh()");
    expect(paginationSource).toContain(
      "setEntries((current) => [...current, ...result.entries])",
    );
    expect(paginationSource).toContain("Afficher plus");
  });

  it("conserve les volumes et la fréquence officiels", () => {
    expect(partitionSource).toContain(
      "export const FIL_INFO_NEWS_FEED_SIZE = 8",
    );
    expect(partitionSource).toContain("export const FIL_INFO_BRIEFS_SIZE = 6");
    expect(partitionSource).toContain("export const FIL_INFO_CARDS_SIZE = 4");
    expect(partitionSource).toContain(
      "export const FIL_INFO_ILLUSTRATED_BRIEFS_SIZE = 7",
    );
    expect(partitionSource).toContain("export const FIL_INFO_PAGE_SIZE = 26");
    expect(partitionSource).toContain(
      "export const FIL_INFO_REFRESH_INTERVAL_MS = 45_000",
    );
  });
});
