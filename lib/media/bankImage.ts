import { CANONICAL_EDITORIAL_CATEGORIES } from "@/lib/article-engine/normalizeEditorialCategory";

/**
 * Banque d’images de la rédaction, classée par rubrique.
 *
 * Une image de la médiathèque entre dans la banque quand on lui donne une
 * rubrique (`Media.bankCategory`) ou « toutes les rubriques ». Elle doit
 * appartenir à ANDORRE 360 ou être sous licence : une photo reprise d’une
 * source pour les essais (`testOnly`) n’y entre jamais.
 *
 * Pour un brouillon sans photo de source, on choisit une image de sa
 * rubrique, à défaut une image valable pour toutes, en variant : la moins
 * utilisée d’abord, puis la plus anciennement utilisée.
 */

export const ALL_RUBRICS = "ALL";

export type BankImageCandidate = {
  id: number;
  path: string;
  bankCategory: string;
  usageCount: number;
  lastUsedAt: Date | null;
};

function byRotation(a: BankImageCandidate, b: BankImageCandidate): number {
  return (
    a.usageCount - b.usageCount ||
    (a.lastUsedAt?.getTime() ?? 0) - (b.lastUsedAt?.getTime() ?? 0) ||
    a.id - b.id
  );
}

export function chooseBankImage(
  candidates: readonly BankImageCandidate[],
  category: string,
): BankImageCandidate | null {
  for (const rubric of [category, ALL_RUBRICS]) {
    const matching = candidates.filter((candidate) => candidate.bankCategory === rubric);

    if (matching.length > 0) {
      return [...matching].sort(byRotation)[0];
    }
  }

  return null;
}

export type ParsedBankCategory = { ok: true; value: string | null } | { ok: false; error: string };

export function parseBankCategory(value: unknown): ParsedBankCategory {
  if (value === null || value === undefined || value === "") {
    return { ok: true, value: null };
  }

  if (
    typeof value === "string" &&
    (value === ALL_RUBRICS || (CANONICAL_EDITORIAL_CATEGORIES as readonly string[]).includes(value))
  ) {
    return { ok: true, value };
  }

  return { ok: false, error: "Rubrique de la banque d’images inconnue." };
}

/** Choix proposés dans la médiathèque. */
export const BANK_CATEGORY_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "", label: "Hors banque" },
  { value: ALL_RUBRICS, label: "Toutes les rubriques" },
  { value: "ACTUALITÉ", label: "Actualité" },
  { value: "POLITIQUE", label: "Politique" },
  { value: "ÉCONOMIE", label: "Économie" },
  { value: "SOCIÉTÉ", label: "Société" },
  { value: "INTERNATIONAL", label: "International" },
  { value: "ILS_EN_PARLENT", label: "Ils en parlent" },
  { value: "SPORTS", label: "Sports" },
  { value: "CULTURE", label: "Culture" },
  { value: "MONTAGNE", label: "Montagne" },
  { value: "LOISIRS", label: "Loisirs" },
  { value: "ÉDITORIAL", label: "Éditorial" },
];
