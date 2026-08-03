import { describe, expect, it } from "vitest";

import { Source } from "@/lib/generated/prisma/client";

import {
  Collector,
  ObservationInput,
} from "../collectors/Collector";
import { collectSource } from "../collectSource";
import { CollectorFactoryInterface } from "../factories/CollectorFactoryInterface";
import { CollectionSourceRepository } from "../repositories/CollectionSourceRepository";
import { ObservationRepository } from "../repositories/ObservationRepository";

class FakeCollectionSourceRepository
  implements CollectionSourceRepository
{
  public succeededAt: Date | null = null;
  public failure: { checkedAt: Date; message: string } | null = null;

  constructor(private readonly source: Source | null) {}

  async findById(): Promise<Source | null> {
    return this.source;
  }

  async markCollectionSucceeded(
    _id: number,
    checkedAt: Date,
  ): Promise<void> {
    this.succeededAt = checkedAt;
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

    expect(result).toEqual({ collected: 1, created: 1 });
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
});
