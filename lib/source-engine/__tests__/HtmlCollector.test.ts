import { describe, expect, it } from "vitest";

import type { Source } from "@/lib/generated/prisma/client";

import { HtmlCollector } from "../collectors/HtmlCollector";
import type { HtmlClient } from "../html/HtmlClient";

class FakeHtmlClient implements HtmlClient {
  public receivedUrl: string | null = null;

  async get(url: string): Promise<string> {
    this.receivedUrl = url;

    return "";
  }
}

function createSource(): Source {
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
  };
}

describe("HtmlCollector", () => {
  it("appelle le client HTML avec l'URL de la source", async () => {
    const htmlClient = new FakeHtmlClient();
    const collector = new HtmlCollector(htmlClient);
    const source = createSource();

    await collector.collect(source);

    expect(htmlClient.receivedUrl).toBe(source.url);
  });
});