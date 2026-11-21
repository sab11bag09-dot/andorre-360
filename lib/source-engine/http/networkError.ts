/**
 * Erreurs réseau lisibles dans l’administration.
 *
 * Quand la connexion échoue avant toute réponse (certificat, DNS, refus,
 * délai), `fetch` ne rejette qu’un « fetch failed » sans détail ; la vraie
 * raison est dans `error.cause.code`. Exemple réel du 21 novembre 2026 : le
 * certificat HTTPS de www.ordino.ad avait expiré la veille.
 */

const CERTIFICATE_ERRORS = new Set([
  "CERT_NOT_YET_VALID",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "SELF_SIGNED_CERT_IN_CHAIN",
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "ERR_TLS_CERT_ALTNAME_INVALID",
  "CERT_REVOKED",
]);

const REASONS: Record<string, string> = {
  CERT_HAS_EXPIRED: "le certificat de sécurité (HTTPS) du site a expiré",
  ENOTFOUND: "l’adresse du site est introuvable (DNS)",
  EAI_AGAIN: "l’adresse du site est introuvable pour le moment (DNS)",
  ECONNREFUSED: "le serveur du site refuse la connexion",
  ECONNRESET: "le serveur du site a coupé la connexion",
  EHOSTUNREACH: "le serveur du site est injoignable",
  ETIMEDOUT: "le serveur du site ne répond pas",
  UND_ERR_CONNECT_TIMEOUT: "le serveur du site ne répond pas",
};

function causeCode(error: unknown): string | null {
  if (!(error instanceof Error)) return null;
  const cause = (error as Error & { cause?: unknown }).cause;
  if (cause && typeof cause === "object" && "code" in cause && typeof cause.code === "string") {
    return cause.code;
  }
  return null;
}

/** Raison lisible d’un échec de connexion, ou `null` si l’erreur n’en est pas un. */
export function describeNetworkFailure(error: unknown): string | null {
  if (error instanceof Error && error.name === "TimeoutError") {
    return "le site n’a pas répondu à temps";
  }

  const code = causeCode(error);
  if (!code) return null;

  const reason =
    REASONS[code] ??
    (CERTIFICATE_ERRORS.has(code) ? "le certificat de sécurité (HTTPS) du site n’est pas valide" : "la connexion a échoué");

  return `${reason} (${code})`;
}

/**
 * Lance `fetch` et remplace un échec de connexion par un message lisible ;
 * les autres erreurs sont relancées telles quelles.
 */
export async function fetchOrExplain(url: string | URL, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (error) {
    const reason = describeNetworkFailure(error);
    if (!reason) throw error;
    throw new Error(`Impossible de joindre ${url} : ${reason}.`, { cause: error });
  }
}
