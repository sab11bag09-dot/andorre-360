import { describe, expect, it } from "vitest";

import { buildEditorialStats } from "./buildEditorialStats";
import { makePublication } from "./testUtils";

describe("buildEditorialStats", () => {
  it("classe une publication en cours comme active", () => {
    const now = new Date("2026-07-29T10:00:00.000Z");

    const publication = makePublication({
      startsAt: new Date("2026-07-29T09:00:00.000Z"),
      endsAt: new Date("2026-07-29T11:00:00.000Z"),
    });

    const result = buildEditorialStats({
      publications: [publication],
      now,
    });

    expect(result.activePublications).toHaveLength(1);
    expect(result.scheduledPublications).toHaveLength(0);
  });

  it("classe une publication future comme programmée", () => {
    const now = new Date("2026-07-29T10:00:00.000Z");

    const publication = makePublication({
      startsAt: new Date("2026-07-29T11:00:00.000Z"),
      endsAt: null,
    });

    const result = buildEditorialStats({
      publications: [publication],
      now,
    });

    expect(result.activePublications).toHaveLength(0);
    expect(result.scheduledPublications).toHaveLength(1);
  });

  it("détecte un conflit lorsque deux publications actives occupent la même zone", () => {
    const now = new Date("2026-07-29T10:00:00.000Z");

    const publication = makePublication();

    const result = buildEditorialStats({
      publications: [
        publication,
        makePublication({
          id: "publication-2",
        }),
      ],
      now,
    });

    expect(result.conflicts).toBe(1);
  });
});