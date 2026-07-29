import type { Prisma } from "@prisma/client";

type PublicationWithArticle = Prisma.PublicationGetPayload<{
  include: {
    article: true;
  };
}>;

type BuildEditorialStatsParams = {
  publications: PublicationWithArticle[];
  now: Date;
};

export function buildEditorialStats({
  publications,
  now,
}: BuildEditorialStatsParams) {
  const activePublications = publications.filter(
  (publication) => {
    if (!publication.active) {
      return false;
    }

    if (
      publication.startsAt &&
      publication.startsAt > now
    ) {
      return false;
    }

    if (
      publication.endsAt &&
      publication.endsAt < now
    ) {
      return false;
    }

    return true;
  }
);

const scheduledPublications = publications.filter(
  (publication) =>
    publication.active &&
    publication.startsAt !== null &&
    publication.startsAt > now
);

const facebookPublications = activePublications.filter(
  (publication) =>
    publication.channel === "facebook"
);

const whatsappPublications = activePublications.filter(
  (publication) =>
    publication.channel === "whatsapp"
);

const publicationGroups = new Map<string, number>();

activePublications.forEach((publication) => {
  const key = [
    publication.pageKey,
    publication.channel,
    publication.zone,
  ].join(":");

  publicationGroups.set(
    key,
    (publicationGroups.get(key) ?? 0) + 1
  );
});

const conflicts = Array.from(
  publicationGroups.values()
).filter((count) => count > 1).length;

return {
  activePublications,
  scheduledPublications,
  facebookPublications,
  whatsappPublications,
  conflicts,
};
}