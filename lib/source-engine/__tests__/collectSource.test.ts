import { describe, expect, it, vi } from "vitest";

// Aucun appel réseau : le robots.txt de chaque source est réputé permissif.
const robots = vi.hoisted(() => ({ assertAiInputAllowed: vi.fn(async () => {}) }));
vi.mock("../robots/robotsPolicy", () => ({ robotsPolicy: robots }));

import { Source } from "@/lib/generated/prisma/client";

import {
  Collector,
  ObservationInput,
} from "../collectors/Collector";
import type { CollectionDateSummary } from "../collectionDates";
import { collectSource } from "../collectSource";
import { CollectorFactoryInterface } from "../factories/CollectorFactoryInterface";
import { CollectionSourceRepository } from "../repositories/CollectionSourceRepository";
import { ObservationRepository } from "../repositories/ObservationRepository";

class FakeCollectionSourceRepository
  implements CollectionSourceRepository
{
  public succeededAt: Date | null = null;
  public succeededDates: CollectionDateSummary | undefined;
  public emptyAt: Date | null = null;
  public failure: { checkedAt: Date; message: string } | null = null;

  constructor(private readonly source: Source | null) {}

  async findById(): Promise<Source | null> {
    return this.source;
  }

  async markCollectionSucceeded(
    _id: number,
    checkedAt: Date,
    dates?: CollectionDateSummary,
  ): Promise<void> {
    this.succeededAt = checkedAt;
    this.succeededDates = dates;
  }

  async markCollectionEmpty(
    _id: number,
    checkedAt: Date,
  ): Promise<void> {
    this.emptyAt = checkedAt;
  }

  async markCollectionFailed(
    _id: number,
    checkedAt: Date,
    message: string,
  ): Promise<void> {
    this.failure = { checkedAt, message };
  }
}

class FakeCollector implements Collector {
  constructor(
    private readonly observations: ObservationInput[],
  ) {}

  async collect(): Promise<ObservationInput[]> {
    return this.observations;
  }
}

class FailingCollector implements Collector {
  async collect(): Promise<ObservationInput[]> {
    throw new Error("Collecte impossible");
  }
}

class FakeCollectorFactory
  implements CollectorFactoryInterface
{
  public receivedSource: Source | null = null;

  constructor(
    private readonly collector: Collector,
  ) {}

  create(source: Source): Collector {
    this.receivedSource = source;

    return this.collector;
  }
}

class FakeObservationRepository
  implements ObservationRepository
{
  constructor(private readonly created: number) {}

  async findById() {
    return null;
  }

  async findUnprocessed() {
    return [];
  }

  async markProcessed(): Promise<void> {}

  async saveMany(): Promise<number> {
    return this.created;
  }
}

function createSource(
  overrides: Partial<Source> = {},
): Source {
  return {
    id: 1,
    name: "Source de test",
    url: "https://example.com",
    description: null,
    category: null,
    organizationType: "OTHER",
    collectionMode: "HTML",
    publicationMode: "MANUAL",
    trustLevel: "HIGH",
    checkIntervalMinutes: 60,
    active: true,
    availabilityStatus: "UNKNOWN",
    lastCheckedAt: null,
    lastSuccessAt: null,
    lastErrorAt: null,
    lastErrorMessage: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    consecutiveEmptyCollections: 0,
    imageReuse: "NONE",
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
    
  };
}

