const MAX_FUTURE_DATE_OFFSET_MS =
  24 * 60 * 60 * 1_000;

export function normalizeObservationPublishedAt(
  date: Date | null,
  now = new Date(),
): Date | null {
  if (
    !date ||
    Number.isNaN(date.getTime()) ||
    date.getTime() >
      now.getTime() + MAX_FUTURE_DATE_OFFSET_MS
  ) {
    return null;
  }

  return date;
}
