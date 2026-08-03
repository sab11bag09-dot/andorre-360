import type { AdminIdentity } from "@/lib/admin/requireAdmin";
import type { EditorialEventAction } from "@/lib/generated/prisma/client";
import { recordEditorialEvent } from "@/lib/editorial-history";
import { prisma } from "@/lib/prisma";

import {
  publishArticleTranslation,
  transitionArticleTranslation,
  updateArticleTranslation,
  updateArticleTranslationSlug,
  type ManageArticleTranslationDependencies,
  type ManageArticleTranslationResult,
  type PublishArticleTranslationInput,
  type TransitionArticleTranslationInput,
  type UpdateArticleTranslationInput,
  type UpdateArticleTranslationSlugInput,
} from "./manageArticleTranslation";
import { PrismaArticleTranslationRepository } from "./repositories/PrismaArticleTranslationRepository";

type TranslationReference = {
  articleId: number;
  locale: string;
};

function assertTranslationReference(
  reference: TranslationReference,
): asserts reference is {
  articleId: number;
  locale: "CA" | "ES";
} {
  if (
    !Number.isInteger(reference.articleId) ||
    reference.articleId <= 0
  ) {
    throw new Error("Identifiant d’article invalide.");
  }

  if (
    reference.locale !== "CA" &&
    reference.locale !== "ES"
  ) {
    throw new Error("Langue de traduction invalide.");
  }
}

type AuditedTranslationMutationInput = {
  reference: TranslationReference;
  actor: AdminIdentity;
  action: EditorialEventAction;
  operation: string;
  mutate(
    dependencies: ManageArticleTranslationDependencies,
  ): Promise<ManageArticleTranslationResult>;
};

async function runAuditedTranslationMutation(
  input: AuditedTranslationMutationInput,
): Promise<ManageArticleTranslationResult> {
  assertTranslationReference(input.reference);
  const reference = input.reference;

  return prisma.$transaction(async (transaction) => {
    const translationRepository =
      new PrismaArticleTranslationRepository(transaction);
    const previous =
      await translationRepository.findByArticleAndLocale(
        reference.articleId,
        reference.locale,
      );

    const result = await input.mutate({
      translationRepository,
      now: () => new Date(),
    });

    await recordEditorialEvent(transaction, {
      action: input.action,
      articleId: reference.articleId,
      translationId: result.translationId,
      actor: input.actor,
      fromStatus: previous?.status,
      toStatus: result.status,
      details: {
        locale: reference.locale,
        operation: input.operation,
      },
    });

    return result;
  });
}

export async function updateAuditedArticleTranslation(
  input: UpdateArticleTranslationInput,
  actor: AdminIdentity,
): Promise<ManageArticleTranslationResult> {
  return runAuditedTranslationMutation({
    reference: input,
    actor,
    action: "TRANSLATION_UPDATED",
    operation: "content",
    mutate: (dependencies) =>
      updateArticleTranslation(input, dependencies),
  });
}

export async function updateAuditedArticleTranslationSlug(
  input: UpdateArticleTranslationSlugInput,
  actor: AdminIdentity,
): Promise<ManageArticleTranslationResult> {
  return runAuditedTranslationMutation({
    reference: input,
    actor,
    action: "TRANSLATION_UPDATED",
    operation: "slug",
    mutate: (dependencies) =>
      updateArticleTranslationSlug(input, dependencies),
  });
}

export async function transitionAuditedArticleTranslation(
  input: TransitionArticleTranslationInput,
  actor: AdminIdentity,
): Promise<ManageArticleTranslationResult> {
  return runAuditedTranslationMutation({
    reference: input,
    actor,
    action:
      input.nextStatus === "ARCHIVED"
        ? "TRANSLATION_ARCHIVED"
        : "TRANSLATION_STATUS_CHANGED",
    operation: "status",
    mutate: (dependencies) =>
      transitionArticleTranslation(input, dependencies),
  });
}

export async function publishAuditedArticleTranslation(
  input: PublishArticleTranslationInput,
  actor: AdminIdentity,
): Promise<ManageArticleTranslationResult> {
  return runAuditedTranslationMutation({
    reference: input,
    actor,
    action: "TRANSLATION_PUBLISHED",
    operation: "publication",
    mutate: (dependencies) =>
      publishArticleTranslation(input, dependencies),
  });
}
