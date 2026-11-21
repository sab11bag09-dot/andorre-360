import { afterEach, describe, expect, it, vi } from "vitest";

import { FetchHtmlClient } from "../html/FetchHtmlClient";
import { describeNetworkFailure, fetchOrExplain } from "./networkError";

function fetchFailed(code: string): TypeError {
  return new TypeError("fetch failed", { cause: Object.assign(new Error(code), { code }) });
}

describe("erreurs réseau lisibles", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ["CERT_HAS_EXPIRED", "le certificat de sécurité (HTTPS) du site a expiré (CERT_HAS_EXPIRED)"],
    ["ERR_TLS_CERT_ALTNAME_INVALID", "le certificat de sécurité (HTTPS) du site n’est pas valide (ERR_TLS_CERT_ALTNAME_INVALID)"],
    ["ENOTFOUND", "l’adresse du site est introuvable (DNS) (ENOTFOUND)"],
    ["ECONNREFUSED", "le serveur du site refuse la connexion (ECONNREFUSED)"],
    ["EPROTO", "la connexion a échoué (EPROTO)"],
  ])("explique %s", (code, reason) => {
    expect(describeNetworkFailure(fetchFailed(code))).toBe(reason);
  });

  it("explique un délai dépassé", () => {
    const timeout = Object.assign(new Error("The operation was aborted due to timeout"), { name: "TimeoutError" });
    expect(describeNetworkFailure(timeout)).toBe("le site n’a pas répondu à temps");
  });

  it("laisse passer les autres erreurs telles quelles", async () => {
    const other = new Error("autre");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(other));

    expect(describeNetworkFailure(other)).toBeNull();
    await expect(fetchOrExplain("https://exemple.ad")).rejects.toBe(other);
  });

  it("remplace « fetch failed » par la raison dans le message de collecte", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(fetchFailed("CERT_HAS_EXPIRED")));

    // Adresse IP publique : aucune résolution DNS, aucun appel réseau réel.
    await expect(new FetchHtmlClient().get("https://93.184.216.34/news")).rejects.toThrow(
      "Impossible de joindre https://93.184.216.34/news : le certificat de sécurité (HTTPS) du site a expiré (CERT_HAS_EXPIRED).",
    );
  });
});
