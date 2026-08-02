import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FilInfoTimeline from "./FilInfoTimeline";

describe("FilInfoTimeline", () => {
  it("rend les entrées dans leur ordre chronologique", () => {
    const html = renderToStaticMarkup(
      <FilInfoTimeline
        entries={[
          {
            id: 1,
            slug: "information-recente",
            title: "Information récente",
            description: "Description de l’article.",
            filInfoFormat: "ARTICLE",
            publicationDate: new Date("2026-08-02T10:30:00.000Z"),
          },
          {
            id: 2,
            slug: "information-precedente",
            title: "Information précédente",
            description: "Description de la brève.",
            filInfoFormat: "BRIEF",
            publicationDate: new Date("2026-08-02T09:15:00.000Z"),
          },
        ]}
      />,
    );

    expect(html.indexOf("Information récente")).toBeLessThan(
      html.indexOf("Information précédente"),
    );
    expect(html).toContain('href="/article/information-recente"');
    expect(html).toContain('dateTime="2026-08-02T10:30:00.000Z"');
    expect(html).toContain("Article · 01");
    expect(html).toContain("Brève · 02");
    expect(html).toContain("Description de la brève.");
    expect(html).not.toContain("Mise à jour continue");
  });

  it("met une alerte en évidence", () => {
    const html = renderToStaticMarkup(
      <FilInfoTimeline
        entries={[
          {
            id: 1,
            slug: "alerte-meteo",
            title: "Alerte météo",
            description: "",
            filInfoFormat: "ALERT",
            publicationDate: new Date("2026-08-02T11:00:00.000Z"),
          },
        ]}
      />,
    );

    expect(html).toContain("Alerte · 01");
    expect(html).toContain("bg-yellow-500 text-black");
  });

  it("rend un état vide explicite", () => {
    const html = renderToStaticMarkup(<FilInfoTimeline entries={[]} />);

    expect(html).toContain(
      "Le fil se remplira avec les prochaines publications",
    );
    expect(html).toContain('aria-labelledby="fil-info-timeline-title"');
  });

  it("regroupe les publications lorsque le jour change", () => {
    const html = renderToStaticMarkup(
      <FilInfoTimeline
        entries={[
          {
            id: 1,
            slug: "jour-2",
            title: "Jour deux",
            description: "",
            filInfoFormat: "ARTICLE",
            publicationDate: new Date("2026-08-02T10:00:00.000Z"),
          },
          {
            id: 2,
            slug: "jour-1",
            title: "Jour un",
            description: "",
            filInfoFormat: "ARTICLE",
            publicationDate: new Date("2026-08-01T10:00:00.000Z"),
          },
        ]}
      />,
    );

    expect(html).toContain("dimanche 2 août");
    expect(html).toContain("samedi 1 août");
    expect(html).toContain('aria-label="Publications chronologiques"');
  });
});
