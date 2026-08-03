import type {
  EditorialEventAction,
  EditorialStatus,
} from "@/lib/generated/prisma/client";
import type { AdminIdentity } from "@/lib/admin/requireAdmin";

type EditorialEventData = {
  action: EditorialEventAction;
  articleId: number;
  translationId?: number;
  actorId: string;
  actorEmail: string;
  fromStatus?: EditorialStatus;
  toStatus?: EditorialStatus;
  details?: string;
};

export type EditorialEventWriter = {
  editorialEvent: {
    create(input: { data: EditorialEventData }): Promise<unknown>;
  };
};

type EditorialEventDetails = Record<
  string,
  string | number | boolean | null
>;

export type RecordEditorialEventInput = {
  action: EditorialEventAction;
  articleId: number;
  translationId?: number;
  actor: AdminIdentity;
  fromStatus?: EditorialStatus;
  toStatus?: EditorialStatus;
  details?: EditorialEventDetails;
};

export async function recordEditorialEvent(
  client: EditorialEventWriter,
  input: RecordEditorialEventInput,
): Promise<void> {
  await client.editorialEvent.create({
    data: {
      action: input.action,
      articleId: input.articleId,
      translationId: input.translationId,
      actorId: input.actor.id,
      actorEmail: input.actor.email,
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      details: input.details
        ? JSON.stringify(input.details)
        : undefined,
    },
  });
}