describe("collectSource", () => {
  it("rejette un identifiant invalide", async () => {
    const repository =
      new FakeCollectionSourceRepository(null);

    const collector = new FakeCollector([]);

    const factory = new FakeCollectorFactory(collector);

    await expect(
      collectSource(0, repository, factory),
    ).rejects.toThrow(
      "Identifiant de source invalide.",
    );
  });

  it("rejette une source inexistante", async () => {
    const repository =
      new FakeCollectionSourceRepository(null);

    const collector = new FakeCollector([]);

    const factory = new FakeCollectorFactory(collector);

    await expect(
      collectSource(1, repository, factory),
    ).rejects.toThrow("Source introuvable.");
  });

  it("transmet la source à la factory", async () => {
    const source = createSource();

    const repository =
      new FakeCollectionSourceRepository(source);

    const collector = new FakeCollector([]);

    const factory = new FakeCollectorFactory(collector);

    await collectSource(1, repository, factory);

    expect(factory.receivedSource).toBe(source);
  });

  it("retourne le bilan de collecte", async () => {
    const source = createSource();

    const observations: ObservationInput[] = [
      {
        title: "Actualité de test",
        url: "https://example.com/actualite",
        publishedAt: new Date(
          "2026-01-02T10:00:00.000Z",
        ),
        content: "Contenu de test",
      },
    ];

    const repository =
      new FakeCollectionSourceRepository(source);

    const collector = new FakeCollector(observations);

    const factory = new FakeCollectorFactory(collector);

    const observationRepository =
      new FakeObservationRepository(1);

    const result = await collectSource(
      1,
      repository,
      factory,
      observationRepository,
    );

    expect(result).toEqual({
      collected: 1,
      created: 1,
      undated: 0,
      futureRejected: 0,
    });
    expect(repository.succeededAt).toBeInstanceOf(Date);
    expect(repository.failure).toBeNull();
  });

  it("enregistre l’échec de collecte avant de propager l’erreur", async () => {
    const source = createSource();
    const repository =
      new FakeCollectionSourceRepository(source);
    const factory = new FakeCollectorFactory(
      new FailingCollector(),
    );

    await expect(
      collectSource(1, repository, factory),
    ).rejects.toThrow("Collecte impossible");

    expect(repository.succeededAt).toBeNull();
    expect(repository.failure).toEqual({
      checkedAt: expect.any(Date),
      message: "Collecte impossible",
    });
  });

  it("ne collecte pas une source qui refuse l’usage de ses contenus par l’IA", async () => {
    const source = createSource();
    const repository = new FakeCollectionSourceRepository(source);
    const factory = new FakeCollectorFactory(new FakeCollector([]));
    const refuse = {
      assertAiInputAllowed: async () => {
        throw new Error("example.com refuse l’usage de ses contenus par l’IA (robots.txt : Content-Signal ai-input=no).");
      },
    };

    await expect(collectSource(1, repository, factory, undefined, refuse)).rejects.toThrow("ai-input=no");

    expect(factory.receivedSource).toBeNull();
    expect(repository.failure?.message).toContain("ai-input=no");
  });

  it("compte les observations sans date et les dates futures refusées", async () => {
    const source = createSource();
    const repository =
      new FakeCollectionSourceRepository(source);
    const factory = new FakeCollectorFactory(
      new FakeCollector([
        {
          title: "Datée",
          url: "https://example.com/datee",
          publishedAt: new Date("2026-01-02T10:00:00.000Z"),
          content: null,
        },
        {
          title: "Sans date",
          url: "https://example.com/sans-date",
          publishedAt: null,
          content: null,
        },
        {
          title: "Date future",
          url: "https://example.com/future",
          publishedAt: new Date("2999-01-01T00:00:00.000Z"),
          content: null,
        },
      ]),
    );

    const result = await collectSource(
      1,
      repository,
      factory,
      new FakeObservationRepository(3),
    );

    expect(result).toEqual({
      collected: 3,
      created: 3,
      undated: 2,
      futureRejected: 1,
    });
    expect(repository.succeededDates).toEqual({
      total: 3,
      dated: 1,
      undated: 2,
      futureRejected: 1,
    });
  });

  it("enregistre une collecte vide comme telle, sans remettre le compteur à zéro", async () => {
    const repository = new FakeCollectionSourceRepository(
      createSource(),
    );

    await collectSource(
      1,
      repository,
      new FakeCollectorFactory(new FakeCollector([])),
      new FakeObservationRepository(0),
    );

    expect(repository.emptyAt).toBeInstanceOf(Date);
    expect(repository.succeededAt).toBeNull();
  });
});
