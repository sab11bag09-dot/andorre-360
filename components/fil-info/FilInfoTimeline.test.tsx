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
            publicationDate: new Date("2026-08-02T10:30:00.000Z"),
          },
          {
            id: 2,
            slug: "information-precedente",
            title: "Information précédente",
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
    expect(html).not.toContain("Mise à jour continue");
  });

  it("rend un état vide explicite", () => {
    const html = renderToStaticMarkup(<FilInfoTimeline entries={[]} />);

    expect(html).toContain(
      "Le fil se remplira avec les prochaines publications",
    );
    expect(html).toContain('aria-labelledby="fil-info-timeline-title"');
  });
});
