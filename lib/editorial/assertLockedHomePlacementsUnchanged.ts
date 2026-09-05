import type { LockedHomePublication } from "./loadLockedHomePlacements";

export class LockedHomePlacementsChangedError extends Error {
  constructor() {
    super(
      "Les sélections humaines ont changé depuis la simulation. Relance la simulation avant d’appliquer la proposition.",
    );
    this.name = "LockedHomePlacementsChangedError";
  }
}

function placementSignature(placement: LockedHomePublication): string {
  return JSON.stringify([
    placement.publicationId,
    placement.articleId,
    placement.zone,
    placement.category,
    placement.sourceId,
    placement.priority,
    placement.startsAt?.getTime() ?? null,
    placement.endsAt?.getTime() ?? null,
    placement.updatedAt.getTime(),
  ]);
}

export function assertLockedHomePlacementsUnchanged(
  simulated: readonly LockedHomePublication[],
  current: readonly LockedHomePublication[],
): void {
  const simulatedSignatures = simulated.map(placementSignature).sort();
  const currentSignatures = current.map(placementSignature).sort();

  if (
    simulatedSignatures.length !== currentSignatures.length ||
    simulatedSignatures.some(
      (signature, index) => signature !== currentSignatures[index],
    )
  ) {
    throw new LockedHomePlacementsChangedError();
  }
}
