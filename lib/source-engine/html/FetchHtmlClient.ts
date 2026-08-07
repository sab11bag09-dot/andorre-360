import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { HtmlClient } from "./HtmlClient";

const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 5;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

function isPrivateIpv4(address: string): boolean {
  const parts = address.split(".").map(Number);

  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return false;
  }

  const value =
    parts[0] * 2 ** 24 +
    parts[1] * 2 ** 16 +
    parts[2] * 2 ** 8 +
    parts[3];

  return (
    parts[0] === 10 ||
    parts[0] === 127 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    value === 0
  );
}

function isPrivateIp(address: string): boolean {
  if (isIP(address) === 4) {
    return isPrivateIpv4(address);
  }

  const normalized = address.toLowerCase();
  return (
    normalized === "::1" ||
    normalized === "::" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  );
}

async function assertSafeUrl(value: string): Promise<URL> {
  const url = new URL(value);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Le collecteur HTTP n’accepte que HTTP et HTTPS.");
  }

  const hostname = url.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname === "metadata.google.internal"
  ) {
    throw new Error("La destination HTTP est privée ou locale.");
  }

  const addresses = isIP(hostname)
    ? [hostname]
    : (await lookup(hostname, { all: true })).map((entry) => entry.address);

  if (addresses.length === 0 || addresses.some(isPrivateIp)) {
    throw new Error("La destination HTTP est privée ou locale.");
  }

  return url;
}

export class FetchHtmlClient implements HtmlClient {
  async get(initialUrl: string): Promise<string> {
    let url = await assertSafeUrl(initialUrl);

    for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
      const response = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (REDIRECT_STATUSES.has(response.status)) {
        const location = response.headers.get("location");
        if (!location || redirectCount === MAX_REDIRECTS) {
          throw new Error("Trop de redirections HTTP.");
        }

        url = await assertSafeUrl(new URL(location, url).toString());
        continue;
      }

      if (!response.ok) {
        throw new Error(
          `Impossible de récupérer ${url} (${response.status}).`,
        );
      }

      if (response.body) {
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let totalBytes = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          totalBytes += value.byteLength;
          if (totalBytes > MAX_RESPONSE_BYTES) {
            await reader.cancel();
            throw new Error("La réponse HTTP dépasse la taille maximale autorisée.");
          }

          chunks.push(value);
        }

        return new TextDecoder().decode(
          chunks.reduce((buffer, chunk) => {
            const next = new Uint8Array(buffer.length + chunk.length);
            next.set(buffer);
            next.set(chunk, buffer.length);
            return next;
          }, new Uint8Array()),
        );
      }

      const text = await response.text();
      if (new TextEncoder().encode(text).byteLength > MAX_RESPONSE_BYTES) {
        throw new Error("La réponse HTTP dépasse la taille maximale autorisée.");
      }

      return text;
    }

    throw new Error("Trop de redirections HTTP.");
  }
}
