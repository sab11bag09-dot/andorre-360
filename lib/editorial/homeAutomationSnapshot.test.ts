import { describe, expect, it } from "vitest";

import {
  parseHomeAutomationSnapshot,
  serializeHomeAutomationSnapshot,
  type HomeAutomationSnapshot,
} from "./homeAutomationSnapshot";

const updatedAt = new Date("2026-09-05T08:00:00.000Z");

function makeSnapshot(): HomeAutomationSnapshot {
  return {
    lockedPlacements: [
      {
        publicationId: 10,
        priority: 20,
        startsAt: null,
        endsAt: null,
        updatedAt,
        zone: "hero",
        articleId: 42,
        title: "Choix humain",
        category: "ACTUALITÉ",
        sourceId: null,
        sourceName: "Rédaction",
      },
    ],
    publications: [
      {
        publicationId: 11,
        articleId: 43,
        channel: "site",
        pageKey: "home",
        zone: "card",
        priority: 10,
        startsAt: new Date("2026-09-05T07:00:00.000Z"),
        endsAt: null,
        active: true,
        origin: "AUTOMATED",
        locked: false,
        automationScore: 80,
        automationPolicyVersion: "1.0",
        automationRunId: null,
        updatedAt,
      },
    ],
  };
}

describe("snapshot d’automatisation de l’accueil", () => {
  it("sérialise puis restaure toutes les données", () => {
    const snapshot = makeSnapshot();

    expect(
      parseHomeAutomationSnapshot(serializeHomeAutomationSnapshot(snapshot)),
    ).toEqual(snapshot);
  });

  it("refuse un JSON illisible", () => {
    expect(() => parseHomeAutomationSnapshot("{")).toThrow(
      "Snapshot d’automatisation illisible.",
    );
  });

  it("refuse l’absence des sélections humaines", () => {
    expect(() =>
      parseHomeAutomationSnapshot(
        JSON.stringify({
          publications: [],
        }),
      ),
    ).toThrow("sélections humaines absentes");
  });

  it("refuse une date invalide", () => {
    const serialized = JSON.stringify(makeSnapshot());
    const parsed = JSON.parse(serialized);

    parsed.lockedPlacements[0].updatedAt = "date-invalide";

    expect(() => parseHomeAutomationSnapshot(JSON.stringify(parsed))).toThrow(
      "updatedAt doit être une date valide",
    );
  });

  it("refuse une publication devenue humaine", () => {
    const serialized = JSON.stringify(makeSnapshot());
    const parsed = JSON.parse(serialized);

    parsed.publications[0].origin = "MANUAL";

    expect(() => parseHomeAutomationSnapshot(JSON.stringify(parsed))).toThrow(
      "origine automatique inconnue MANUAL",
    );
  });

  it("refuse une publication verrouillée", () => {
    const serialized = JSON.stringify(makeSnapshot());
    const parsed = JSON.parse(serialized);

    parsed.publications[0].locked = true;

    expect(() => parseHomeAutomationSnapshot(JSON.stringify(parsed))).toThrow(
      "ne doit pas être verrouillée",
    );
  });
});
