import { describe, expect, it } from "vitest";

import type { Source } from "@/lib/generated/prisma/client";

import { MeteoAlertsCollector } from "../collectors/MeteoAlertsCollector";
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
    name: "Meteo Andorra",
    url: "https://www.meteo.ad/Alertes",
    description: null,
    category: null,
    organizationType: "WEATHER_SERVICE",
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
    consecutiveEmptyCollections: 0,
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

describe("MeteoAlertsCollector", () => {
  it("ignore l’état sans avis météorologique", async () => {
    const collector = new MeteoAlertsCollector(
      new FakeHtmlClient(
        '<img src="/images/alertes/img/1_1_1.jpeg">',
      ),
    );

    await expect(
      collector.collect(createSource()),
    ).resolves.toEqual([]);
  });

  it("crée une observation stable pour un avis actif", async () => {
    const collectedAt = new Date(
      "2026-08-04T14:00:00.000Z",
    );
    const collector = new MeteoAlertsCollector(
      new FakeHtmlClient(
        '<img src="/images/alertes/img/2_1_3.jpeg">',
      ),
      () => collectedAt,
    );

    await expect(
      collector.collect(createSource()),
    ).resolves.toEqual([
      {
        title: "Avís meteorològic actiu a Andorra",
        url:
          "https://www.meteo.ad/Alertes?avis=2026-08-04-2-1-3",
        publishedAt: collectedAt,
        content:
          "Estat oficial de les zones nord, centre i sud : 2-1-3. " +
          "Mapa officiel : https://www.meteo.ad/images/alertes/img/2_1_3.jpeg",
      },
    ]);
  });

  it("signale une page dont l’état est introuvable", async () => {
    const collector = new MeteoAlertsCollector(
      new FakeHtmlClient("<main>Page incomplète</main>"),
    );

    await expect(
      collector.collect(createSource()),
    ).rejects.toThrow(
      "L’état des avis météorologiques est introuvable.",
    );
  });
});
