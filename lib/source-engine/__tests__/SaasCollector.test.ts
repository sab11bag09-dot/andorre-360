import { describe, expect, it } from "vitest";

import type { Source } from "@/lib/generated/prisma/client";

import { SaasCollector } from "../collectors/SaasCollector";
import type { HtmlClient } from "../html/HtmlClient";

class FakeHtmlClient implements HtmlClient {
  constructor(
    private readonly responses: Record<string, string>,
  ) {}

  async get(url: string): Promise<string> {
    return this.responses[url] ?? "";
  }
}

const source = {
  id: 1,
  name: "SAAS",
  url: "https://saas.ad/noticies",
  description: null,
  category: null,
  organizationType: "OTHER",
  collectionMode: "HTML",
  publicationMode: "MANUAL",
  trustLevel: "OFFICIAL",
  checkIntervalMinutes: 60,
  active: true,
  availabilityStatus: "UNKNOWN",
  lastCheckedAt: null,
  lastSuccessAt: null,
  lastErrorAt: null,
  lastErrorMessage: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
} satisfies Source;

describe("SaasCollector", () => {
  it("extrait les actualités et le corps éditorial SAAS", async () => {
    const articleUrl =
      "https://saas.ad/noticies/recerca-compartida";
    const collector = new SaasCollector(
      new FakeHtmlClient({
        [source.url]: `
          <div class="item-actualitat">
            <div class="text">
              <h2>Recerca compartida</h2>
              <a class="stretched-link" href="/noticies/recerca-compartida"></a>
            </div>
          </div>
        `,
        [articleUrl]: `
          <noticiesdetail>
            <div class="text-detall">
              <div class="col-12">
                <p class="data-noti">13 / 7 / 2026</p>
                <div>
                  <p>Premier paragraphe complet consacré à la recherche partagée.</p>
                  <p>Second paragraphe qui confirme l’extraction du contenu SAAS.</p>
                </div>
              </div>
            </div>
          </noticiesdetail>
        `,
      }),
    );

    await expect(collector.collect(source)).resolves.toEqual([
      {
        title: "Recerca compartida",
        url: articleUrl,
        publishedAt: new Date(2026, 6, 13),
        content:
          "Premier paragraphe complet consacré à la recherche partagée.\n\nSecond paragraphe qui confirme l’extraction du contenu SAAS.",
      },
    ]);
  });
});
