import type { EditorialStatus } from "@/lib/generated/prisma/client";

import {
  Badge,
  type BadgeVariant,
} from "@/components/admin/ui";

type EditorialStatusBadgeProps = {
  status: EditorialStatus;
};

const STATUS_LABELS: Record<
  EditorialStatus,
  string
> = {
  DRAFT: "Brouillon",
  AI_DRAFT: "Brouillon IA",
  REVIEW: "En relecture",
  APPROVED: "Approuvé",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
};

const STATUS_VARIANTS: Record<
  EditorialStatus,
  BadgeVariant
> = {
  DRAFT: "warning",
  AI_DRAFT: "info",
  REVIEW: "highlight",
  APPROVED: "success",
  PUBLISHED: "success",
  ARCHIVED: "default",
};

export default function EditorialStatusBadge({
  status,
}: EditorialStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}