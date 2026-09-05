import type {
  EditorialEventAction,
  EditorialStatus,
} from "@/lib/generated/prisma/client";
import type { AdminIdentity } from "@/lib/admin/requireAdmin";

type EditorialEventData = {
  action: EditorialEventAction;
  articleId?: number;
  translationId?: number;
  actorId?: string;
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

type EditorialEventDetails = Record<string, unknown>;

export type RecordEditorialEventInput = {
  action: EditorialEventAction;
  articleId?: number;
  translationId?: number;
  actor: AdminIdentity;
  fromStatus?: EditorialStatus;
  toStatus?: EditorialStatus;
  details?: EditorialEventDetails;
};

export type RecordSystemEditorialEventInput = Omit<
  RecordEditorialEventInput,
  "actor"
>;

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
      details: input.details ? JSON.stringify(input.details) : undefined,
    },
  });
}

export async function recordSystemEditorialEvent(
  client: EditorialEventWriter,
  input: RecordSystemEditorialEventInput,
): Promise<void> {
  await client.editorialEvent.create({
    data: {
      action: input.action,
      articleId: input.articleId,
      translationId: input.translationId,
      actorEmail: "system@andorre-360.local",
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      details: input.details ? JSON.stringify(input.details) : undefined,
    },
  });
}
