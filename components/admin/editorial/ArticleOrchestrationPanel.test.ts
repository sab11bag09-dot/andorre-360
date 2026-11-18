import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";

vi.mock("@/actions/article-orchestration", () => ({
  launchArticleOrchestration: vi.fn(),
  previewArticleOrchestration: vi.fn(),
}));

import { isWebUrl } from "./ArticleOrchestrationPanel";

const panelSource = readFileSync(
  new URL("./ArticleOrchestrationPanel.tsx", import.meta.url),
  "utf8",
);
const diffusionPageSource = readFileSync(
  new URL("../../../app/admin/diffusion/page.tsx", import.meta.url),
  "utf8",
);

describe("panneau de l’orchestrateur d’articles", () => {
  it("separates the free preview from the paid launch", () => {
    expect(panelSource).toContain("await previewArticleOrchestration()");
    expect(panelSource).toContain("Aperçu sans coût");
    expect(panelSource).toContain("n’appelle pas OpenAI et ne modifie rien");
  });

  it("asks for an explicit confirmation mentioning the OpenAI cost", () => {
    expect(panelSource).toContain("window.confirm(");
    expect(panelSource).toContain("consomme des crédits OpenAI");
    expect(panelSource.indexOf("if (!confirmed) return;")).toBeLessThan(
      panelSource.indexOf("await launchArticleOrchestration(ids)"),
    );
  });

  it("sends only the reviewed observation identifiers", () => {
    expect(panelSource).toContain(
      "preview.selected.map(({ observationId }) => observationId)",
    );
    expect(panelSource).toContain("await launchArticleOrchestration(ids)");
  });

  it("hides the launch button while a server guard is closed", () => {
    expect(panelSource).toContain("preview.blockedReasons.length > 0 ?");
    expect(panelSource).toContain("Le lancement est fermé par les garde-fous serveur");
  });

  it("is reachable from the diffusion page", () => {
    expect(diffusionPageSource).toContain('href="/admin/diffusion/orchestrateur"');
  });

  it("only links to web addresses", () => {
    expect(isWebUrl("https://www.govern.ad/a")).toBe(true);
    expect(isWebUrl("http://www.govern.ad/a")).toBe(true);
    expect(isWebUrl("javascript:alert(1)")).toBe(false);
    expect(isWebUrl("")).toBe(false);
  });
});
