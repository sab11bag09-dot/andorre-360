import { describe, expect, it } from "vitest";

import {
  DEFAULT_ARTICLE_ORCHESTRATION_POLICY,
  selectObservationsForArticles,
  type OrchestrationObservation,
} from "./selectObservationsForArticles";

const NOW = new Date("2026-11-18T12:00:00.000Z");
const LONG_CONTENT = "Le Govern d’Andorra a annoncé une mesure. ".repeat(10);

function hoursAgo(hours: number): Date {
  return new Date(NOW.getTime() - hours * 60 * 60 * 1_000);
}

function makeObservation(
  overrides: Partial<OrchestrationObservation> = {},
): OrchestrationObservation {
  return {
    id: 1,
    title: "Le Govern annonce une nouvelle aide au logement",
    url: "https://www.govern.ad/actualitat/aide-logement",
    publishedAt: hoursAgo(2),
    content: LONG_CONTENT,
    processed: false,
    articleId: null,
    source: {
      id: 10,
      url: "https://www.govern.ad/",
      active: true,
      publicationMode: "AUTO",
      trustLevel: "OFFICIAL",
    },
    ...overrides,
  };
}

function select(
  observations: OrchestrationObservation[],
  sourceIds: number[] = [10],
  policy = DEFAULT_ARTICLE_ORCHESTRATION_POLICY,
) {
  return selectObservationsForArticles({
    observations,
    allowlistedSourceIds: sourceIds,
    now: NOW,
    policy,
  });
}

function reasonsOf(
  result: ReturnType<typeof select>,
  observationId: number,
) {
  return result.decisions.find(
    (decision) => decision.observationId === observationId,
  )?.reasons;
}

