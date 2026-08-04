import { describe, expect, it } from "vitest";

import type { Source } from "@/lib/generated/prisma/client";

import { MobilitatCollector } from "../collectors/MobilitatCollector";
import type { HtmlClient } from "../html/HtmlClient";

class FakeHtmlClient implements HtmlClient {
  constructor(private readonly html: string) {}

  async get(): Promise<string> {
    return this.html;
  }
}

function createSource(): Source {
  return {
    id: 1,
    name: "Mobilitat",
    url: "https://www.mobilitat.ad/totes-incidencies",
    description: null,
    category: null,
    organizationType: "GOVERNMENT",
    collectionMode: "HTML",
    publicationMode: "MANUAL",
    trustLevel: "OFFICIAL",
    checkIntervalMinutes: 15,
    active: true,
    availabilityStatus: "UNKNOWN",
    lastCheckedAt: null,
    lastSuccessAt: null,
    lastErrorAt: null,
    lastErrorMessage: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

describe("MobilitatCollector", () => {
  it("collecte uniquement les incidents routiers andorrans", async () => {
    const collector = new MobilitatCollector(
      new FakeHtmlClient(`
        <h3>Incidències a les carreteres andorranes</h3>
        <div>Obres</div>
        <h3>Tall de trànsit puntual a la CG1</h3>
        <p>Tall de deux minutes entre les rotondes.</p>
        <h3>Tancament túnel Dos Valires</h3>
        <p>Fermeture nocturne pour maintenance.</p>
        <h3>Incidències a les carreteres catalanes</h3>
        <h3>Circulació intensa a l'AP-7</h3>
      `),
    );

    const observations = await collector.collect(
      createSource(),
    );

    expect(observations).toEqual([
      {
        title: "Tall de trànsit puntual a la CG1",
        url:
          "https://www.mobilitat.ad/totes-incidencies?incident=tall-de-transit-puntual-a-la-cg1-kxe6qg",
        publishedAt: null,
        content:
          "Tall de deux minutes entre les rotondes.",
      },
      {
        title: "Tancament túnel Dos Valires",
        url:
          "https://www.mobilitat.ad/totes-incidencies?incident=tancament-tunel-dos-valires-11ejko3",
        publishedAt: null,
        content:
          "Fermeture nocturne pour maintenance.",
      },
    ]);
  });

  it("conserve un incident sans description exploitable", async () => {
    const collector = new MobilitatCollector(
      new FakeHtmlClient(`
        <h3>Incidències a les carreteres andorranes</h3>
        <h3>Retencions CG2</h3>
        <span>Dens</span>
        <h3>Incidències a les carreteres catalanes</h3>
      `),
    );

    const observations = await collector.collect(
      createSource(),
    );

    expect(observations).toEqual([
      expect.objectContaining({
        title: "Retencions CG2",
        content: null,
      }),
    ]);
  });
});
