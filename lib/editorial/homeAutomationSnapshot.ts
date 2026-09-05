import {
  HOME_VISIBLE_ZONE_CAPACITIES,
  type HomeVisibleZone,
} from "./homeComposition";
import type { LockedHomePublication } from "./loadLockedHomePlacements";
import type { MutableHomePublicationSnapshot } from "./loadMutableHomePublications";

export type HomeAutomationSnapshot = {
  lockedPlacements: LockedHomePublication[];
  publications: MutableHomePublicationSnapshot[];
};

const HOME_VISIBLE_ZONES = new Set<string>(
  Object.keys(HOME_VISIBLE_ZONE_CAPACITIES),
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];

  if (typeof value !== "string") {
    throw new Error(`Snapshot invalide : ${key} doit être une chaîne.`);
  }

  return value;
}

function readNumber(record: Record<string, unknown>, key: string): number {
  const value = record[key];

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Snapshot invalide : ${key} doit être un nombre.`);
  }

  return value;
}

function readNullableNumber(
  record: Record<string, unknown>,
  key: string,
): number | null {
  const value = record[key];

  if (value === null) {
    return null;
  }

  return readNumber(record, key);
}

function readNullableString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];

  if (value === null) {
    return null;
  }

  return readString(record, key);
}

function readDate(record: Record<string, unknown>, key: string): Date {
  const value = record[key];

  if (typeof value !== "string") {
    throw new Error(`Snapshot invalide : ${key} doit être une date.`);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Snapshot invalide : ${key} doit être une date valide.`);
  }

  return date;
}

function readNullableDate(
  record: Record<string, unknown>,
  key: string,
): Date | null {
  if (record[key] === null) {
    return null;
  }

  return readDate(record, key);
}

function readZone(record: Record<string, unknown>): HomeVisibleZone {
  const zone = readString(record, "zone");

  if (!HOME_VISIBLE_ZONES.has(zone)) {
    throw new Error(`Snapshot invalide : zone inconnue ${zone}.`);
  }

  return zone as HomeVisibleZone;
}

function parseLockedPlacement(value: unknown): LockedHomePublication {
  if (!isRecord(value)) {
    throw new Error("Snapshot invalide : placement humain incorrect.");
  }

  return {
    publicationId: readNumber(value, "publicationId"),
    priority: readNumber(value, "priority"),
    startsAt: readNullableDate(value, "startsAt"),
    endsAt: readNullableDate(value, "endsAt"),
    updatedAt: readDate(value, "updatedAt"),
    zone: readZone(value),
    articleId: readNumber(value, "articleId"),
    title: readString(value, "title"),
    category: readString(value, "category"),
    sourceId: readNullableNumber(value, "sourceId"),
    sourceName: readString(value, "sourceName"),
  };
}

function parseMutablePublication(
  value: unknown,
): MutableHomePublicationSnapshot {
  if (!isRecord(value)) {
    throw new Error("Snapshot invalide : publication automatique incorrecte.");
  }

  const origin = readString(value, "origin");

  if (origin !== "AUTOMATED" && origin !== "FALLBACK") {
    throw new Error(
      `Snapshot invalide : origine automatique inconnue ${origin}.`,
    );
  }

  if (value.active !== true) {
    throw new Error("Snapshot invalide : la publication doit être active.");
  }

  if (value.locked !== false) {
    throw new Error(
      "Snapshot invalide : la publication ne doit pas être verrouillée.",
    );
  }

  return {
    publicationId: readNumber(value, "publicationId"),
    articleId: readNumber(value, "articleId"),
    channel: readString(value, "channel"),
    pageKey: readString(value, "pageKey"),
    zone: readZone(value),
    priority: readNumber(value, "priority"),
    startsAt: readNullableDate(value, "startsAt"),
    endsAt: readNullableDate(value, "endsAt"),
    active: true,
    origin,
    locked: false,
    automationScore: readNullableNumber(value, "automationScore"),
    automationPolicyVersion: readNullableString(
      value,
      "automationPolicyVersion",
    ),
    automationRunId: readNullableString(value, "automationRunId"),
    updatedAt: readDate(value, "updatedAt"),
  };
}

export function serializeHomeAutomationSnapshot(
  snapshot: HomeAutomationSnapshot,
): string {
  return JSON.stringify(snapshot);
}

export function parseHomeAutomationSnapshot(
  serialized: string,
): HomeAutomationSnapshot {
  let parsed: unknown;

  try {
    parsed = JSON.parse(serialized);
  } catch {
    throw new Error("Snapshot d’automatisation illisible.");
  }

  if (!isRecord(parsed)) {
    throw new Error("Snapshot d’automatisation invalide.");
  }

  if (!Array.isArray(parsed.lockedPlacements)) {
    throw new Error("Snapshot invalide : sélections humaines absentes.");
  }

  if (!Array.isArray(parsed.publications)) {
    throw new Error("Snapshot invalide : publications automatiques absentes.");
  }

  return {
    lockedPlacements: parsed.lockedPlacements.map(parseLockedPlacement),
    publications: parsed.publications.map(parseMutablePublication),
  };
}
