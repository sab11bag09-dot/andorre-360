/**
 * Note de qualité d’un brouillon rédigé par l’IA (étape 1 de la feuille de
 * route du 22 novembre 2026 : prouver la qualité avant d’automatiser).
 *
 * Fonctions pures et déterministes, sans appel à un modèle d’IA : la note se
 * calcule à partir de l’article et du texte de sa source, à tout moment et
 * sans coût. Elle réutilise les deux contrôles de la génération : fidélité
 * des chiffres et des noms propres, et absence de reprise mot pour mot.
 *
 * Note sur 100, en six critères. Un défaut bloquant (chiffre absent de la
 * source, reprise de passages, texte de remplissage, corps trop court) rend
 * le brouillon « refusé » quelle que soit sa note.
 */

import { checkFactFidelity } from "./factFidelity";
import {
  evaluateSourceSimilarity,
  measureSourceSimilarity,
} from "./sourceSimilarity";

export type DraftQualityInput = {
  article: { title: string; description: string; content: string };
  source: {
    name: string;
    title: string;
    content: string;
    publishedAt: Date | null;
  };
  /** Date de rédaction, transmise au rédacteur comme contexte. */
  generatedAt: Date | null;
};

export type DraftQualityCriterion = {
  key: "fidelity" | "originality" | "body" | "title" | "description" | "cleanliness";
  label: string;
  points: number;
  max: number;
  /** Remarques, vides quand le critère est parfait. */
  notes: string[];
};

export type DraftQualityVerdict = "publiable" | "à revoir" | "refusé";

export type DraftQuality = {
  score: number;
  verdict: DraftQualityVerdict;
  /** Raisons d’un refus, vides sinon. */
  blockers: string[];
  criteria: DraftQualityCriterion[];
};

/** Note minimale d’un brouillon publiable sans retouche. */
export const DRAFT_QUALITY_PUBLISHABLE_SCORE = 80;

const PLACEHOLDERS: ReadonlyArray<[RegExp, string]> = [
  [/\blorem\b|\bipsum\b/iu, "texte de remplissage (lorem ipsum)"],
  [/\b(?:todo|tbd|xxx)\b/iu, "marque de travail (TODO, XXX)"],
  [/\[\[|\]\]|\{\{|\}\}|\[(?:nom|date|source|lieu|chiffre)[^\]]*\]/iu, "champ à compléter entre crochets"],
  [/\b(?:as an ai|en tant qu['’]intelligence artificielle|en tant qu['’]ia|je suis une ia)\b/iu, "phrase de l’assistant IA"],
];

