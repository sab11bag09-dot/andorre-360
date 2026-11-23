import { afterEach, describe, expect, it, vi } from "vitest";

import { FetchHtmlClient, HTML_REQUEST_HEADERS } from "./FetchHtmlClient";

const ALLOW_ALL = { assertAllowed: async () => {} };

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
    await new FetchHtmlClient(ALLOW_ALL).get("https://93.184.216.34/actualitat");

    expect(fetchMock.mock.calls[0][1].headers).toEqual(HTML_REQUEST_HEADERS);
    expect(HTML_REQUEST_HEADERS["User-Agent"]).toMatch(/^ANDORRE-360/);
  });

  it("rapporte le statut HTTP d’un refus", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 403 })),
    );

    await expect(
      new FetchHtmlClient(ALLOW_ALL).get("https://93.184.216.34/actualitat"),
    ).rejects.toThrow("(403)");
  });

  it("ne télécharge pas une page que le robots.txt du site interdit", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const refuse = {
      assertAllowed: async () => {
        throw new Error("robots.txt interdit");
      },
    };

    await expect(new FetchHtmlClient(refuse).get("https://93.184.216.34/prive")).rejects.toThrow("robots.txt");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
