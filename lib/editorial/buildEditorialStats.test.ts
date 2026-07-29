import { describe, expect, it } from "vitest";
it("classe une publication future comme programmée", () => {
  const now = new Date("2026-07-29T10:00:00.000Z");

  const publication = {
    active: true,
    startsAt: new Date("2026-07-29T11:00:00.000Z"),
    endsAt: null,
    channel: "site",
    pageKey: "home",
    zone: "hero",
  };

  const result = buildEditorialStats({
    publications: [publication] as never,
    now,
  });

  expect(result.activePublications).toHaveLength(0);
  expect(result.scheduledPublications).toHaveLength(1);
});

it("détecte un conflit lorsque deux publications actives occupent la même zone", () => {
  const now = new Date("2026-07-29T10:00:00.000Z");

  const publication = {
    active: true,
    startsAt: null,
    endsAt: null,
    channel: "site",
    pageKey: "home",
    zone: "hero",
  };

  const result = buildEditorialStats({
    publications: [
      publication,
      { ...publication },
    ] as never,
    now,
  });

  expect(result.conflicts).toBe(1);
});

import { buildEditorialStats } from "./buildEditorialStats";

describe("buildEditorialStats", () => {
  it("classe une publication en cours comme active", () => {
    const now = new Date("2026-07-29T10:00:00.000Z");

    const publication = {
      id: "publication-1",
      pageKey: "home",
      channel: "site",
      zone: "hero",
      priority: 1,
      active: true,
      startsAt: new Date("2026-07-29T09:00:00.000Z"),
      endsAt: new Date("2026-07-29T11:00:00.000Z"),
      createdAt: now,
      updatedAt: now,
      articleId: "article-1",
      article: {},
    };

    const result = buildEditorialStats({
      publications: [publication] as never,
      now,
    });

    expect(result.activePublications).toHaveLength(1);
    expect(result.scheduledPublications).toHaveLength(0);
  });
});