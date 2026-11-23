"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin/requireAdmin";
import { QUESTIONS } from "@/lib/article-engine/fiveQuestions";
import {
  isReferenceAnnotated,
  REFERENCE_QUESTION_FIELDS,
  REFERENCE_SET_SIZE,
  type ReferenceAnnotation,
  selectReferenceObservations,
} from "@/lib/article-engine/referenceSet";
import { loadReferenceCandidates } from "@/lib/article-engine/referenceSetReport";
import { prisma } from "@/lib/prisma";

/**
 * Jeu de référence de la qualité éditoriale : composition automatique et
 * annotation par l’utilisateur. Aucune action n’appelle l’IA.
 */

const REFERENCE_PATH = "/admin/qualite/reference";
const TEXT_MAX_LENGTH = 4000;

function readId(formData: FormData): number {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) throw new Error("Observation de référence invalide.");
  return id;
}

function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, TEXT_MAX_LENGTH) : "";
}

/** Complète le jeu jusqu’à 30 observations, réparties automatiquement. */
export async function completeReferenceSetAction(): Promise<void> {
  await requireAdmin();

  const [total, { candidates, existing }] = await Promise.all([
    prisma.referenceCase.count({ where: { excludedAt: null } }),
    loadReferenceCandidates(),
  ]);
  // Les cas dont la source a été désactivée comptent dans la taille du jeu.
  const size = REFERENCE_SET_SIZE - (total - existing.length);
  const observationIds = selectReferenceObservations(candidates, existing, size);

  if (observationIds.length > 0) {
    await prisma.referenceCase.createMany({
      data: observationIds.map((observationId) => ({ observationId })),
    });
  }

  revalidatePath(REFERENCE_PATH);
}

export async function saveReferenceAnnotationAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = readId(formData);
  const annotation = Object.fromEntries([
    ...QUESTIONS.map(({ key }) => {
      const field = REFERENCE_QUESTION_FIELDS[key];
      return [field, readText(formData, field)];
    }),
    ["forbiddenErrors", readText(formData, "forbiddenErrors")],
  ]) as ReferenceAnnotation;
  const notes = readText(formData, "notes");

  await prisma.referenceCase.update({
    where: { id, excludedAt: null },
    data: {
      ...annotation,
      notes,
      annotatedAt: isReferenceAnnotated(annotation) ? new Date() : null,
    },
  });

  revalidatePath(REFERENCE_PATH);
  redirect(REFERENCE_PATH);
}

/**
 * Écarte une observation du jeu : elle n’est plus affichée ni reproposée, et
 * « Compléter le jeu » en choisit une autre.
 */
export async function excludeReferenceCaseAction(formData: FormData): Promise<void> {
  await requireAdmin();

  await prisma.referenceCase.update({
    where: { id: readId(formData) },
    data: { excludedAt: new Date() },
  });

  revalidatePath(REFERENCE_PATH);
  redirect(REFERENCE_PATH);
}