describe("selectObservationsForArticles", () => {
  it("selects a fresh, complete observation from an allowlisted trusted source", () => {
    const result = select([makeObservation()]);

    expect(result.selectedObservationIds).toEqual([1]);
    expect(result.decisions).toEqual([
      { observationId: 1, sourceId: 10, status: "selected", reasons: [] },
    ]);
  });

  it("never selects an observation that is already processed or linked to an article", () => {
    const result = select([
      makeObservation({ id: 1, processed: true, articleId: 7 }),
      makeObservation({
        id: 2,
        title: "Une autre information assez longue",
        url: "https://www.govern.ad/actualitat/autre",
        articleId: 8,
      }),
    ]);

    expect(result.selectedObservationIds).toEqual([]);
    expect(reasonsOf(result, 1)).toContain("already_processed");
    expect(reasonsOf(result, 2)).toContain("already_linked_to_article");
  });

  it("refuses observations whose source is not explicitly allowlisted", () => {
    expect(select([makeObservation()], []).selectedObservationIds).toEqual([]);

    const result = select([makeObservation()], [99]);
    expect(result.selectedObservationIds).toEqual([]);
    expect(reasonsOf(result, 1)).toEqual(["source_not_allowlisted"]);
  });

  it("refuses inactive, non-AUTO and insufficiently trusted sources", () => {
    const result = select(
      [
        makeObservation({
          id: 1,
          source: { id: 10, url: "https://www.govern.ad/", active: false, publicationMode: "AUTO", trustLevel: "HIGH" },
        }),
        makeObservation({
          id: 2,
          url: "https://www.govern.ad/2",
          title: "Deuxième information du Govern",
          source: { id: 10, url: "https://www.govern.ad/", active: true, publicationMode: "ASSISTED", trustLevel: "HIGH" },
        }),
        makeObservation({
          id: 3,
          url: "https://www.govern.ad/3",
          title: "Troisième information du Govern",
          source: { id: 10, url: "https://www.govern.ad/", active: true, publicationMode: "AUTO", trustLevel: "MEDIUM" },
        }),
        makeObservation({
          id: 4,
          url: "https://www.govern.ad/4",
          title: "Quatrième information du Govern",
          source: { id: 10, url: "https://www.govern.ad/", active: true, publicationMode: "AUTO", trustLevel: "LOW" },
        }),
      ],
    );

    expect(result.selectedObservationIds).toEqual([]);
    expect(reasonsOf(result, 1)).toContain("source_inactive");
    expect(reasonsOf(result, 2)).toContain("source_auto_mode_not_enabled");
    expect(reasonsOf(result, 3)).toContain("source_trust_too_low");
    expect(reasonsOf(result, 4)).toContain("source_trust_too_low");
  });

  it("refuses future dates instead of treating them as fresh", () => {
    const result = select([
      makeObservation({ publishedAt: new Date("2027-02-11T00:00:00.000Z") }),
    ]);

    expect(result.selectedObservationIds).toEqual([]);
    expect(reasonsOf(result, 1)).toEqual(["published_at_in_future"]);
  });

  it("refuses an invalid date", () => {
    const result = select([
      makeObservation({ publishedAt: new Date(Number.NaN) }),
    ]);

    expect(reasonsOf(result, 1)).toEqual(["published_at_invalid"]);
  });

  it("does not replace a missing date with the current date", () => {
    const result = select([makeObservation({ publishedAt: null })]);

    expect(result.selectedObservationIds).toEqual([]);
    expect(reasonsOf(result, 1)).toEqual(["published_at_missing"]);
  });

  it("applies an explicit freshness window", () => {
    const result = select([
      makeObservation({ id: 1, publishedAt: hoursAgo(47) }),
      makeObservation({
        id: 2,
        url: "https://www.govern.ad/old",
        title: "Une information ancienne du Govern",
        publishedAt: hoursAgo(49),
      }),
    ]);

    expect(result.selectedObservationIds).toEqual([1]);
    expect(reasonsOf(result, 2)).toEqual(["outside_freshness_window"]);
  });

  it("refuses short or empty content and short titles", () => {
    const result = select([
      makeObservation({ id: 1, content: "Trop court." }),
      makeObservation({
        id: 2,
        url: "https://www.govern.ad/vide",
        title: "Une information sans contenu",
        content: null,
      }),
      makeObservation({
        id: 3,
        url: "https://www.govern.ad/titre",
        title: "Court",
      }),
    ]);

    expect(result.selectedObservationIds).toEqual([]);
    expect(reasonsOf(result, 1)).toEqual(["content_too_short"]);
    expect(reasonsOf(result, 2)).toEqual(["content_too_short"]);
    expect(reasonsOf(result, 3)).toEqual(["title_too_short"]);
  });

  it("refuses non-HTTPS observations and observations outside the source origin", () => {
    const result = select([
      makeObservation({ id: 1, url: "http://www.govern.ad/actualitat/a" }),
    ]);

    expect(reasonsOf(result, 1)).toEqual(["observation_url_not_secure"]);

    const foreign = select([
      makeObservation({ id: 2, url: "https://www.example.com/actualitat/a" }),
    ]);
    expect(reasonsOf(foreign, 2)).toEqual(["observation_origin_mismatch"]);
  });

  it("keeps only the freshest of several observations with the same title", () => {
    const result = select(
      [
        makeObservation({
          id: 1,
          title: "Le Govern annonce une nouvelle aide au logement",
          publishedAt: hoursAgo(5),
        }),
        makeObservation({
          id: 2,
          title: "LE GOVERN annonce une nouvelle aide au logement !",
          url: "https://www.diariandorra.ad/aide",
          publishedAt: hoursAgo(1),
          source: { id: 11, url: "https://www.diariandorra.ad/", active: true, publicationMode: "AUTO", trustLevel: "HIGH" },
        }),
      ],
      [10, 11],
    );

    expect(result.selectedObservationIds).toEqual([2]);
    expect(reasonsOf(result, 1)).toEqual(["duplicate_of_selected_observation"]);
  });

  it("does not select a new observation duplicating an already processed one", () => {
    const result = select([
      makeObservation({ id: 1, processed: true, articleId: 3 }),
      makeObservation({
        id: 2,
        url: "https://www.govern.ad/actualitat/aide-logement-bis",
        title: "Le Govern annonce une nouvelle aide au logement.",
      }),
    ]);

    expect(result.selectedObservationIds).toEqual([]);
    expect(reasonsOf(result, 2)).toEqual(["duplicate_of_processed_observation"]);
  });

  it("is deterministic and bounded by the batch limit", () => {
    const observations = [3, 1, 2].map((id) =>
      makeObservation({
        id,
        title: `Information numéro ${id} du Govern`,
        url: `https://www.govern.ad/${id}`,
        publishedAt: hoursAgo(id === 2 ? 1 : 3),
      }),
    );

    const policy = { ...DEFAULT_ARTICLE_ORCHESTRATION_POLICY, maxSelected: 2, maxPerSource: 5 };
    const first = select(observations, [10], policy);
    const second = select([...observations].reverse(), [10], policy);

    expect(first.selectedObservationIds).toEqual([2, 1]);
    expect(second).toEqual(first);
    expect(reasonsOf(first, 3)).toEqual(["batch_limit_reached"]);
  });

  it("rejects an invalid policy instead of selecting with it", () => {
    expect(() =>
      select([makeObservation()], [10], {
        ...DEFAULT_ARTICLE_ORCHESTRATION_POLICY,
        maxSelected: 0,
      }),
    ).toThrow();
    expect(() =>
      select([makeObservation()], [10], {
        ...DEFAULT_ARTICLE_ORCHESTRATION_POLICY,
        freshnessWindowHours: Number.NaN,
      }),
    ).toThrow();
  });
});

