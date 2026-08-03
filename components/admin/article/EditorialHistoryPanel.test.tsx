import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import EditorialHistoryPanel from "./EditorialHistoryPanel";

describe("EditorialHistoryPanel", () => {
  it("rend les actions, l’acteur et les transitions", () => {
    const html = renderToStaticMarkup(
      <EditorialHistoryPanel
        events={[
          {
            id: 2,
            action: "TRANSLATION_STATUS_CHANGED",
            translationId: 12,
            actorEmail: "admin@example.com",
            fromStatus: "REVIEW",
            toStatus: "APPROVED",
            details: JSON.stringify({
              locale: "CA",
              operation: "status",
            }),
            createdAt: new Date("2026-08-03T14:30:00.000Z"),
          },
          {
            id: 1,
            action: "ARTICLE_CREATED",
            translationId: null,
            actorEmail: "redaction@example.com",
            fromStatus: null,
            toStatus: "DRAFT",
            details: JSON.stringify({ category: "POLITIQUE" }),
            createdAt: new Date("2026-08-03T13:00:00.000Z"),
          },
        ]}
      />,
    );

    expect(html).toContain("Historique éditorial");
    expect(html).toContain("2 actions récentes");
    expect(html).toContain("Statut de la traduction modifié");
    expect(html).toContain("Catalan");
    expect(html).toContain("En relecture");
    expect(html).toContain("Approuvé");
    expect(html).toContain("admin@example.com");
    expect(html).toContain('dateTime="2026-08-03T14:30:00.000Z"');
    expect(html.indexOf("Statut de la traduction modifié")).toBeLessThan(
      html.indexOf("Article créé"),
    );
  });

  it("ignore des détails historiques invalides sans casser la fiche", () => {
    const html = renderToStaticMarkup(
      <EditorialHistoryPanel
        events={[
          {
            id: 1,
            action: "ARTICLE_UPDATED",
            translationId: null,
            actorEmail: "admin@example.com",
            fromStatus: "PUBLISHED",
            toStatus: "PUBLISHED",
            details: "données anciennes invalides",
            createdAt: new Date("2026-08-03T14:30:00.000Z"),
          },
        ]}
      />,
    );

    expect(html).toContain("Article modifié");
    expect(html).not.toContain("données anciennes invalides");
  });

  it("affiche un état vide explicite", () => {
    const html = renderToStaticMarkup(
      <EditorialHistoryPanel events={[]} />,
    );

    expect(html).toContain("Aucune action enregistrée");
    expect(html).toContain(
      "Les prochaines actions éditoriales apparaîtront ici.",
    );
  });
});
