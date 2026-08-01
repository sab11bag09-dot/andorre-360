export function isMultilingualPublicationEnabled(
  value = process.env.MULTILINGUAL_PUBLICATION_ENABLED,
): boolean {
  return value?.trim().toLowerCase() === "true";
}

export function assertMultilingualPublicationEnabled(
  value = process.env.MULTILINGUAL_PUBLICATION_ENABLED,
): void {
  if (!isMultilingualPublicationEnabled(value)) {
    throw new Error(
      "La publication multilingue est temporairement désactivée.",
    );
  }
}
