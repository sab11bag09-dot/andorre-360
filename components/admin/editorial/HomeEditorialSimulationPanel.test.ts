import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const panelSource = readFileSync(
  new URL("./HomeEditorialSimulationPanel.tsx", import.meta.url),
  "utf8",
);

const simulationPageSource = readFileSync(
  new URL("../../../app/admin/diffusion/simulation/page.tsx", import.meta.url),
  "utf8",
);

const diffusionPageSource = readFileSync(
  new URL("../../../app/admin/diffusion/page.tsx", import.meta.url),
  "utf8",
);

const simulationActionSource = readFileSync(
  new URL("../../../actions/home-editorial-simulation.ts", import.meta.url),
  "utf8",
);

const applicationActionSource = readFileSync(
  new URL("../../../actions/home-editorial-application.ts", import.meta.url),
  "utf8",
);

describe("interface de simulation éditoriale", () => {
  it("conserve une simulation consultative séparée", () => {
    expect(panelSource).toContain("await runHomeEditorialSimulation()");
    expect(panelSource).toContain("Lancer la simulation");
    expect(panelSource).toContain("Cette simulation reste une proposition");
  });

  it("transmet uniquement le jeton signé de la proposition examinée", () => {
    expect(panelSource).toContain("result.applicationToken");
    expect(panelSource).not.toContain(
      "applyCurrentHomeEditorialProposal(result.placements",
    );

    expect(applicationActionSource).toContain("readHomeEditorialProposalToken");
    expect(applicationActionSource).not.toContain("simulateAutomatedHome");
    expect(applicationActionSource).toContain(
      "composition: proposal.composition",
    );
    expect(applicationActionSource).toContain(
      "lockedPlacements: proposal.lockedPlacements",
    );
  });

  it("demande une confirmation explicite avant l’application", () => {
    expect(panelSource).toContain(
      "Appliquer exactement la proposition affichée ?",
    );
    expect(panelSource).toContain("Appliquer la proposition affichée");
  });

  it("respecte le garde-fou serveur d’application", () => {
    expect(simulationPageSource).toContain(
      "applicationEnabled={applicationDecision.allowed}",
    );
    expect(panelSource).toContain("applicationEnabled ?");
    expect(panelSource).toContain(
      "L’application réelle est désactivée par le garde-fou serveur.",
    );
  });

  it("permet d’annuler uniquement le dernier run appliqué", () => {
    expect(panelSource).toContain("setLastAppliedRunId(nextResult.runId)");
    expect(panelSource).toContain(
      "await rollbackHomeEditorialRun(lastAppliedRunId)",
    );
    expect(panelSource).toContain("Annuler ce run");
    expect(panelSource).toContain(
      "Restaurer la composition présente avant ce run ?",
    );
  });

  it("respecte le garde-fou serveur du retour arrière", () => {
    expect(simulationPageSource).toContain("rollbackEnabled={rollbackEnabled}");
    expect(panelSource).toContain("rollbackEnabled && lastAppliedRunId");
    expect(panelSource).toContain(
      "Le retour arrière est désactivé par le garde-fou serveur.",
    );
  });

  it("utilise le lien administratif fondé sur l’identifiant", () => {
    expect(panelSource).toContain(
      "href={`/admin/articles/${placement.articleId}`}",
    );
    expect(panelSource).not.toContain(
      "href={`/article/${placement.articleId}`}",
    );
  });

  it("distingue les sélections IA, humaines et de secours", () => {
    expect(simulationActionSource).toContain("origin: placement.origin");
    expect(panelSource).toContain('LOCKED: "Sélection humaine"');
    expect(panelSource).toContain('AUTOMATED: "Sélection IA"');
    expect(panelSource).toContain('FALLBACK: "Secours chronologique"');
    expect(panelSource).toContain("ORIGIN_LABELS[placement.origin]");
  });

  it("n’affiche pas de score IA pour une sélection humaine", () => {
    expect(panelSource).toContain('placement.origin !== "LOCKED"');
  });

  it("expose la sous-page depuis la diffusion", () => {
    expect(simulationPageSource).toContain("<HomeEditorialSimulationPanel");
    expect(diffusionPageSource).toContain('href="/admin/diffusion/simulation"');
    expect(diffusionPageSource).toContain("Simuler l’accueil");
  });
});
