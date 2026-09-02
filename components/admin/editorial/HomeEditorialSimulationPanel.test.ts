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

const actionSource = readFileSync(
  new URL("../../../actions/home-editorial-simulation.ts", import.meta.url),
  "utf8",
);

describe("interface de simulation éditoriale", () => {
  it("lance uniquement l’action de simulation", () => {
    expect(panelSource).toContain("import {\n  runHomeEditorialSimulation,");
    expect(panelSource).toContain("await runHomeEditorialSimulation()");
    expect(panelSource).toContain("Lancer la simulation");
  });

  it("ne propose aucune application de la composition", () => {
    expect(panelSource).not.toContain("Appliquer la proposition");
    expect(panelSource).not.toContain("applyHome");
    expect(panelSource).not.toContain("replacePublication");
    expect(actionSource).not.toContain('from "@/lib/prisma"');
  });

  it("rappelle explicitement que le résultat est consultatif", () => {
    expect(panelSource).toContain("Mode consultatif");
    expect(panelSource).toContain("Proposition uniquement");
    expect(panelSource).toContain("aucun placement n’a été");
  });

  it("utilise le lien administratif fondé sur l’identifiant", () => {
    expect(panelSource).toContain(
      "href={`/admin/articles/${placement.articleId}`}",
    );
    expect(panelSource).not.toContain(
      "href={`/article/${placement.articleId}`}",
    );
  });

  it("expose une sous-page dédiée depuis la diffusion", () => {
    expect(simulationPageSource).toContain("<HomeEditorialSimulationPanel />");
    expect(diffusionPageSource).toContain('href="/admin/diffusion/simulation"');
    expect(diffusionPageSource).toContain("Simuler l’accueil");
  });
});
