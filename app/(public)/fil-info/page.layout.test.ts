import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { unreservedLineClamps } from "../../../components/testing/reservedLines";

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
    expect(pageSource).toContain("const hasMore = rest.length > 0");
    expect(pageSource).toContain("<FilInfoPagination");
    expect(pageSource).toContain("initialHasMore={hasMore}");
    // La suite reprend après la dernière ligne du fil.
    expect(pageSource).toContain("createFilInfoCursor(lastFeedItem)");
  });

  it("ne garde que le fil et La sélection", () => {
    expect(pageSource).toContain("partitionFilInfoArticles(items)");
    for (const removed of ["Autres publications", "À suivre", "À retenir", "illustratedBriefs"]) {
      expect(pageSource).not.toContain(removed);
    }
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
      "<FilInfoTimeline entries={newsFeedEntries} fixedRows={8} />",
    );
    expect(pageSource).toContain(
      "lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]",
    );
    expect(pageSource).toContain('id="fil-info-selection-title"');
    expect(pageSource).toContain("La sélection");
    expect(pageSource).toContain(
      'className="mt-3 line-clamp-3 min-h-[3lh] font-serif text-xl leading-7',
    );
    expect(pageSource).toContain(
      'className="mt-2 line-clamp-2 min-h-[2lh] text-sm leading-6 text-gray-400"',
    );
  });

  it("garde des photos de La sélection au même format, sans étirement", () => {
    expect(pageSource).toContain('className="relative aspect-[16/10] shrink-0 overflow-hidden');
  });

  it("conserve la chronologie multilingue", () => {
    expect(timelineSource).toContain(
      'const localeNames = { fr: "fr-FR", ca: "ca-ES", es: "es-ES" }',
    );
    expect(timelineSource).toContain('timeZone: "Europe/Andorra"');
    expect(timelineSource).toContain('const isAlert = format === "ALERT"');
    expect(timelineSource).toContain("formatFilInfoDay(entry.publicationDate, locale)");
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
    expect(partitionSource).toContain("export const FIL_INFO_NEWS_FEED_SIZE = 8");
    expect(partitionSource).toContain("export const FIL_INFO_SELECTION_SIZE = 4");
    expect(partitionSource).toContain("export const FIL_INFO_PAGE_SIZE = 20");
    expect(partitionSource).toContain(
      "export const FIL_INFO_REFRESH_INTERVAL_MS = 45_000",
    );
  });
});

describe("Fil info : mise en page indépendante des textes", () => {
  it.each([
    ["la page", pageSource],
    ["le fil chronologique", timelineSource],
  ])("%s réserve les lignes de chaque titre et de chaque chapô", (_, source) => {
    expect(unreservedLineClamps(source)).toEqual([]);
  });

  it("ne coupe plus les titres par une hauteur fixe", () => {
    expect(pageSource).not.toMatch(/max-h-/);
  });

  it("limite chaque titre et chaque chapô en nombre de lignes", () => {
    for (const source of [pageSource, timelineSource]) {
      for (const [, , quoted, template] of source.matchAll(/<(h[2-4]|p)\b[^>]*?className=(?:"([^"]*)"|\{`([^`]*)`\})[^>]*>\s*\{(?:pinned|article|entry)\.(?:title|description)\}/g)) {
        expect(quoted ?? template).toMatch(/line-clamp-\d/);
      }
    }
  });
});

describe("Fil info : rangée figée et colonnes alignées en bas", () => {
  it("fige la hauteur de la rangée sur grand écran", () => {
    expect(pageSource.match(/xl:h-\[var\(--fil-info-row-height\)\]/g)).toHaveLength(1);
    expect(pageSource).toContain("FIL_INFO_XL_ROW_HEIGHT}px");
    expect(partitionSource).toContain("export const FIL_INFO_XL_ROW_HEIGHT = 1810");
  });

  it("partage La sélection en quatre cartes de même hauteur, quel que soit leur nombre", () => {
    expect(pageSource).toContain("lg:grid-cols-1 xl:min-h-0 xl:grid-rows-4");
  });

  it("garde la colonne La sélection même sans article", () => {
    expect(pageSource).not.toContain("selection.length > 0 &&");
  });
});
