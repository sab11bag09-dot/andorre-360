import { createHmac, timingSafeEqual } from "node:crypto";

import type { HomeCompositionResult } from "./homeComposition";
import { parseHomeAutomationSnapshot } from "./homeAutomationSnapshot";
import type { LockedHomePublication } from "./loadLockedHomePlacements";

const TOKEN_VERSION = 1;
const TOKEN_LIFETIME_MS = 15 * 60 * 1000;

type ProposalTokenPayload = {
  version: typeof TOKEN_VERSION;
  actorId: string;
  generatedAt: string;
  expiresAt: string;
  policyVersion: string;
  composition: HomeCompositionResult;
  lockedPlacements: LockedHomePublication[];
};

export type HomeEditorialProposal = {
  generatedAt: Date;
  policyVersion: string;
  composition: HomeCompositionResult;
  lockedPlacements: LockedHomePublication[];
};

function readSecret(env: Record<string, string | undefined>): string {
  const secret = env.AUTH_SECRET?.trim();

  if (!secret) {
    throw new Error(
      "Impossible de sécuriser la proposition : AUTH_SECRET est absent.",
    );
  }

  return secret;
}

function sign(encodedPayload: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
}

function fail(): never {
  throw new Error(
    "La proposition est invalide ou a expiré. Lancez une nouvelle simulation.",
  );
}

export function createHomeEditorialProposalToken(
  input: {
    actorId: string;
    generatedAt: Date;
    policyVersion: string;
    composition: HomeCompositionResult;
    lockedPlacements: readonly LockedHomePublication[];
  },
  env: Record<string, string | undefined> = process.env,
): string {
  const secret = readSecret(env);

  const payload: ProposalTokenPayload = {
    version: TOKEN_VERSION,
    actorId: input.actorId,
    generatedAt: input.generatedAt.toISOString(),
    expiresAt: new Date(
      input.generatedAt.getTime() + TOKEN_LIFETIME_MS,
    ).toISOString(),
    policyVersion: input.policyVersion,
    composition: input.composition,
    lockedPlacements: [...input.lockedPlacements],
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );

  return `${encodedPayload}.${sign(encodedPayload, secret)}`;
}

export function readHomeEditorialProposalToken(
  token: string,
  expectedActorId: string,
  options: {
    env?: Record<string, string | undefined>;
    now?: Date;
  } = {},
): HomeEditorialProposal {
  const secret = readSecret(options.env ?? process.env);
  const parts = token.split(".");

  if (parts.length !== 2) {
    fail();
  }

  const [encodedPayload, receivedSignature] = parts;
  const expectedSignature = sign(encodedPayload, secret);
  const receivedBuffer = Buffer.from(receivedSignature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    fail();
  }

  let payload: ProposalTokenPayload;

  try {
    payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as ProposalTokenPayload;
  } catch {
    fail();
  }

  if (
    payload.version !== TOKEN_VERSION ||
    payload.actorId !== expectedActorId ||
    typeof payload.generatedAt !== "string" ||
    typeof payload.expiresAt !== "string" ||
    typeof payload.policyVersion !== "string" ||
    !payload.policyVersion.trim() ||
    typeof payload.composition !== "object" ||
    payload.composition === null ||
    !Array.isArray(payload.composition.placements) ||
    !Array.isArray(payload.composition.evaluations) ||
    typeof payload.composition.unfilledSlots !== "object" ||
    payload.composition.unfilledSlots === null ||
    !Array.isArray(payload.lockedPlacements)
  ) {
    fail();
  }

  const generatedAt = new Date(payload.generatedAt);
  const expiresAt = new Date(payload.expiresAt);
  const now = options.now ?? new Date();

  if (
    Number.isNaN(generatedAt.getTime()) ||
    Number.isNaN(expiresAt.getTime()) ||
    now.getTime() > expiresAt.getTime()
  ) {
    fail();
  }

  const snapshot = parseHomeAutomationSnapshot(
    JSON.stringify({
      lockedPlacements: payload.lockedPlacements,
      publications: [],
    }),
  );

  return {
    generatedAt,
    policyVersion: payload.policyVersion,
    composition: payload.composition,
    lockedPlacements: snapshot.lockedPlacements,
  };
}
