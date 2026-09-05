import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const homePageSource = readFileSync(
  new URL("./HomePageEditorial.tsx", import.meta.url),
  "utf8",
);

describe("cohérence entre la composition automatique et la Une", () => {
  it("laisse le Grand format vide sans placement éditorial explicite", () => {
    expect(homePageSource).toContain("const hasActiveAutomatedComposition =");
    expect(homePageSource).toContain("!hasActiveAutomatedComposition");
    expect(homePageSource).toContain("activeAutomatedPublicationCount > 0");
    expect(homePageSource).toContain("automationRunId:");
  });
});
