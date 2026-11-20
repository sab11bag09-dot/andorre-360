/**
 * Répartit les articles d’une rubrique dans les emplacements de sa page,
 * dans l’ordre du plan et sans trou : chaque article publié est affiché tant
 * qu’il reste des emplacements. Les derniers emplacements restent vides quand
 * les articles manquent.
 */
export function allocateRubricSlots<T, const Plan extends Record<string, number>>(
  items: readonly T[],
  plan: Plan,
): { [Slot in keyof Plan]: T[] } {
  const slots = {} as { [Slot in keyof Plan]: T[] };
  let cursor = 0;

  for (const slot of Object.keys(plan) as Array<keyof Plan & string>) {
    const count = plan[slot];

    if (!Number.isInteger(count) || count <= 0) {
      throw new Error(
        `Le nombre d’emplacements de « ${slot} » doit être un entier positif.`,
      );
    }

    slots[slot] = items.slice(cursor, cursor + count);
    cursor += count;
  }

  return slots;
}
