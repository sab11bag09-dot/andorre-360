import { describe, expect, it } from "vitest";

import type { Source } from "@/lib/generated/prisma/client";

import { AndorraBusinessCollector } from "../collectors/AndorraBusinessCollector";
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
  name: "Andorra Business",
  url: "https://www.andorrabusiness.com/actualitat/",
  description: null,
  category: null,
  organizationType: "GOVERNMENT",
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

describe("AndorraBusinessCollector", () => {
  it("extrait les actualités économiques et leur corps", async () => {
    const articleUrl =
      "https://www.andorrabusiness.com/actualitat/projecte/";
    const collector = new AndorraBusinessCollector(
      new FakeHtmlClient({
        [source.url]: `
          <h2 class="blog-shortcode-post-title">
            <a href="${articleUrl}">Nouveau projet</a>
          </h2>
        `,
        [articleUrl]: `
          <span class="updated">2026-07-22T09:24:37+01:00</span>
          <div class="post-content">
            <div class="fusion-text fusion-text-1">
              <p>Premier paragraphe économique suffisamment long pour être conservé.</p>
              <p>Second paragraphe qui confirme l’extraction du contenu officiel.</p>
            </div>
            <div class="fusion-text fusion-text-2">
              <p>Bloc annexe à ne pas inclure.</p>
            </div>
          </div>
        `,
      }),
    );

    await expect(collector.collect(source)).resolves.toEqual([
      {
        title: "Nouveau projet",
        url: articleUrl,
        publishedAt: new Date(
          "2026-07-22T09:24:37+01:00",
        ),
        content:
          "Premier paragraphe économique suffisamment long pour être conservé.\n\nSecond paragraphe qui confirme l’extraction du contenu officiel.",
      },
    ]);
  });
});
