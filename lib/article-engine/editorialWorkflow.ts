import type { EditorialStatus } from "@/lib/generated/prisma/client";

const ALLOWED_TRANSITIONS: Record<
  EditorialStatus,
  readonly EditorialStatus[]
> = {
  DRAFT: ["REVIEW", "ARCHIVED"],
  AI_DRAFT: ["REVIEW", "ARCHIVED"],
  REVIEW: ["DRAFT", "APPROVED", "ARCHIVED"],
  APPROVED: ["REVIEW", "PUBLISHED", "ARCHIVED"],
  PUBLISHED: ["ARCHIVED"],
  ARCHIVED: ["DRAFT"],
};

export function canTransitionEditorialStatus(
  currentStatus: EditorialStatus,
  nextStatus: EditorialStatus,
): boolean {
  return ALLOWED_TRANSITIONS[
    currentStatus
  ].includes(nextStatus);
}

export function canPublishEditorialStatus(
  status: EditorialStatus,
): boolean {
  return (
    status === "APPROVED" ||
    status === "PUBLISHED"
  );
}