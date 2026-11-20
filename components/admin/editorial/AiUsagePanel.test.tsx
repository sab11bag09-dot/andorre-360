import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { summarizeAiUsage } from "@/lib/ai/summarizeAiUsage";

import AiUsagePanel from "./AiUsagePanel";

const NOW = new Date("2026-11-20T17:00:00.000Z");
const fr = (value: number) => value.toLocaleString("fr-FR");

describe("AiUsagePanel", () => {
  it("affiche la consommation face au plafond et le détail par type d’appel", () => {
    const html = renderToStaticMarkup(
      <AiUsagePanel
        summary={summarizeAiUsage(
          [{ createdAt: new Date("2026-11-20T10:00:00.000Z"), operation: "article_from_facts", totalTokens: 50_000 }],
          { now: NOW, limit: 200_000 },
        )}
      />,
    );

    expect(html).toContain("Consommation OpenAI");
    expect(html).toContain(`${fr(50_000)} jetons`);
    expect(html).toContain(`sur ${fr(200_000)}`);
    expect(html).toContain("25 %");
    expect(html).toContain("Rédaction");
    expect(html).toContain("vendredi 20 novembre");
    expect(html).not.toContain("Plafond atteint");
  });

  it("signale le plafond atteint", () => {
    const html = renderToStaticMarkup(
      <AiUsagePanel
        summary={summarizeAiUsage(
          [{ createdAt: new Date("2026-11-20T10:00:00.000Z"), operation: "article_from_facts", totalTokens: 300_000 }],
          { now: NOW, limit: 200_000 },
        )}
      />,
    );

    expect(html).toContain("Plafond atteint");
  });

  it("indique qu’aucun appel n’a eu lieu", () => {
    const html = renderToStaticMarkup(<AiUsagePanel summary={summarizeAiUsage([], { now: NOW, limit: 200_000 })} />);

    expect(html).toContain("Aucun appel à OpenAI sur les dernières 24 heures.");
  });
});