describe("selectObservationsForArticles — observations déjà tentées", () => {
  it("never reselects an observation already attempted by the orchestrator", () => {
    const result = selectObservationsForArticles({
      observations: [makeObservation()],
      allowlistedSourceIds: [10],
      attemptedObservationIds: [1],
      now: NOW,
    });

    expect(result.selectedObservationIds).toEqual([]);
    expect(result.decisions[0].reasons).toEqual([
      "already_attempted_by_orchestrator",
    ]);
  });
});

describe("selectObservationsForArticles — diversité des sources", () => {
  function fromSource(id: number, sourceId: number, host: string, hours: number) {
    return makeObservation({
      id,
      title: `Information numéro ${id} de la source ${sourceId}`,
      url: `https://${host}/${id}`,
      publishedAt: hoursAgo(hours),
      source: {
        id: sourceId,
        url: `https://${host}/`,
        active: true,
        publicationMode: "AUTO",
        trustLevel: "HIGH",
      },
    });
  }

  it("does not let one prolific source fill the whole batch", () => {
    const observations = [
      fromSource(1, 6, "www.diariandorra.ad", 1),
      fromSource(2, 6, "www.diariandorra.ad", 2),
      fromSource(3, 6, "www.diariandorra.ad", 3),
      fromSource(4, 3, "www.govern.ad", 4),
      fromSource(5, 16, "www.policia.ad", 5),
    ];

    const result = selectObservationsForArticles({
      observations,
      allowlistedSourceIds: [3, 6, 16],
      now: NOW,
      policy: { ...DEFAULT_ARTICLE_ORCHESTRATION_POLICY, maxSelected: 3, maxPerSource: 1 },
    });

    expect(result.selectedObservationIds).toEqual([1, 4, 5]);
    expect(result.decisions.find((d) => d.observationId === 2)?.reasons).toEqual([
      "source_limit_reached",
    ]);
  });

  it("limits each source to one article per run by default", () => {
    expect(DEFAULT_ARTICLE_ORCHESTRATION_POLICY.maxPerSource).toBe(1);
  });

  it("rejects an invalid per-source limit", () => {
    expect(() =>
      selectObservationsForArticles({
        observations: [],
        allowlistedSourceIds: [],
        now: NOW,
        policy: { ...DEFAULT_ARTICLE_ORCHESTRATION_POLICY, maxPerSource: 0 },
      }),
    ).toThrow();
  });
});
