import { describe, expect, it } from "vitest";

import {
  createHomeEditorialProposalToken,
  readHomeEditorialProposalToken,
} from "./homeEditorialProposalToken";

const env = {
  AUTH_SECRET: "secret-de-test-suffisamment-long",
};

const generatedAt = new Date("2026-09-05T12:00:00.000Z");

const composition = {
  placements: [
    {
      zone: "card" as const,
      articleId: 42,
      sourceId: 7,
      category: "ACTUALITÉ",
      score: 70,
      origin: "AUTOMATED" as const,
    },
  ],
  evaluations: [],
  unfilledSlots: {
    hero: 1,
    feature: 1,
    "grand-format": 1,
    card: 4,
    brief: 3,
  },
};

const lockedPlacements = [
  {
    publicationId: 10,
    priority: 20,
    startsAt: null,
    endsAt: null,
    updatedAt: new Date("2026-09-05T11:00:00.000Z"),
    zone: "hero" as const,
    articleId: 1,
    title: "Choix humain",
    category: "POLITIQUE",
    sourceId: null,
    sourceName: "Rédaction",
  },
];

function makeToken(): string {
  return createHomeEditorialProposalToken(
    {
      actorId: "admin-1",
      generatedAt,
      policyVersion: "1.1",
      composition,
      lockedPlacements,
    },
    env,
  );
}

describe("jeton signé d’une proposition éditoriale", () => {
  it("restitue exactement la proposition signée", () => {
    expect(
      readHomeEditorialProposalToken(makeToken(), "admin-1", {
        env,
        now: new Date("2026-09-05T12:10:00.000Z"),
      }),
    ).toEqual({
      generatedAt,
      policyVersion: "1.1",
      composition,
      lockedPlacements,
    });
  });

  it("refuse un jeton modifié dans le navigateur", () => {
    const token = makeToken();
    const alteredToken = (token[0] === "a" ? "b" : "a") + token.slice(1);

    expect(() =>
      readHomeEditorialProposalToken(alteredToken, "admin-1", {
        env,
        now: generatedAt,
      }),
    ).toThrow("La proposition est invalide ou a expiré");
  });

  it("refuse le jeton d’un autre administrateur", () => {
    expect(() =>
      readHomeEditorialProposalToken(makeToken(), "admin-2", {
        env,
        now: generatedAt,
      }),
    ).toThrow("La proposition est invalide ou a expiré");
  });

  it("refuse une proposition vieille de plus de quinze minutes", () => {
    expect(() =>
      readHomeEditorialProposalToken(makeToken(), "admin-1", {
        env,
        now: new Date("2026-09-05T12:15:00.001Z"),
      }),
    ).toThrow("La proposition est invalide ou a expiré");
  });

  it("refuse de fonctionner sans secret serveur", () => {
    expect(() =>
      createHomeEditorialProposalToken(
        {
          actorId: "admin-1",
          generatedAt,
          policyVersion: "1.1",
          composition,
          lockedPlacements,
        },
        {},
      ),
    ).toThrow("AUTH_SECRET est absent");
  });
});