const FORMATTING: ReadonlyArray<[RegExp, string]> = [
  [/<\/?[a-z][a-z0-9]*(?:\s[^>]*)?>/iu, "balise HTML dans le texte"],
  [/\*\*|__|^#{1,6}\s/mu, "mise en forme Markdown restée dans le texte"],
  [/n['’]h[ée]sitez pas|en conclusion,|il est important de noter/iu, "tournure d’assistant à éviter"],
];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function wordCount(value: string): number {
  return value.split(/\s+/u).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
}

function paragraphs(value: string): string[] {
  return value
    .split(/\n\s*\n/u)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function sentences(value: string): string[] {
  return value
    .split(/(?<=[.!?])\s+/u)
    .map((sentence) => normalize(sentence))
    .filter((sentence) => sentence.split(" ").length >= 6);
}

function clamp(value: number, max: number): number {
  return Math.max(0, Math.min(max, Math.round(value)));
}

function fidelity(input: DraftQualityInput, blockers: string[]): DraftQualityCriterion {
  const result = checkFactFidelity({
    article: input.article,
    facts: [input.source.title, input.source.content],
    sourceName: input.source.name,
    contextDates: [input.source.publishedAt, input.generatedAt],
  });
  const notes: string[] = [];
  let points = 35;

  if (result.unsupportedNumbers.length > 0) {
    const detail = `chiffres absents de la source : ${result.unsupportedNumbers.join(", ")}`;
    blockers.push(detail);
    notes.push(detail);
    points = 0;
  }
  // Signalement seulement, faiblement pénalisé : la source est souvent en
  // catalan et l’article en français, et la plupart de ces noms sont des
  // traductions légitimes (« Govern » → « Gouvernement »).
  if (result.namesToCheck.length > 0) {
    notes.push(`noms à vérifier : ${result.namesToCheck.slice(0, 6).join(", ")}`);
    points -= Math.min(5, result.namesToCheck.length);
  }

  return { key: "fidelity", label: "Fidélité aux faits", points: clamp(points, 35), max: 35, notes };
}

function originality(input: DraftQualityInput, blockers: string[]): DraftQualityCriterion {
  const measure = measureSourceSimilarity(input.source, input.article);
  const evaluation = evaluateSourceSimilarity(measure);
  const percent = Math.round(measure.sharedShingleRatio * 100);
  const notes: string[] = [];
  let points = 20 - measure.sharedShingleRatio * 50;

  if (evaluation.blocked) {
    const detail = `reprise de la source : ${percent} % de passages communs, plus long passage de ${measure.longestSharedRun} mots`;
    blockers.push(detail);
    notes.push(detail);
    points = 0;
  } else if (percent > 0 || measure.longestSharedRun > 8) {
    notes.push(`${percent} % de passages communs, plus long passage de ${measure.longestSharedRun} mots`);
    if (measure.longestSharedRun > 8) points -= 3;
  }

  return { key: "originality", label: "Rédaction propre (pas de copie)", points: clamp(points, 20), max: 20, notes };
}

function body(input: DraftQualityInput, blockers: string[]): DraftQualityCriterion {
  const words = wordCount(input.article.content);
  const parts = paragraphs(input.article.content);
  const notes: string[] = [];
  let points = 0;

  if (words < 60) {
    const detail = `corps trop court : ${words} mots`;
    blockers.push(detail);
    notes.push(detail);
  } else if (words < 120 || words > 1000) {
    notes.push(`longueur inhabituelle : ${words} mots (120 à 1 000 attendus)`);
    points += 6;
  } else {
    points += 10;
  }

  if (parts.length >= 2) points += 5;
  else notes.push("un seul paragraphe");

  const seen = new Set<string>();
  const repeated = sentences(input.article.content).filter((sentence) => {
    if (seen.has(sentence)) return true;
    seen.add(sentence);
    return false;
  });
  if (repeated.length > 0) {
    notes.push(`phrase répétée (${repeated.length})`);
    points -= 3;
  }

  return { key: "body", label: "Corps de l’article", points: clamp(points, 15), max: 15, notes };
}

function title(input: DraftQualityInput): DraftQualityCriterion {
  const value = input.article.title.trim();
  const notes: string[] = [];
  let points = 10;

  if (value.length < 25 || value.length > 110) {
    notes.push(`longueur du titre : ${value.length} caractères (25 à 110 attendus)`);
    points -= 5;
  }
  if (/\.$/u.test(value)) {
    notes.push("titre terminé par un point");
    points -= 2;
  }
  if (value.length > 12 && value === value.toUpperCase()) {
    notes.push("titre en capitales");
    points -= 3;
  }
  if (normalize(value) === normalize(input.source.title)) {
    notes.push("titre recopié de la source");
    points = 0;
  }

  return { key: "title", label: "Titre", points: clamp(points, 10), max: 10, notes };
}

function description(input: DraftQualityInput): DraftQualityCriterion {
  const value = input.article.description.trim();
  const notes: string[] = [];
  let points = 10;

  if (value.length < 60 || value.length > 360) {
    notes.push(`longueur du chapô : ${value.length} caractères (100 à 300 attendus)`);
    points = 2;
  } else if (value.length < 100 || value.length > 300) {
    notes.push(`longueur du chapô : ${value.length} caractères (100 à 300 attendus)`);
    points = 6;
  }
  if (normalize(value) === normalize(input.article.title)) {
    notes.push("chapô identique au titre");
    points = 0;
  }
  const firstParagraph = paragraphs(input.article.content)[0] ?? "";
  if (value && normalize(firstParagraph).startsWith(normalize(value))) {
    notes.push("chapô répété en tête du corps");
    points -= 4;
  }

  return { key: "description", label: "Chapô", points: clamp(points, 10), max: 10, notes };
}

function cleanliness(input: DraftQualityInput, blockers: string[]): DraftQualityCriterion {
  const text = [input.article.title, input.article.description, input.article.content].join("\n");
  const notes: string[] = [];
  let points = 10;

  for (const [pattern, label] of PLACEHOLDERS) {
    if (pattern.test(text)) {
      blockers.push(label);
      notes.push(label);
      points = 0;
    }
  }
  for (const [pattern, label] of FORMATTING) {
    if (pattern.test(text)) {
      notes.push(label);
      points -= 4;
    }
  }

  return { key: "cleanliness", label: "Propreté du texte", points: clamp(points, 10), max: 10, notes };
}

export function assessDraftQuality(input: DraftQualityInput): DraftQuality {
  const blockers: string[] = [];
  const criteria = [
    fidelity(input, blockers),
    originality(input, blockers),
    body(input, blockers),
    title(input),
    description(input),
    cleanliness(input, blockers),
  ];
  const score = criteria.reduce((total, criterion) => total + criterion.points, 0);
  const verdict: DraftQualityVerdict =
    blockers.length > 0
      ? "refusé"
      : score >= DRAFT_QUALITY_PUBLISHABLE_SCORE
        ? "publiable"
        : "à revoir";

  return { score, verdict, blockers, criteria };
}
