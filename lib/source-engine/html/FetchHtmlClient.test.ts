import { afterEach, describe, expect, it, vi } from "vitest";

import { FetchHtmlClient, HTML_REQUEST_HEADERS } from "./FetchHtmlClient";

describe("FetchHtmlClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("s’identifie auprès du site au lieu d’envoyer l’agent par défaut de Node", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("<html></html>", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    // Adresse IP publique : aucune résolution DNS, aucun appel réseau réel.
    await new FetchHtmlClient().get("https://93.184.216.34/actualitat");

    expect(fetchMock.mock.calls[0][1].headers).toEqual(HTML_REQUEST_HEADERS);
    expect(HTML_REQUEST_HEADERS["User-Agent"]).toMatch(/^ANDORRE-360/);
  });

  it("rapporte le statut HTTP d’un refus", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 403 })),
    );

    await expect(
      new FetchHtmlClient().get("https://93.184.216.34/actualitat"),
    ).rejects.toThrow("(403)");
  });
});
