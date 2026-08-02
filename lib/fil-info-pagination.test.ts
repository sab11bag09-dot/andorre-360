import { describe, expect, it } from "vitest";

import { createFilInfoCursor, parseFilInfoCursor } from "./fil-info-pagination";

describe("curseur du Fil info", () => {
  it("conserve la date de publication, la création et l’identifiant", () => {
    const cursor = createFilInfoCursor({
      id: 42,
      publishedAt: new Date("2026-08-02T08:00:00.000Z"),
      createdAt: new Date("2026-08-02T07:00:00.000Z"),
    });

    expect(parseFilInfoCursor(cursor)).toEqual({
      id: 42,
      publishedAt: new Date("2026-08-02T08:00:00.000Z"),
      createdAt: new Date("2026-08-02T07:00:00.000Z"),
    });
  });

  it("utilise createdAt si publishedAt est absent", () => {
    const createdAt = new Date("2026-08-02T07:00:00.000Z");
    const cursor = createFilInfoCursor({ id: 7, publishedAt: null, createdAt });

    expect(parseFilInfoCursor(cursor)?.publishedAt).toEqual(createdAt);
  });

  it.each([null, "", "invalide", "date|date|0", "a|b|1|extra"])(
    "refuse le curseur invalide %s",
    (cursor) => {
      expect(parseFilInfoCursor(cursor)).toBeNull();
    },
  );
});
