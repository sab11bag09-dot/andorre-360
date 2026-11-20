import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const homePageSource = readFileSync(
  new URL("./HomePageEditorial.tsx", import.meta.url),
  "utf8",
);

describe("cohérence entre la composition automatique et la Une", () => {
  it("transmet à la composition l’existence d’une composition automatique active", () => {
    expect(homePageSource).toContain("automationRunId:");
    expect(homePageSource).toContain("hasActiveAutomatedComposition: activeAutomatedPublicationCount > 0");
    expect(homePageSource).toContain("composeHomePage(editorialLayout, publishedArticles");
  });
});
